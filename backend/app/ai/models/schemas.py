from pydantic import BaseModel, Field
from typing import List, Optional

# ==========================================
# WEEK 2 SCHEMAS: Argument Analysis
# ==========================================

class ClaimItem(BaseModel):
    text: str
    confidence: float

class ClaimExtractionResult(BaseModel):
    main_claim: ClaimItem
    supporting_claims: List[ClaimItem] = []
    counter_claims: List[ClaimItem] = []

class FallacyDetails(BaseModel):
    fallacy_type: str
    severity: str  # High, Medium, Low
    description: str
    correction: Optional[str] = None
    highlighted_sentence: Optional[str] = None
    example: Optional[str] = None

class FallacyDetectionResult(BaseModel):
    fallacies: List[FallacyDetails] = []

class ReasoningEvaluationResult(BaseModel):
    logical_flow: str
    consistency: str
    validity: str
    coherence: str
    reasoning_chain: List[str]
    overall_quality: str  # Excellent, Good, Average, Weak

class FeedbackResult(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    missing_evidence: List[str]
    improvement_tips: List[str]

class ImprovementResult(BaseModel):
    improved_argument: str
    wording_tips: str
    structural_tips: str


# ==========================================
# WEEK 3 SCHEMAS: Debate Simulation & Coaching
# ==========================================

class DebateOpeningResult(BaseModel):
    opening_statement: str
    key_points: List[str] = []

class RebuttalResult(BaseModel):
    rebuttal: str
    points_addressed: List[str] = []

class CounterargumentDetails(BaseModel):
    counter_type: str
    counter_argument: str
    explanation: str
    strength: float
    possible_user_reply: str

class CounterargumentResult(BaseModel):
    counterarguments: List[CounterargumentDetails] = []

class CoachingScores(BaseModel):
    confidence: float
    persuasiveness: float
    reasoning: float
    logic: float
    evidence: float
    communication: float

class CoachingFeedbackResult(BaseModel):
    scores: CoachingScores
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    better_wording: str
    missing_evidence: List[str] = []
    speaking_advice: str
    skill_focus: str

class LearningPlanDay(BaseModel):
    day: int
    exercise: str
    description: str

class LearningPlanWeek(BaseModel):
    week: int
    focus: str
    days: List[LearningPlanDay]

class RecommendedExercise(BaseModel):
    name: str
    exercise_type: str  # Research, Critical Thinking, Public Speaking, Logical Reasoning
    instructions: str

class LearningPlanResult(BaseModel):
    goal: str
    difficulty: str
    duration_days: int
    weekly_plan: List[LearningPlanWeek]
    recommended_exercises: List[RecommendedExercise] = []


# ==========================================
# WEEK 4 SCHEMAS: Presentation Analysis & Speech/Video Metrics
# ==========================================

class PresentationScores(BaseModel):
    communication: float
    confidence: float
    structure: float
    engagement: float
    professionalism: float

class PresentationFeedbackDetails(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    slide_improvements: List[str] = []

class PresentationEvaluationResult(BaseModel):
    scores: PresentationScores
    feedback: PresentationFeedbackDetails

class SpeechFeedbackScores(BaseModel):
    pace_score: float
    pronunciation_score: float
    vocal_stability_score: float
    overall_speech_score: float

class SpeechFeedbackMetrics(BaseModel):
    words_per_minute: float
    pause_count: int
    filler_words_count: int

class SpeechFeedbackResult(BaseModel):
    scores: SpeechFeedbackScores
    metrics: SpeechFeedbackMetrics
    speech_tips: List[str]

class ExecutiveSummaryResult(BaseModel):
    summary: str
    key_takeaways: List[str]
    high_priority_actions: List[str]

class FinalCoachingReportResult(BaseModel):
    overall_evaluation: str
    strengths_summary: List[str]
    developmental_areas: List[str]
    recommended_milestones: List[str]
