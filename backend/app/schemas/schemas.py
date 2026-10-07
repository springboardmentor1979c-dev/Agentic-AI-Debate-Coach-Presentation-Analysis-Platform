from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

# --- User & Auth Schemas ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Literal["Learner", "Coach", "Educator", "Admin"] = "Learner"

    @field_validator("name", "password")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Value cannot be empty or whitespace only")
        return value.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


# --- User Profile Schemas ---

class UserProfileBase(BaseModel):
    experience_level: Literal["Beginner", "Intermediate", "Advanced", "Expert"] = "Beginner"
    preferred_topics: str = ""
    presentation_domains: str = ""
    learning_goals: str = ""
    coaching_preferences: str = ""

    @field_validator("preferred_topics", "presentation_domains", "learning_goals", "coaching_preferences")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        return value.strip()


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    name: Optional[str] = None


class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


# --- Debate Session Schemas ---

class DebateSessionBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    topic: str = Field(..., min_length=3, max_length=500)
    format: Literal["One-on-One", "Oxford", "Parliamentary", "Policy", "Public Forum"] = "One-on-One"
    position: Literal["Affirmative", "Negative"] = "Affirmative"
    status: Literal["Scheduled", "In Progress", "Completed"] = "Scheduled"

    @field_validator("title", "topic")
    @classmethod
    def validate_non_empty_strings(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return value.strip()


class DebateSessionCreate(DebateSessionBase):
    pass


class DebateSessionUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    format: Optional[Literal["One-on-One", "Oxford", "Parliamentary", "Policy", "Public Forum"]] = None
    position: Optional[Literal["Affirmative", "Negative"]] = None
    status: Optional[Literal["Scheduled", "In Progress", "Completed"]] = None

    @field_validator("title", "topic")
    @classmethod
    def validate_non_empty_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and (not value or not value.strip()):
            raise ValueError("Field cannot be empty or whitespace only")
        return value.strip() if value is not None else None


class DebateSessionResponse(DebateSessionBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
