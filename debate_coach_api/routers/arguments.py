from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Argument, DebateSession
from schemas.schemas import ArgumentCreate, ArgumentOut, FallacyOut, CounterargumentOut
from utils.auth import get_current_user
from services.analysis import analyze_argument, detect_fallacies, generate_counterarguments
from services.agent_orchestrator import run_full_analysis_pipeline
from services.kafka_producer import publish_analysis_event

router = APIRouter(prefix="/arguments", tags=["Argument Analysis"])


@router.get("/session/{session_id}", response_model=list[ArgumentOut])
def get_session_arguments(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Argument).filter(Argument.session_id == session_id).all()


@router.post("/", response_model=ArgumentOut, status_code=201)
def submit_argument(
    payload: ArgumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    arg = Argument(**payload.model_dump(), speaker_id=current_user.id)
    db.add(arg)
    db.commit()
    db.refresh(arg)

    # Run LLM-enhanced analysis
    analyze_argument(db, arg, use_llm=True)

    # Publish event to Kafka (no-op if Kafka disabled)
    publish_analysis_event(arg.session_id or 0, arg.id, current_user.id)
    return arg


@router.post("/{argument_id}/full-analysis")
def full_pipeline_analysis(
    argument_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run the full agentic pipeline: Speech → Argument → Fallacy → Rebuttal agents."""
    arg = db.query(Argument).filter(Argument.id == argument_id).first()
    if not arg:
        raise HTTPException(status_code=404, detail="Argument not found")

    session = db.query(DebateSession).filter(DebateSession.id == arg.session_id).first()
    topic = session.topic if session else "General debate"
    position = arg.position or "pro"

    result = run_full_analysis_pipeline(arg.content, topic, position, db, arg.session_id)
    return result


@router.get("/{argument_id}/fallacies", response_model=list[FallacyOut])
def get_fallacies(argument_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    arg = db.query(Argument).filter(Argument.id == argument_id).first()
    if not arg:
        raise HTTPException(status_code=404, detail="Argument not found")
    return detect_fallacies(db, arg, use_llm=True)


@router.get("/{argument_id}/counterarguments", response_model=list[CounterargumentOut])
def get_counterarguments(argument_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    arg = db.query(Argument).filter(Argument.id == argument_id).first()
    if not arg:
        raise HTTPException(status_code=404, detail="Argument not found")
    session = db.query(DebateSession).filter(DebateSession.id == arg.session_id).first()
    topic = session.topic if session else ""
    return generate_counterarguments(db, arg, topic=topic, use_llm=True)
