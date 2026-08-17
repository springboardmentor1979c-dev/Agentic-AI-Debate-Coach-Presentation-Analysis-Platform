from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    topic = Column(String, nullable=False)

    stance = Column(String)

    mode = Column(String)

    status = Column(String, default="Pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")