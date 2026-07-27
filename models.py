from pydantic import BaseModel
from typing import Optional, List

# =========================
# USER REGISTRATION
# =========================

class UserRegister(BaseModel):
    username: str
    password: str
    role: str


# =========================
# USER LOGIN
# =========================

class UserLogin(BaseModel):
    username: str
    password: str


# =========================
# PROFILE CREATION
# =========================

class Profile(BaseModel):
    name: str
    experience_level: str
    goals: str
    preferred_topics: str
    presentation_domains: Optional[str] = ""
    coaching_preferences: Optional[str] = ""
    communication_skill_tracking: Optional[str] = ""


# =========================
# PROFILE UPDATE
# =========================

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    experience_level: Optional[str] = None
    goals: Optional[str] = None
    preferred_topics: Optional[str] = None
    presentation_domains: Optional[str] = None
    coaching_preferences: Optional[str] = None
    communication_skill_tracking: Optional[str] = None


# =========================
# DEBATE SESSION
# =========================

class DebateSessionCreate(BaseModel):
    topic: str
    format: str
    position: str
    difficulty: str


# =========================
# TURN SUBMISSION
# =========================

class TurnSubmit(BaseModel):
    content: str