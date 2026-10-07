import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, Argument, Fallacy, Score, Feedback, DebateSession
from backend.app.core.dependencies import get_current_user

# Import AI Workflow/Services
from backend.app.ai.workflow.workflows import build_argument_analysis_graph

logger = logging.getLogger("debate_coach_api_analysis")

router = APIRouter(tags=["Argument Analysis"])

# StateGraph execution runner
analysis_workflow = build_argument_analysis_graph()

@router.post("/analyze", status_code=status.HTTP_201_CREATED)
def analyze_argument(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text = body.get("text")
    session_id = body.get("debate_session_id")
    
    if not text:
        raise HTTPException(status_code=400, detail="Argument 'text' is required")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="debate_session_id is required")

    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    try:
        # Execute LangGraph Argument Analysis workflow
        initial_state = {"text": text}
        output_state = analysis_workflow.invoke(initial_state)
        
        # Save Argument details to DB
        claims_data = output_state.get("claims", {})
        argument_record = Argument(
            debate_session_id=session_id,
            claim=claims_data.get("claim", text[:255]),
            premise=claims_data.get("premise", "No premise extracted"),
            evidence=claims_data.get("evidence", "No evidence extracted"),
            confidence=claims_data.get("confidence", 0.5)
        )
        db.add(argument_record)
        db.commit()
        db.refresh(argument_record)

        # Save Fallacies detected
        fallacies = output_state.get("fallacies", [])
        for f in fallacies:
            fallacy_record = Fallacy(
                argument_id=argument_record.id,
                fallacy_type=f.get("fallacy_type", "General Fallacy"),
                severity=f.get("severity", "Medium"),
                description=f.get("description", ""),
                correction=f.get("correction"),
                highlighted_sentence=f.get("highlighted_sentence"),
                example=f.get("example")
            )
            db.add(fallacy_record)

        # Save Scores
        scores_data = output_state.get("scores", {})
        score_record = Score(
            debate_session_id=session_id,
            clarity=scores_data.get("clarity", 70.0),
            relevance=scores_data.get("relevance", 70.0),
            evidence_strength=scores_data.get("evidence_strength", 70.0),
            logical_consistency=scores_data.get("logical_consistency", 70.0),
            persuasiveness=scores_data.get("persuasiveness", 70.0),
            overall_score=scores_data.get("overall_score", 70.0)
        )
        db.add(score_record)

        # Save Feedback
        feedback_data = output_state.get("feedback", {})
        feedback_record = Feedback(
            debate_session_id=session_id,
            strengths="\n".join(feedback_data.get("strengths", ["Delivery structure"])),
            weaknesses="\n".join(feedback_data.get("weaknesses", ["General logic support"])),
            recommendations="\n".join(feedback_data.get("improvement_tips", ["Incorporate statistics"]))
        )
        db.add(feedback_record)
        db.commit()

        # Output payload
        return {
            "argument_id": argument_record.id,
            "claims": claims_data,
            "reasoning": output_state.get("reasoning", {}),
            "fallacies": fallacies,
            "scores": scores_data,
            "feedback": feedback_data,
            "improved": output_state.get("improved", {}),
        }
    except Exception as e:
        logger.error(f"Error in analyze_argument endpoint: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fallacies")
def detect_fallacies(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Argument 'text' is required")
    
    from backend.app.ai.fallacy_detection.fallacy_detector import FallacyDetector
    detector = FallacyDetector()
    fallacies = detector.detect(text)
    return {"fallacies": fallacies}


@router.post("/score")
def score_argument(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Argument 'text' is required")
        
    from backend.app.ai.scoring_engine.quality_scorer import QualityScorer
    scorer = QualityScorer()
    scores = scorer.score_from_analysis(text, [], {"overall_quality": "Average"})
    return {"scores": scores}


@router.post("/feedback")
def generate_feedback(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Argument 'text' is required")

    from backend.app.ai.feedback_engine.feedback_generator import FeedbackGenerator
    generator = FeedbackGenerator()
    feedback = generator.generate(text)
    return feedback


@router.post("/improve")
def improve_argument(
    body: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Argument 'text' is required")

    from backend.app.ai.argument_analysis.argument_improver import ArgumentImprover
    improver = ArgumentImprover()
    result = improver.improve(text)
    return result


@router.get("/analysis/{id}")
def get_argument_analysis(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    arg = db.query(Argument).filter(Argument.id == id).first()
    if not arg:
        raise HTTPException(status_code=404, detail="Argument record not found")
    
    # Check permissions
    session = db.query(DebateSession).filter(DebateSession.id == arg.debate_session_id).first()
    if session and session.user_id != current_user.id and current_user.role not in ["Admin", "Coach"]:
         raise HTTPException(status_code=403, detail="Unauthorized access")

    fallacies = db.query(Fallacy).filter(Fallacy.argument_id == arg.id).all()
    scores = db.query(Score).filter(Score.debate_session_id == arg.debate_session_id).order_by(Score.id.desc()).first()
    feedback = db.query(Feedback).filter(Feedback.debate_session_id == arg.debate_session_id).order_by(Feedback.id.desc()).first()

    return {
        "argument_id": arg.id,
        "debate_session_id": arg.debate_session_id,
        "claim": arg.claim,
        "premise": arg.premise,
        "evidence": arg.evidence,
        "confidence": arg.confidence,
        "created_at": arg.created_at,
        "fallacies": fallacies,
        "scores": scores,
        "feedback": feedback
    }


@router.get("/history")
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all arguments created by the user across their debate sessions
    results = db.query(Argument).join(DebateSession).filter(DebateSession.user_id == current_user.id).order_by(Argument.id.desc()).all()
    return results
