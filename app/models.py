import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from .database import Base


class RoleEnum(str, enum.Enum):
    learner = "Learner"
    coach = "Coach"
    educator = "Educator"
    admin = "Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.learner)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship(
        "UserProfile", back_populates="owner", uselist=False,
        cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    experience_level = Column(String, nullable=True)   # e.g. Beginner/Intermediate/Advanced
    goals = Column(String, nullable=True)               # free text
    preferred_topics = Column(String, nullable=True)    # comma-separated topics

    owner = relationship("User", back_populates="profile")
