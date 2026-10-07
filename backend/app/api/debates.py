from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.models import User, DebateSession
from backend.app.schemas.schemas import DebateSessionResponse, DebateSessionCreate, DebateSessionUpdate
from backend.app.core.dependencies import get_current_user

router = APIRouter(tags=["Debate Sessions"])

@router.post("/debates", response_model=DebateSessionResponse, status_code=status.HTTP_201_CREATED)
def create_debate(
    debate_in: DebateSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate = DebateSession(
        user_id=current_user.id,
        title=debate_in.title,
        topic=debate_in.topic,
        format=debate_in.format,
        position=debate_in.position,
        status=debate_in.status
    )
    db.add(debate)
    db.commit()
    db.refresh(debate)
    return debate


@router.get("/debates", response_model=List[DebateSessionResponse])
def list_debates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admins, Coaches, and Educators can view all debates, Learners view only their own
    if current_user.role in ["Admin", "Coach", "Educator"]:
        debates = db.query(DebateSession).all()
    else:
        debates = db.query(DebateSession).filter(DebateSession.user_id == current_user.id).all()
    return debates


@router.get("/debates/{id}", response_model=DebateSessionResponse)
def get_debate(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate = db.query(DebateSession).filter(DebateSession.id == id).first()
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )
    
    # Ownership authorization check
    if debate.user_id != current_user.id and current_user.role not in ["Admin", "Coach", "Educator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this debate session"
        )
        
    return debate


@router.put("/debates/{id}", response_model=DebateSessionResponse)
def update_debate(
    id: int,
    debate_in: DebateSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate = db.query(DebateSession).filter(DebateSession.id == id).first()
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )
        
    # Check permission (only creator or admin can update)
    if debate.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this debate session"
        )

    # Update only provided fields
    update_data = debate_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(debate, key, value)

    db.add(debate)
    db.commit()
    db.refresh(debate)
    return debate


@router.delete("/debates/{id}", status_code=status.HTTP_200_OK)
def delete_debate(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    debate = db.query(DebateSession).filter(DebateSession.id == id).first()
    if not debate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debate session not found"
        )
        
    # Check permission (only creator or admin can delete)
    if debate.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this debate session"
        )

    db.delete(debate)
    db.commit()
    return {"detail": "Debate session successfully deleted"}
