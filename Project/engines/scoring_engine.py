"""
Performance Scoring Engine
Weighted scoring model for debate and presentation performance.

Debate Performance Score:
  - Argument Quality     30%
  - Evidence Usage       20%
  - Logical Consistency  20%
  - Rebuttal Effectiveness 15%
  - Communication Skills 15%
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class DebateScore:
    argument_quality: float       # 0-10
    evidence_usage: float         # 0-10
    logical_consistency: float    # 0-10
    rebuttal_effectiveness: float # 0-10
    communication_skills: float   # 0-10
    weighted_total: float         # 0-10
    grade: str                    # A+ to F
    performance_level: str        # "Expert" | "Advanced" | "Intermediate" | "Beginner"
    badge: str                    # emoji badge
    breakdown: dict
    coaching_summary: str


@dataclass
class PresentationScoreResult:
    confidence: float      # 0-10
    clarity: float         # 0-10
    engagement: float      # 0-10
    delivery: float        # 0-10
    content_quality: float # 0-10
    weighted_total: float
    grade: str
    performance_level: str
    coaching_summary: str


def _grade(score: float) -> str:
    if score >= 9.5: return "A+"
    if score >= 9.0: return "A"
    if score >= 8.5: return "A-"
    if score >= 8.0: return "B+"
    if score >= 7.5: return "B"
    if score >= 7.0: return "B-"
    if score >= 6.5: return "C+"
    if score >= 6.0: return "C"
    if score >= 5.5: return "C-"
    if score >= 5.0: return "D"
    return "F"


def _performance_level(score: float) -> str:
    if score >= 8.5: return "Expert"
    if score >= 7.0: return "Advanced"
    if score >= 5.5: return "Intermediate"
    return "Beginner"


def _badge(score: float) -> str:
    if score >= 9.0: return "🏆 Champion Debater"
    if score >= 8.0: return "🥇 Master Debater"
    if score >= 7.0: return "🥈 Advanced Speaker"
    if score >= 6.0: return "🥉 Developing Debater"
    if score >= 5.0: return "📚 Learning Debater"
    return "🌱 Beginner Debater"


# Weights
_DEBATE_WEIGHTS = {
    "argument_quality": 0.30,
    "evidence_usage": 0.20,
    "logical_consistency": 0.20,
    "rebuttal_effectiveness": 0.15,
    "communication_skills": 0.15,
}

_PRESENTATION_WEIGHTS = {
    "confidence": 0.25,
    "clarity": 0.25,
    "engagement": 0.20,
    "delivery": 0.20,
    "content_quality": 0.10,
}


def score_debate(
    argument_quality: float,
    evidence_usage: float,
    logical_consistency: float,
    rebuttal_effectiveness: float,
    communication_skills: float,
) -> dict:
    """Compute weighted debate performance score."""
    scores = {
        "argument_quality": argument_quality,
        "evidence_usage": evidence_usage,
        "logical_consistency": logical_consistency,
        "rebuttal_effectiveness": rebuttal_effectiveness,
        "communication_skills": communication_skills,
    }
    # Clamp all scores 0-10
    scores = {k: max(0.0, min(10.0, v)) for k, v in scores.items()}
    
    weighted_total = sum(scores[k] * w for k, w in _DEBATE_WEIGHTS.items())
    weighted_total = round(weighted_total, 2)

    # Coaching summary
    weakest = min(scores, key=scores.get)
    strongest = max(scores, key=scores.get)
    coaching_summary = (
        f"Your strongest area is {strongest.replace('_', ' ').title()} ({scores[strongest]:.1f}/10). "
        f"Focus on improving {weakest.replace('_', ' ').title()} ({scores[weakest]:.1f}/10) for the greatest gains."
    )

    result = DebateScore(
        argument_quality=scores["argument_quality"],
        evidence_usage=scores["evidence_usage"],
        logical_consistency=scores["logical_consistency"],
        rebuttal_effectiveness=scores["rebuttal_effectiveness"],
        communication_skills=scores["communication_skills"],
        weighted_total=weighted_total,
        grade=_grade(weighted_total),
        performance_level=_performance_level(weighted_total),
        badge=_badge(weighted_total),
        breakdown={k: {"score": v, "weight": f"{int(_DEBATE_WEIGHTS[k]*100)}%", "contribution": round(v * _DEBATE_WEIGHTS[k], 2)} for k, v in scores.items()},
        coaching_summary=coaching_summary,
    )
    return asdict(result)


def score_presentation(
    confidence: float,
    clarity: float,
    engagement: float,
    delivery: float,
    content_quality: float,
) -> dict:
    """Compute weighted presentation performance score."""
    scores = {
        "confidence": confidence,
        "clarity": clarity,
        "engagement": engagement,
        "delivery": delivery,
        "content_quality": content_quality,
    }
    scores = {k: max(0.0, min(10.0, v)) for k, v in scores.items()}

    weighted_total = sum(scores[k] * w for k, w in _PRESENTATION_WEIGHTS.items())
    weighted_total = round(weighted_total, 2)

    weakest = min(scores, key=scores.get)
    coaching_summary = (
        f"Overall presentation score: {weighted_total}/10 ({_grade(weighted_total)}). "
        f"Prioritize improving {weakest.replace('_', ' ').title()} for maximum impact."
    )

    result = PresentationScoreResult(
        confidence=scores["confidence"],
        clarity=scores["clarity"],
        engagement=scores["engagement"],
        delivery=scores["delivery"],
        content_quality=scores["content_quality"],
        weighted_total=weighted_total,
        grade=_grade(weighted_total),
        performance_level=_performance_level(weighted_total),
        coaching_summary=coaching_summary,
    )
    return asdict(result)
