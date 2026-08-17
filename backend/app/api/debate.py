from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.debate import DebateSession

router = APIRouter(
    prefix="/debate",
    tags=["Debate"]
)


@router.post("/create")
def create_debate(
    topic: str,
    stance: str,
    mode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    debate = DebateSession(
        user_id=current_user.id,
        topic=topic,
        stance=stance,
        mode=mode,
        status="Pending",
    )

    db.add(debate)
    db.commit()
    db.refresh(debate)

    return {
        "message": "Debate session created successfully",
        "session": {
            "id": debate.id,
            "topic": debate.topic,
            "stance": debate.stance,
            "mode": debate.mode,
            "status": debate.status,
        },
    }


@router.get("/my-sessions")
def my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == current_user.id)
        .order_by(DebateSession.created_at.desc())
        .all()
    )

    return sessions


@router.get("/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    debate = (
        db.query(DebateSession)
        .filter(
            DebateSession.id == session_id,
            DebateSession.user_id == current_user.id,
        )
        .first()
    )

    if not debate:
        raise HTTPException(status_code=404, detail="Session not found")

    return debate


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    debate = (
        db.query(DebateSession)
        .filter(
            DebateSession.id == session_id,
            DebateSession.user_id == current_user.id,
        )
        .first()
    )

    if not debate:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(debate)
    db.commit()

    return {"message": "Session deleted successfully"}