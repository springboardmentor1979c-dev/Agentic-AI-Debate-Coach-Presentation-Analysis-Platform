from sqlalchemy.orm import Session
from app.models.message import Message

def save_message(db: Session, debate_id: int, sender: str, message: str):
    msg = Message(
        debate_id=debate_id,
        sender=sender,
        message=message,
    )

    db.add(msg)
    db.commit()
    db.refresh(msg)

    return msg