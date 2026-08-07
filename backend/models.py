from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, field_validator

Role = Literal["learner", "coach", "educator", "admin"]


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = "learner"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    created_at: str


class ProfileIn(BaseModel):
    experience: str
    goals: str
    preferred_topics: str  # comma-separated, e.g. "Python,ML,FastAPI"


class ProfileOut(BaseModel):
    id: int
    user_id: int
    experience: str | None
    goals: str | None
    preferred_topics: str | None
    updated_at: str
