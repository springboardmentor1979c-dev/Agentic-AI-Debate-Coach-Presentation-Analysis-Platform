import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, DebateSession, DebateRound, CounterArgument, Coaching, LearningPlan, PerformanceHistory
from backend.app.core.dependencies import get_current_user

# Import AI Workflow/Services
from backend.app.ai.workflow.workflows import build_debate_simulation_graph

logger = logging.getLogger("debate_coach_api_debate")

router = APIRouter(prefix="/debate", tags=["Debate Simulation"])

debate_workflow = build_debate_simulation_graph()

@router.post("/start", status_code=status.HTTP_201_CREATED)
def start_debate(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = body.get("topic")
    debate_format = body.get("format", "One-on-One")
    difficulty = body.get("difficulty", "Intermediate")
    personality = body.get("personality", "Friendly Coach")
    position = body.get("position", "Affirmative")  # User stance
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    # Create new DebateSession
    session = DebateSession(
        user_id=current_user.id,
        title=f"Debate on: {topic[:50]}",
        topic=topic,
        format=debate_format,
        position=position,
        status="In Progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Determine AI Stance (opposite of User's)
    ai_stance = "Negative" if position.lower() == "affirmative" else "Affirmative"

    # Generate AI Opening Statement
    from backend.app.ai.debate_simulation.debate_opponent import DebateOpponent
    opponent = DebateOpponent()
    opening_data = opponent.generate_opening(
        topic=topic,
        format_name=debate_format,
        stance=ai_stance,
        personality=personality,
        difficulty=difficulty
    )

    # Log opening round
    opening_round = DebateRound(
        session_id=session.id,
        speaker="ai",
        message=opening_data.get("opening_statement", ""),
        round_number=1
    )
    db.add(opening_round)
    db.commit()

    return {
        "session_id": session.id,
        "topic": topic,
        "format": debate_format,
        "difficulty": difficulty,
        "personality": personality,
        "position": position,
        "ai_stance": ai_stance,
        "ai_opening": opening_data.get("opening_statement"),
        "key_points": opening_data.get("key_points", [])
    }


@router.post("/respond")
def respond_debate(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = body.get("session_id")
    user_message = body.get("message")
    
    if not session_id or not user_message:
        raise HTTPException(status_code=400, detail="session_id and message are required")

    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    # Retrieve all rounds to compute context history and current round number
    past_rounds = db.query(DebateRound).filter(DebateRound.session_id == session_id).order_by(DebateRound.round_number.asc()).all()
    round_num = len(past_rounds) + 1

    # Log user statement
    user_round = DebateRound(
        session_id=session_id,
        speaker="user",
        message=user_message,
        round_number=round_num
    )
    db.add(user_round)
    db.commit()
    db.refresh(user_round)

    # Prepare historical context for LangGraph execution
    history_list = [{"speaker": r.speaker, "message": r.message} for r in past_rounds]
    ai_stance = "Negative" if session.position.lower() == "affirmative" else "Affirmative"

    # Invoke debate workflow
    state_input = {
        "session_id": session_id,
        "topic": session.topic,
        "format": session.format,
        "stance": ai_stance,
        "difficulty": "Intermediate",
        "personality": "Friendly Coach",
        "user_input": user_message,
        "history": history_list
    }

    try:
        output_state = debate_workflow.invoke(state_input)
        rebuttal_data = output_state.get("rebuttal", {})
        rebuttal_text = rebuttal_data.get("rebuttal", "Interesting argument, let us continue.")

        # Log AI Rebuttal Round
        ai_round = DebateRound(
            session_id=session_id,
            speaker="ai",
            message=rebuttal_text,
            round_number=round_num + 1
        )
        db.add(ai_round)
        db.commit()
        db.refresh(ai_round)

        # Save Counterarguments
        counterarguments = output_state.get("counterarguments", [])
        for c in counterarguments:
            ca_record = CounterArgument(
                debate_round_id=user_round.id,
                counter_argument=c.get("counter_argument", ""),
                counter_type=c.get("counter_type", "logical"),
                strength=c.get("strength", 50.0)
            )
            db.add(ca_record)

        # Save Coaching feedback for the round
        coaching_data = output_state.get("coaching", {})
        coach_scores = coaching_data.get("scores", {})
        coaching_record = Coaching(
            session_id=session_id,
            strengths=", ".join(coaching_data.get("strengths", [])),
            weaknesses=", ".join(coaching_data.get("weaknesses", [])),
            recommendations=", ".join(coaching_data.get("recommendations", [])),
            skill_focus=coaching_data.get("skill_focus", "Reasoning Structure")
        )
        db.add(coaching_record)

        # Save Performance Record
        perf_data = output_state.get("performance", {})
        avg_scores = perf_data.get("average_scores", {})
        perf_record = PerformanceHistory(
            user_id=current_user.id,
            debate_score=avg_scores.get("debate", 70.0),
            communication_score=avg_scores.get("communication", 70.0),
            critical_thinking_score=avg_scores.get("critical_thinking", 70.0)
        )
        db.add(perf_record)
        db.commit()

        return {
            "rebuttal": rebuttal_text,
            "counterarguments": counterarguments,
            "coaching": coaching_data,
            "performance": perf_data
        }
    except Exception as e:
        logger.error(f"Error in respond_debate endpoint: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/end")
def end_debate(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    session.status = "Completed"
    
    # Generate AI closing statement
    from backend.app.ai.debate_simulation.debate_opponent import DebateOpponent
    opponent = DebateOpponent()
    past_rounds = db.query(DebateRound).filter(DebateRound.session_id == session_id).order_by(DebateRound.round_number.asc()).all()
    history_list = [{"speaker": r.speaker, "message": r.message} for r in past_rounds]
    
    ai_stance = "Negative" if session.position.lower() == "affirmative" else "Affirmative"
    closing_data = opponent.generate_closing(
        topic=session.topic,
        format_name=session.format,
        stance=ai_stance,
        personality="Friendly Coach",
        difficulty="Intermediate",
        history=history_list
    )
    
    # Log AI closing round
    closing_round = DebateRound(
        session_id=session_id,
        speaker="ai",
        message=closing_data.get("closing_statement", ""),
        round_number=len(past_rounds) + 1
    )
    db.add(closing_round)
    db.commit()

    return {
        "status": "Completed",
        "ai_closing": closing_data.get("closing_statement"),
        "summary_points": closing_data.get("summary_points", [])
    }


@router.get("/history")
def list_debate_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(DebateSession).filter(DebateSession.user_id == current_user.id).order_by(DebateSession.id.desc()).all()
    return sessions


# Define /performance and /counterargument specific routes BEFORE /{id} to prevent path matching conflicts
@router.get("/performance")
def get_performance_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(PerformanceHistory).filter(PerformanceHistory.user_id == current_user.id).order_by(PerformanceHistory.created_at.asc()).all()
    
    dict_records = []
    for r in records:
        dict_records.append({
            "debate_score": r.debate_score,
            "communication_score": r.communication_score,
            "critical_thinking_score": r.critical_thinking_score,
            "created_at": r.created_at
        })

    from backend.app.ai.performance_engine.tracker import PerformanceEngine
    tracker = PerformanceEngine()
    trends = tracker.evaluate_trends(dict_records)

    return {
        "history": records,
        "trends": trends
    }


@router.post("/counterargument")
def generate_counterargument(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Argument text is required")
    from backend.app.ai.counterargument_engine.counter_generator import CounterGenerator
    generator = CounterGenerator()
    counters = generator.generate(text)
    return {"counterarguments": counters}


@router.post("/coach")
def generate_coaching(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    from backend.app.ai.coach_engine.coach import CoachEngine
    coach = CoachEngine()
    feedback = coach.evaluate_round([{"speaker": "user", "message": text}])
    return feedback


@router.post("/learning-plan")
def generate_learning_plan(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weaknesses = body.get("weaknesses", [])
    goal = body.get("goal", "Public Speaking mastery")
    difficulty = body.get("difficulty", "Intermediate")
    duration = body.get("duration_days", 7)
    
    from backend.app.ai.learning_engine.planner import LearningEngine
    planner = LearningEngine()
    plan_data = planner.generate_plan(weaknesses, goal, difficulty, duration)
    
    import json
    plan_record = LearningPlan(
        user_id=current_user.id,
        goal=goal,
        difficulty=difficulty,
        weekly_plan=json.dumps(plan_data.get("weekly_plan", [])),
        recommended_exercises=json.dumps(plan_data.get("recommended_exercises", []))
    )
    db.add(plan_record)
    db.commit()
    db.refresh(plan_record)

    return plan_data


@router.get("/{id}")
def get_debate_session_detail(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(DebateSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")
        
    if session.user_id != current_user.id and current_user.role not in ["Admin", "Coach"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    rounds = db.query(DebateRound).filter(DebateRound.session_id == id).order_by(DebateRound.round_number.asc()).all()
    coaching = db.query(Coaching).filter(Coaching.session_id == id).all()

    return {
        "session": session,
        "rounds": rounds,
        "coaching": coaching
    }
