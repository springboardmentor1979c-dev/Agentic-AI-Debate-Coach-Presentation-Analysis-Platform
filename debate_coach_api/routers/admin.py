from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, RoleEnum
from schemas.schemas import UserOut
from utils.auth import get_current_user, require_roles

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    return db.query(User).all()


@router.patch("/users/{user_id}/role")
def change_role(
    user_id: int,
    role: RoleEnum,
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"Role updated to {role}"}


@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = False
        db.commit()
    return {"message": "User deactivated"}
