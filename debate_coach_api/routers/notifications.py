from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Notification
from schemas.schemas import NotificationOut
from utils.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationOut])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()


@router.patch("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}
