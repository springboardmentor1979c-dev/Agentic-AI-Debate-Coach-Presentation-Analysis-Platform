from pydantic import BaseModel
from typing import Optional


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


# =========================
# PROFILE UPDATE
# =========================

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    experience_level: Optional[str] = None
    goals: Optional[str] = None
    preferred_topics: Optional[str] = None