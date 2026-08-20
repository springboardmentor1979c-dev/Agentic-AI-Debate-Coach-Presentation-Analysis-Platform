"""AI Debate Simulation — multi-turn debate against an LLM opponent."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import User, AIDebateSession, DebateFormat
from utils.auth import get_current_user
from services.llm_engine import call_llm, parse_llm_json

router = APIRouter(prefix="/ai-debate", tags=["AI Debate Simulation"])


class StartDebateRequest(BaseModel):
    topic: str
    user_position: str = "pro"   # pro | con
    debate_format: DebateFormat = DebateFormat.ai_simulation


class DebateTurnRequest(BaseModel):
    session_id: int
    user_argument: str


@router.post("/start", status_code=201)
def start_ai_debate(
    payload: StartDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = AIDebateSession(
        user_id=current_user.id,
        topic=payload.topic,
        user_position=payload.user_position,
        debate_format=payload.debate_format,
        conversation_history=json.dumps([]),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # AI opens with a context-setting statement
    ai_position = "con" if payload.user_position == "pro" else "pro"
    opening_prompt = f"""You are an expert debater taking the {ai_position} position on: "{payload.topic}"

Open the debate with a strong 2-3 sentence opening statement from the {ai_position} side.
Be direct, confident, and use one piece of evidence or reasoning.
Respond in JSON with key "ai_response"."""

    response, _, _ = call_llm(opening_prompt, "You are a championship-level debate opponent.")
    result = parse_llm_json(response)
    ai_opening = result.get("ai_response", f"I will argue the {ai_position} position on this topic.")

    history = [{"role": "ai", "position": ai_position, "content": ai_opening, "turn": 0}]
    session.conversation_history = json.dumps(history)
    session.turn_count = 1
    db.commit()

    return {
        "session_id": session.id,
        "topic": payload.topic,
        "your_position": payload.user_position,
        "ai_position": ai_position,
        "ai_opening": ai_opening,
        "instructions": f"Respond with your {payload.user_position} argument using POST /ai-debate/turn",
    }


@router.post("/turn")
def debate_turn(
    payload: DebateTurnRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AIDebateSession).filter(
        AIDebateSession.id == payload.session_id,
        AIDebateSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="AI debate session not found")
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Debate already completed")

    history = json.loads(session.conversation_history)
    ai_position = "con" if session.user_position == "pro" else "pro"

    # Add user turn
    history.append({
        "role": "user",
        "position": session.user_position,
        "content": payload.user_argument,
        "turn": session.turn_count,
    })

    # Build conversation context for AI
    context = "\n".join([
        f"[Turn {t['turn']}] {t['role'].upper()} ({t['position']}): {t['content']}"
        for t in history[-6:]   # last 6 turns for context window
    ])

    ai_prompt = f"""You are debating the {ai_position} position on: "{session.topic}"

Conversation so far:
{context}

The user just argued: "{payload.user_argument}"

Respond with a strong 2-4 sentence rebuttal from the {ai_position} side.
- Directly address their argument
- Provide a counter-point with reasoning or evidence
- Advance your own position

Respond in JSON with keys: ai_response, strategy_used"""

    response, _, _ = call_llm(ai_prompt, "You are a championship debate opponent. Be sharp, logical, and persuasive.")
    result = parse_llm_json(response)
    ai_response = result.get("ai_response", "I maintain my position and challenge your reasoning.")

    history.append({
        "role": "ai",
        "position": ai_position,
        "content": ai_response,
        "turn": session.turn_count + 1,
    })

    session.conversation_history = json.dumps(history)
    session.turn_count += 2
    db.commit()

    return {
        "turn": session.turn_count,
        "ai_response": ai_response,
        "strategy": result.get("strategy_used", "rebuttal"),
        "total_turns": session.turn_count,
        "tip": "Use POST /ai-debate/end to finish and get your score." if session.turn_count >= 6 else None,
    }


@router.post("/end/{session_id}")
def end_ai_debate(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AIDebateSession).filter(
        AIDebateSession.id == session_id,
        AIDebateSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    history = json.loads(session.conversation_history)
    user_turns = [t["content"] for t in history if t["role"] == "user"]
    combined = " ".join(user_turns)

    score_prompt = f"""Evaluate this debater's performance in a debate on: "{session.topic}"
Position: {session.user_position}
Their arguments: {combined[:1000]}
Number of turns: {len(user_turns)}

Score from 0-10 and provide feedback.
Respond in JSON with keys: score, feedback, strengths (list), improvements (list)."""

    response, _, _ = call_llm(score_prompt)
    result = parse_llm_json(response)
    final_score = float(result.get("score", 6.0))

    session.final_score = final_score
    session.status = "completed"
    db.commit()

    return {
        "session_id": session_id,
        "topic": session.topic,
        "turns_completed": len(user_turns),
        "final_score": final_score,
        "feedback": result.get("feedback", ""),
        "strengths": result.get("strengths", []),
        "improvements": result.get("improvements", []),
    }


@router.get("/history")
def ai_debate_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(AIDebateSession).filter(AIDebateSession.user_id == current_user.id).all()
    return [
        {
            "id": s.id,
            "topic": s.topic,
            "position": s.user_position,
            "turns": s.turn_count,
            "score": s.final_score,
            "status": s.status,
            "created_at": s.created_at,
        }
        for s in sessions
    ]
