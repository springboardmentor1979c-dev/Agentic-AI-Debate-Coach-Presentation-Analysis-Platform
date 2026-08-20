from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, DebateSession, RoleEnum
from schemas.schemas import DebateSessionCreate, DebateSessionOut
from utils.auth import get_current_user, require_roles

router = APIRouter(prefix="/debates", tags=["Debate Sessions"])


@router.post("/", response_model=DebateSessionOut, status_code=201)
def create_session(
    payload: DebateSessionCreate,
    current_user: User = Depends(require_roles(RoleEnum.learner, RoleEnum.coach, RoleEnum.educator, RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    session = DebateSession(**payload.model_dump(), creator_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=list[DebateSessionOut])
def list_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(DebateSession).filter(DebateSession.creator_id == current_user.id).all()


@router.get("/{session_id}", response_model=DebateSessionOut)
def get_session(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}/status")
def update_status(
    session_id: int,
    status: str,
    current_user: User = Depends(require_roles(RoleEnum.coach, RoleEnum.educator, RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}
