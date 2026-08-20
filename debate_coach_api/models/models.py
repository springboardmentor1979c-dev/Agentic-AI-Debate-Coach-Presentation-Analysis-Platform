from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class RoleEnum(str, enum.Enum):
    learner = "learner"
    coach = "coach"
    educator = "educator"
    admin = "admin"


class ExperienceLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"


class DebateFormat(str, enum.Enum):
    one_on_one = "one_on_one"
    parliamentary = "parliamentary"
    oxford = "oxford"
    policy = "policy"
    public_forum = "public_forum"
    ai_simulation = "ai_simulation"


class SessionStatus(str, enum.Enum):
    scheduled = "scheduled"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class AgentType(str, enum.Enum):
    speech = "speech"
    argument = "argument"
    fallacy = "fallacy"
    scoring = "scoring"
    coach = "coach"
    rebuttal = "rebuttal"


# ── User & Profile ────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.learner)
    oauth_provider = Column(String, nullable=True)       # google | github | None
    oauth_sub = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    debate_sessions = relationship("DebateSession", back_populates="creator")
    presentations = relationship("PresentationAnalysis", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    skill_records = relationship("SkillRecord", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    ai_sessions = relationship("AIDebateSession", back_populates="user")
    coaching_plans = relationship("CoachingPlan", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    experience_level = Column(Enum(ExperienceLevel), default=ExperienceLevel.beginner)
    goals = Column(Text, default="")
    preferred_topics = Column(Text, default="")
    coaching_preferences = Column(Text, default="")
    presentation_domains = Column(Text, default="")
    debate_count = Column(Integer, default=0)
    presentation_count = Column(Integer, default=0)
    avg_debate_score = Column(Float, default=0.0)
    avg_presentation_score = Column(Float, default=0.0)
    total_practice_minutes = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    badges = Column(Text, default="")                   # JSON string of earned badges

    user = relationship("User", back_populates="profile")


# ── Skill Tracking ────────────────────────────────────────────────────────────

class SkillRecord(Base):
    __tablename__ = "skill_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_name = Column(String, nullable=False)         # argumentation | delivery | logic | rebuttal
    score = Column(Float, default=0.0)
    session_ref_id = Column(Integer, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skill_records")


# ── Debate Session ────────────────────────────────────────────────────────────

class DebateSession(Base):
    __tablename__ = "debate_sessions"
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    format = Column(Enum(DebateFormat), default=DebateFormat.one_on_one)
    creator_id = Column(Integer, ForeignKey("users.id"))
    participant_ids = Column(Text, default="")          # comma-separated user IDs
    position_map = Column(Text, default="{}")           # JSON: {user_id: "pro"|"con"}
    scheduled_at = Column(DateTime, nullable=True)
    recording_url = Column(String, nullable=True)
    transcript = Column(Text, default="")
    status = Column(Enum(SessionStatus), default=SessionStatus.scheduled)
    duration_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="debate_sessions")
    arguments = relationship("Argument", back_populates="session")
    scores = relationship("DebateScore", back_populates="session")
    agent_runs = relationship("AgentRun", back_populates="session")


# ── Argument, Fallacy, Counterargument ───────────────────────────────────────

class Argument(Base):
    __tablename__ = "arguments"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"))
    speaker_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    claim = Column(Text, default="")
    evidence = Column(Text, default="")
    position = Column(String, default="pro")            # pro | con
    turn_number = Column(Integer, default=1)
    clarity_score = Column(Float, default=0.0)
    relevance_score = Column(Float, default=0.0)
    evidence_strength = Column(Float, default=0.0)
    logical_consistency = Column(Float, default=0.0)
    persuasiveness = Column(Float, default=0.0)
    sentiment = Column(String, default="neutral")
    keywords = Column(Text, default="")
    embedding_id = Column(String, nullable=True)        # vector store reference
    llm_analysis = Column(Text, default="")             # raw LLM JSON output
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("DebateSession", back_populates="arguments")
    fallacies = relationship("FallacyDetection", back_populates="argument")
    counterarguments = relationship("Counterargument", back_populates="argument")


class FallacyDetection(Base):
    __tablename__ = "fallacy_detections"
    id = Column(Integer, primary_key=True, index=True)
    argument_id = Column(Integer, ForeignKey("arguments.id"))
    fallacy_type = Column(String, nullable=False)
    explanation = Column(Text, default="")
    correction = Column(Text, default="")
    confidence = Column(Float, default=0.0)
    detected_by = Column(String, default="heuristic")   # heuristic | llm

    argument = relationship("Argument", back_populates="fallacies")


class Counterargument(Base):
    __tablename__ = "counterarguments"
    id = Column(Integer, primary_key=True, index=True)
    argument_id = Column(Integer, ForeignKey("arguments.id"))
    counter_type = Column(String, default="logical")
    content = Column(Text, nullable=False)
    strategy = Column(Text, default="")
    generated_by = Column(String, default="heuristic")  # heuristic | llm

    argument = relationship("Argument", back_populates="counterarguments")


# ── Presentation Analysis ─────────────────────────────────────────────────────

class PresentationAnalysis(Base):
    __tablename__ = "presentation_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="Untitled")
    transcript = Column(Text, default="")
    audio_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    duration_seconds = Column(Integer, default=0)
    speech_pace = Column(Float, default=0.0)
    filler_word_count = Column(Integer, default=0)
    filler_words_detail = Column(Text, default="{}")    # JSON: {word: count}
    confidence_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    emotion_detected = Column(String, default="neutral")
    pitch_variation = Column(Float, default=0.0)
    pause_frequency = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    feedback = Column(Text, default="")
    llm_coaching = Column(Text, default="")             # LLM-generated coaching tips
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="presentations")


# ── AI Debate Simulation ──────────────────────────────────────────────────────

class AIDebateSession(Base):
    __tablename__ = "ai_debate_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String, nullable=False)
    user_position = Column(String, default="pro")       # pro | con
    debate_format = Column(Enum(DebateFormat), default=DebateFormat.ai_simulation)
    turn_count = Column(Integer, default=0)
    conversation_history = Column(Text, default="[]")   # JSON array of turns
    final_score = Column(Float, nullable=True)
    status = Column(String, default="active")           # active | completed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_sessions")


# ── Scoring ───────────────────────────────────────────────────────────────────

class DebateScore(Base):
    __tablename__ = "debate_scores"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    argument_quality = Column(Float, default=0.0)       # 30%
    evidence_usage = Column(Float, default=0.0)         # 20%
    logical_consistency = Column(Float, default=0.0)    # 20%
    rebuttal_effectiveness = Column(Float, default=0.0) # 15%
    communication_skills = Column(Float, default=0.0)   # 15%
    overall_score = Column(Float, default=0.0)
    percentile_rank = Column(Float, default=0.0)
    feedback = Column(Text, default="")
    llm_feedback = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("DebateSession", back_populates="scores")


# ── Agentic Orchestration ─────────────────────────────────────────────────────

class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=True)
    agent_type = Column(Enum(AgentType))
    input_data = Column(Text, default="{}")             # JSON
    output_data = Column(Text, default="{}")            # JSON
    llm_provider = Column(String, default="mock")
    tokens_used = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    status = Column(String, default="completed")        # running | completed | failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("DebateSession", back_populates="agent_runs")


# ── Coaching & Learning Path ──────────────────────────────────────────────────

class CoachingPlan(Base):
    __tablename__ = "coaching_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    focus_areas = Column(Text, default="")              # comma-separated
    weekly_goals = Column(Text, default="")
    recommended_exercises = Column(Text, default="[]")  # JSON array
    learning_path = Column(Text, default="[]")          # JSON array of milestones
    generated_by = Column(String, default="heuristic")
    last_updated = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coaching_plans")


# ── Notification ──────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="info")  # info | reminder | alert | milestone
    channel = Column(String, default="in_app")          # in_app | email | push
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    status_code = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
