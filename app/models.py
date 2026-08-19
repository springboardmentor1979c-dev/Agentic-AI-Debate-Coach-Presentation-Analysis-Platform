from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="Learner")

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    debates = relationship(
        "DebateHistory",
        back_populates="user",
        cascade="all, delete"
    )


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    experience_level = Column(String(100))
    goals = Column(String(255))
    preferred_topics = Column(String(255))

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True
    )

    user = relationship(
        "User",
        back_populates="profile"
    )


class DebateHistory(Base):
    __tablename__ = "debate_history"

    id = Column(Integer, primary_key=True, index=True)

    topic = Column(String(255))

    ai_argument = Column(Text)

    user_argument = Column(Text)

    ai_feedback = Column(Text)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    user = relationship(
        "User",
        back_populates="debates"
    )