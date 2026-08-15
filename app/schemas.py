from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from .models import RoleEnum


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.learner


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ---------- Profile ----------

class ProfileCreate(BaseModel):
    experience_level: Optional[str] = None
    goals: Optional[str] = None
    preferred_topics: Optional[str] = None


class ProfileOut(BaseModel):
    experience_level: Optional[str] = None
    goals: Optional[str] = None
    preferred_topics: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- Debate Coach ----------

class ArgumentSubmit(BaseModel):
    topic: str
    argument_text: str

class AnalysisResult(BaseModel):
    claim_score: int
    evidence_score: int
    rebuttal_score: int
    verdict_score: int
    feedback: str
    fallacies_detected: list[str]
