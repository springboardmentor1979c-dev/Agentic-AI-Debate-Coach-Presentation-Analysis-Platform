from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class DebateSession(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty = Column(String(20))
    created_by = Column(Integer, ForeignKey("users.id"))

    creator = relationship("User")