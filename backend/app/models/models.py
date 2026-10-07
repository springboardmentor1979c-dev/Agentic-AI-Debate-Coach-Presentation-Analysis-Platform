import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import relationship
from backend.app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # holds hashed password
    role = Column(String, default="Learner", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    debate_sessions = relationship("DebateSession", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    learning_plans = relationship("LearningPlan", back_populates="user", cascade="all, delete-orphan")
    performance_history = relationship("PerformanceHistory", back_populates="user", cascade="all, delete-orphan")
    presentation_analyses = relationship("PresentationAnalysis", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    experience_level = Column(String, nullable=False, default="Beginner")
    preferred_topics = Column(String, nullable=False, default="")
    presentation_domains = Column(String, nullable=False, default="")
    learning_goals = Column(String, nullable=False, default="")
    coaching_preferences = Column(String, nullable=False, default="")

    # Relationships
    user = relationship("User", back_populates="profile")


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    format = Column(String, nullable=False)  # One-on-One, Oxford, Parliamentary, Policy, Public Forum
    position = Column(String, nullable=False)  # Affirmative / Negative
    status = Column(String, default="Scheduled", nullable=False)  # Scheduled, In Progress, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="debate_sessions")
    arguments = relationship("Argument", back_populates="debate_session", cascade="all, delete-orphan")
    scores = relationship("Score", back_populates="debate_session", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="debate_session", cascade="all, delete-orphan")
    rounds = relationship("DebateRound", back_populates="debate_session", cascade="all, delete-orphan")
    coaching = relationship("Coaching", back_populates="debate_session", cascade="all, delete-orphan")
    presentation_analyses = relationship("PresentationAnalysis", back_populates="debate_session", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")


# ==========================================
# WEEK 2 TABLES: Argument Analysis
# ==========================================

class Argument(Base):
    __tablename__ = "arguments"

    id = Column(Integer, primary_key=True, index=True)
    debate_session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    claim = Column(Text, nullable=False)
    premise = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    debate_session = relationship("DebateSession", back_populates="arguments")
    fallacies = relationship("Fallacy", back_populates="argument", cascade="all, delete-orphan")


class Fallacy(Base):
    __tablename__ = "fallacies"

    id = Column(Integer, primary_key=True, index=True)
    argument_id = Column(Integer, ForeignKey("arguments.id", ondelete="CASCADE"), nullable=False)
    fallacy_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # High, Medium, Low
    description = Column(Text, nullable=False)
    correction = Column(Text, nullable=True)
    highlighted_sentence = Column(Text, nullable=True)
    example = Column(Text, nullable=True)

    # Relationships
    argument = relationship("Argument", back_populates="fallacies")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    debate_session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    clarity = Column(Float, default=0.0)
    relevance = Column(Float, default=0.0)
    evidence_strength = Column(Float, default=0.0)
    logical_consistency = Column(Float, default=0.0)
    persuasiveness = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    debate_session = relationship("DebateSession", back_populates="scores")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    debate_session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    debate_session = relationship("DebateSession", back_populates="feedback")


# ==========================================
# WEEK 3 TABLES: Debate Simulation & Coaching
# ==========================================

class DebateRound(Base):
    __tablename__ = "debate_rounds"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    speaker = Column(String, nullable=False)  # user / ai
    message = Column(Text, nullable=False)
    round_number = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    ai_response = Column(Text, nullable=True)  # Detailed AI reasoning if needed

    # Relationships
    debate_session = relationship("DebateSession", back_populates="rounds")
    counter_arguments = relationship("CounterArgument", back_populates="debate_round", cascade="all, delete-orphan")


class CounterArgument(Base):
    __tablename__ = "counter_arguments"

    id = Column(Integer, primary_key=True, index=True)
    debate_round_id = Column(Integer, ForeignKey("debate_rounds.id", ondelete="CASCADE"), nullable=False)
    counter_argument = Column(Text, nullable=False)
    counter_type = Column(String, nullable=False)  # logical, evidence_based, ethical, economic, policy, practical, philosophical
    strength = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    debate_round = relationship("DebateRound", back_populates="counter_arguments")


class Coaching(Base):
    __tablename__ = "coaching"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    skill_focus = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    debate_session = relationship("DebateSession", back_populates="coaching")


class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # Beginner, Intermediate, Advanced, Expert
    weekly_plan = Column(Text, nullable=False)  # JSON string representing the daily breakdown
    recommended_exercises = Column(Text, nullable=True)  # JSON string or plain text list
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="learning_plans")


class PerformanceHistory(Base):
    __tablename__ = "performance_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    debate_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    critical_thinking_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="performance_history")


# ==========================================
# WEEK 4 TABLES: Presentation Analysis & Speech/Video Metrics
# ==========================================

class PresentationAnalysis(Base):
    __tablename__ = "presentation_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    debate_session_id = Column(Integer, ForeignKey("debate_sessions.id", ondelete="SET NULL"), nullable=True)
    confidence_score = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    pace_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="presentation_analyses")
    debate_session = relationship("DebateSession", back_populates="presentation_analyses")
    speech_metrics = relationship("SpeechMetric", back_populates="presentation_analysis", uselist=False, cascade="all, delete-orphan")
    video_metrics = relationship("VideoMetric", back_populates="presentation_analysis", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="presentation_analysis", cascade="all, delete-orphan")


class SpeechMetric(Base):
    __tablename__ = "speech_metrics"

    id = Column(Integer, primary_key=True, index=True)
    presentation_id = Column(Integer, ForeignKey("presentation_analysis.id", ondelete="CASCADE"), nullable=False)
    words_per_minute = Column(Float, default=0.0)
    pause_count = Column(Integer, default=0)
    filler_words = Column(Text, default="[]")  # JSON encoded list of strings
    pitch = Column(Float, default=0.0)
    volume = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)

    # Relationships
    presentation_analysis = relationship("PresentationAnalysis", back_populates="speech_metrics")


class VideoMetric(Base):
    __tablename__ = "video_metrics"

    id = Column(Integer, primary_key=True, index=True)
    presentation_id = Column(Integer, ForeignKey("presentation_analysis.id", ondelete="CASCADE"), nullable=False)
    eye_contact = Column(Float, default=0.0)
    head_pose = Column(Float, default=0.0)
    gestures = Column(Text, default="[]")  # JSON encoded metrics
    facial_expression = Column(Text, default="[]")  # JSON encoded metrics
    body_posture = Column(Text, default="[]")  # JSON encoded metrics

    # Relationships
    presentation_analysis = relationship("PresentationAnalysis", back_populates="video_metrics")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    presentation_id = Column(Integer, ForeignKey("presentation_analysis.id", ondelete="SET NULL"), nullable=True)
    pdf_path = Column(String, nullable=True)
    json_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
    presentation_analysis = relationship("PresentationAnalysis", back_populates="reports")
