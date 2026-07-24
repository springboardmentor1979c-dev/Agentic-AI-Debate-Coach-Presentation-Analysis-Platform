from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from models.models import RoleEnum, ExperienceLevel, DebateFormat


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.learner


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    experience_level: ExperienceLevel = ExperienceLevel.beginner
    goals: str = ""
    preferred_topics: str = ""
    coaching_preferences: str = ""
    presentation_domains: str = ""


class ProfileOut(ProfileCreate):
    id: int
    user_id: int
    debate_count: int
    presentation_count: int
    avg_debate_score: float
    avg_presentation_score: float
    total_practice_minutes: int
    streak_days: int

    class Config:
        from_attributes = True


# ── Debate ────────────────────────────────────────────────────────────────────

class DebateSessionCreate(BaseModel):
    topic: str
    format: DebateFormat = DebateFormat.one_on_one
    scheduled_at: Optional[datetime] = None
    participant_ids: str = ""


class DebateSessionOut(BaseModel):
    id: int
    topic: str
    format: DebateFormat
    creator_id: int
    status: str
    scheduled_at: Optional[datetime] = None
    duration_minutes: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Argument ──────────────────────────────────────────────────────────────────

class ArgumentCreate(BaseModel):
    session_id: int
    content: str
    claim: str = ""
    evidence: str = ""
    position: str = "pro"


class ArgumentOut(BaseModel):
    id: int
    session_id: int
    speaker_id: int
    content: str
    claim: str
    evidence: str
    position: str
    clarity_score: float
    relevance_score: float
    evidence_strength: float
    logical_consistency: float
    persuasiveness: float
    sentiment: str
    keywords: str

    class Config:
        from_attributes = True


# ── Fallacy ───────────────────────────────────────────────────────────────────

class FallacyOut(BaseModel):
    id: int
    argument_id: int
    fallacy_type: str
    explanation: str
    correction: str
    confidence: float
    detected_by: str

    class Config:
        from_attributes = True


# ── Counterargument ───────────────────────────────────────────────────────────

class CounterargumentOut(BaseModel):
    id: int
    argument_id: int
    counter_type: str
    content: str
    strategy: str
    generated_by: str

    class Config:
        from_attributes = True


# ── Presentation ──────────────────────────────────────────────────────────────

class PresentationCreate(BaseModel):
    title: str = "Untitled"
    transcript: str


class PresentationOut(BaseModel):
    id: int
    user_id: int
    title: str
    speech_pace: float
    filler_word_count: int
    confidence_score: float
    clarity_score: float
    engagement_score: float
    emotion_detected: str
    pitch_variation: float
    overall_score: float
    feedback: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Scoring ───────────────────────────────────────────────────────────────────

class DebateScoreCreate(BaseModel):
    session_id: int
    user_id: int
    argument_quality: float
    evidence_usage: float
    logical_consistency: float
    rebuttal_effectiveness: float
    communication_skills: float
    feedback: str = ""


class DebateScoreOut(DebateScoreCreate):
    id: int
    overall_score: float
    percentile_rank: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notification ──────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    channel: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
