from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from app.core.database import Base

# ==================== SQLAlchemy ORM Models ====================

class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Learner") # Learner, Debate Coach, Educator, Administrator
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("DBUserProfile", back_populates="user", uselist=False)
    debates = relationship("DBDebateSession", back_populates="user")
    presentations = relationship("DBPresentationAnalysis", back_populates="user")

class DBUserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    experience_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced, Elite
    preferred_topics = Column(JSON, default=list) # e.g. ["AI Ethics", "Economic Policy", "Climate Policy"]
    presentation_domains = Column(JSON, default=list) # e.g. ["Tech Pitching", "Academic Keynotes", "Public Advocacy"]
    learning_goals = Column(JSON, default=list)
    coaching_preferences = Column(String(250), default="Socratic & Constructive")
    
    # Skill Metrics (0 - 100)
    argument_quality_score = Column(Float, default=78.5)
    evidence_usage_score = Column(Float, default=72.0)
    logical_consistency_score = Column(Float, default=81.0)
    rebuttal_effectiveness_score = Column(Float, default=75.5)
    communication_skills_score = Column(Float, default=84.0)
    overall_performance_score = Column(Float, default=77.8)
    
    user = relationship("DBUser", back_populates="profile")

class DBDebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String(500), nullable=False)
    format = Column(String(100), default="One-on-One") # One-on-One, Parliamentary, Oxford, Policy, Public Forum, AI Debate Simulation
    user_position = Column(String(50), default="Affirmative") # Affirmative / Opposition
    opponent_type = Column(String(100), default="AI Coach")
    status = Column(String(50), default="Completed") # Scheduled, In-Progress, Completed
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer, default=900)
    turns = Column(JSON, default=list)
    
    overall_score = Column(Float, default=82.4)
    arg_quality_score = Column(Float, default=84.0)
    evidence_score = Column(Float, default=80.0)
    logic_score = Column(Float, default=85.0)
    rebuttal_score = Column(Float, default=78.0)
    communication_score = Column(Float, default=83.0)
    
    user = relationship("DBUser", back_populates="debates")

class DBPresentationAnalysis(Base):
    __tablename__ = "presentation_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    domain = Column(String(100), default="General Presentation")
    duration_seconds = Column(Float, default=180.0)
    words_per_minute = Column(Float, default=145.0)
    filler_word_count = Column(Integer, default=6)
    filler_words_detected = Column(JSON, default=list)
    confidence_score = Column(Float, default=86.5)
    clarity_score = Column(Float, default=88.0)
    engagement_score = Column(Float, default=82.0)
    transcript = Column(Text, nullable=True)
    feedback_notes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("DBUser", back_populates="presentations")

# ==================== Pydantic Schemas ====================

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: Optional[str] = "Learner"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str

class UserProfileSchema(BaseModel):
    experience_level: str
    preferred_topics: List[str]
    presentation_domains: List[str]
    learning_goals: List[str]
    coaching_preferences: str
    argument_quality_score: float
    evidence_usage_score: float
    logical_consistency_score: float
    rebuttal_effectiveness_score: float
    communication_skills_score: float
    overall_performance_score: float

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    profile: Optional[UserProfileSchema] = None

    class Config:
        from_attributes = True

# Argument Analysis Request & Response
class ArgumentAnalysisRequest(BaseModel):
    text: str
    context_topic: Optional[str] = "General Debate"

class ClaimItem(BaseModel):
    claim: str
    type: str
    evidence_found: bool
    strength_score: float
    clarity_score: float

class ArgumentAnalysisResponse(BaseModel):
    claims: List[ClaimItem]
    evidence_score: float
    reasoning_quality: float
    clarity_score: float
    relevance_score: float
    persuasiveness_index: float
    summary_evaluation: str

# Fallacy Request & Response
class FallacyCheckRequest(BaseModel):
    text: str

class FallacyItem(BaseModel):
    fallacy_type: str
    detected_phrase: str
    explanation: str
    suggested_correction: str
    severity: str

class FallacyCheckResponse(BaseModel):
    fallacies_detected: List[FallacyItem]
    total_fallacies: int
    credibility_score: float
    overall_assessment: str

# Counterargument Request & Response
class CounterargumentRequest(BaseModel):
    argument_text: str
    topic: str
    perspective: Optional[str] = "All" # Logical, Evidence, Ethical, Practical, Policy, All

class CounterargumentItem(BaseModel):
    category: str # Logical, Evidence-based, Ethical, Practical, Policy
    rebuttal: str
    key_counterpoint: str
    challenge_question: str
    debate_strategy: str

class CounterargumentResponse(BaseModel):
    counterarguments: List[CounterargumentItem]
    debate_tips: List[str]

# Presentation Speech Request & Response
class PresentationSpeechRequest(BaseModel):
    transcript: str
    title: Optional[str] = "Keynote Speech Analysis"
    domain: Optional[str] = "Public Speaking"
    duration_seconds: Optional[float] = 120.0

class FillerWordDetail(BaseModel):
    word: str
    count: int
    occurrences: List[str]

class PresentationSpeechResponse(BaseModel):
    title: str
    duration_seconds: float
    words_per_minute: float
    pace_assessment: str # Too slow, Optimal, Fast, Too fast
    filler_word_count: int
    filler_breakdown: List[FillerWordDetail]
    confidence_score: float
    clarity_score: float
    engagement_score: float
    overall_presentation_score: float
    key_recommendations: List[str]

# AI Debate Simulation
class DebateTurnRequest(BaseModel):
    session_id: Optional[int] = 1
    topic: str
    format: str = "One-on-One"
    user_position: str = "Affirmative"
    opponent_persona: str = "Socratic Scholar" # Socratic Scholar, Aggressive Pragmatist, Policy Expert, Philosophical Analyst
    user_argument: str

class DebateTurnResponse(BaseModel):
    opponent_response: str
    detected_fallacies_in_user_turn: List[FallacyItem]
    live_coaching_tip: str
    current_turn_score: float
    counterarguments_suggested: List[str]

# Performance Score Calculation Schema
class ScoreCalculationRequest(BaseModel):
    argument_quality: float # 0 - 100
    evidence_usage: float # 0 - 100
    logical_consistency: float # 0 - 100
    rebuttal_effectiveness: float # 0 - 100
    communication_skills: float # 0 - 100

class ScoreCalculationResponse(BaseModel):
    overall_score: float
    breakdown: Dict[str, float]
    rating_tier: str # Master Debater, Proficient, Developing, Novice
    strengths: List[str]
    growth_areas: List[str]
