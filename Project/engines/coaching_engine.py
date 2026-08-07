"""
Coaching & Recommendation Engine
Generates personalized coaching recommendations and learning paths
based on historical performance scores and identified skill gaps.
"""
from __future__ import annotations

import os
import json
from dataclasses import dataclass, field, asdict
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


@dataclass
class Recommendation:
    category: str
    title: str
    description: str
    priority: str  # "high" | "medium" | "low"
    exercises: List[str]
    estimated_improvement: str


@dataclass
class LearningPathWeek:
    week: int
    focus: str
    goals: List[str]
    exercises: List[str]
    assessment: str


@dataclass
class CoachingReport:
    user_id: int
    skill_gaps: List[str]
    strengths: List[str]
    recommendations: List[Recommendation]
    learning_path: List[LearningPathWeek]
    motivational_message: str


# Recommendation templates keyed by skill gap area
_RECOMMENDATION_TEMPLATES = {
    "argument_quality": Recommendation(
        category="Argumentation",
        title="Strengthen Your Core Arguments",
        description="Your argument quality score indicates room for building more structured, compelling arguments.",
        priority="high",
        exercises=[
            "Practice the PEEL structure (Point, Evidence, Explain, Link) for 10 minutes daily.",
            "Write 3 arguments per day on random topics using only verifiable facts.",
            "Record yourself arguing a position and review for logical gaps.",
        ],
        estimated_improvement="Expect a 15-20% improvement in 2 weeks of daily practice.",
    ),
    "evidence_usage": Recommendation(
        category="Research & Evidence",
        title="Build Evidence-Backed Arguments",
        description="Incorporating statistics, expert quotes, and research citations significantly boosts credibility.",
        priority="high",
        exercises=[
            "Read one peer-reviewed article daily and practice summarizing its key findings.",
            "Practice citing evidence inline: 'According to [source], [stat]...'",
            "Build a personal evidence library organized by debate topics.",
        ],
        estimated_improvement="Strong evidence usage can increase your persuasiveness score by 25%.",
    ),
    "logical_consistency": Recommendation(
        category="Logical Reasoning",
        title="Improve Logical Flow",
        description="Arguments need clear causal chains and consistent reasoning to be persuasive.",
        priority="high",
        exercises=[
            "Study the 15 most common logical fallacies and identify them in real debates.",
            "Practice using Toulmin's Model: Claim → Warrant → Evidence.",
            "Daily puzzle: Find the logical flaw in a provided argument.",
        ],
        estimated_improvement="Logical consistency training leads to measurable improvement in 1 week.",
    ),
    "rebuttal_effectiveness": Recommendation(
        category="Rebuttal Skills",
        title="Master Effective Rebuttals",
        description="Effective rebuttals directly address the opponent's argument before presenting your counter.",
        priority="medium",
        exercises=[
            "Practice the DARE rebuttal framework: Disprove, Attack, Reverse, Extend.",
            "Spend 5 minutes daily watching debate championships and analyzing rebuttals.",
            "Pair with a partner for rapid-fire rebuttal practice sessions.",
        ],
        estimated_improvement="Focused rebuttal practice can improve this score by 30% in 3 weeks.",
    ),
    "communication_skills": Recommendation(
        category="Communication",
        title="Enhance Verbal Communication",
        description="Clear, confident, and engaging delivery amplifies even average arguments.",
        priority="medium",
        exercises=[
            "Record 2-minute speeches daily and review for clarity and pace.",
            "Practice eliminating filler words by pausing instead of saying 'um' or 'uh'.",
            "Join a Toastmasters club or debate practice group weekly.",
        ],
        estimated_improvement="Communication skills improve steadily with consistent speaking practice.",
    ),
    "presentation": Recommendation(
        category="Presentation",
        title="Elevate Your Presentation Style",
        description="Audiences are won by confident delivery, engaging storytelling, and clear structure.",
        priority="medium",
        exercises=[
            "Practice the 3-part structure: Hook → Core Message → Memorable Conclusion.",
            "Use mirror practice to observe and improve body language and facial expressions.",
            "Time your presentations and aim for optimal pace (130-160 WPM).",
        ],
        estimated_improvement="Presentation scores can improve by 20% with 2 weeks of structured practice.",
    ),
}

_4_WEEK_BASE_PATH = [
    LearningPathWeek(
        week=1,
        focus="Foundation: Structure & Evidence",
        goals=["Learn PEEL argument structure", "Build evidence library", "Complete 5 practice arguments"],
        exercises=["Daily PEEL writing exercise", "Fact-finding research (30 min/day)", "Argument analysis of 3 public speeches"],
        assessment="Submit 2 structured arguments for AI evaluation. Target: Argument Quality ≥ 6/10",
    ),
    LearningPathWeek(
        week=2,
        focus="Logic & Fallacy Mastery",
        goals=["Identify all 8 major fallacies", "Apply Toulmin's model", "Complete 3 AI debate simulations"],
        exercises=["Fallacy detection drills (20 min/day)", "Toulmin model worksheets", "AI debate simulation sessions"],
        assessment="Score 80%+ on fallacy identification quiz. AI debate score target: ≥ 6.5/10",
    ),
    LearningPathWeek(
        week=3,
        focus="Rebuttal & Counter-Argumentation",
        goals=["Master DARE rebuttal framework", "Generate 5 counterarguments per argument", "Reduce filler words by 50%"],
        exercises=["Daily rebuttal practice sessions", "Counterargument generation drills", "Speech recording & review"],
        assessment="Complete 5 full AI debates. Target rebuttal effectiveness: ≥ 7/10",
    ),
    LearningPathWeek(
        week=4,
        focus="Integration & Performance",
        goals=["Integrate all skills in full debate", "Deliver polished presentation", "Achieve overall score ≥ 7.5/10"],
        exercises=["Full-length mock debates (3x)", "Complete presentation delivery practice", "Peer review sessions"],
        assessment="Final comprehensive debate assessment. Target: Overall score ≥ 7.5/10, Grade B or above",
    ),
]


def _rule_based_coaching(user_id: int, scores: dict) -> CoachingReport:
    """Generate recommendations from scores dict. Keys are the scoring dimensions."""
    skill_gaps = [k for k, v in scores.items() if v < 6.5]
    strengths = [k for k, v in scores.items() if v >= 7.5]

    recommendations = []
    for gap in skill_gaps:
        if gap in _RECOMMENDATION_TEMPLATES:
            recommendations.append(_RECOMMENDATION_TEMPLATES[gap])

    # Always show at least 2 recommendations
    if len(recommendations) < 2:
        for key in _RECOMMENDATION_TEMPLATES:
            if key not in skill_gaps:
                recommendations.append(_RECOMMENDATION_TEMPLATES[key])
            if len(recommendations) >= 3:
                break

    # Motivational message
    avg_score = sum(scores.values()) / max(len(scores), 1) if scores else 5.0
    if avg_score >= 8.0:
        msg = "🏆 Outstanding performance! You're on the path to becoming a master debater. Keep pushing boundaries!"
    elif avg_score >= 6.5:
        msg = "🌟 Great progress! With focused practice on your weaker areas, you'll reach expert level soon."
    else:
        msg = "💪 Every great debater started where you are now. Commit to the daily exercises and you'll see dramatic improvement!"

    return CoachingReport(
        user_id=user_id,
        skill_gaps=[k.replace("_", " ").title() for k in skill_gaps],
        strengths=[k.replace("_", " ").title() for k in strengths],
        recommendations=recommendations[:4],
        learning_path=_4_WEEK_BASE_PATH,
        motivational_message=msg,
    )


_LLM_COACHING_PROMPT = """You are an expert debate and communication coach. Based on the user's performance scores, 
generate a personalized coaching report. Return ONLY valid JSON:
{{
  "skill_gaps": ["<area>"],
  "strengths": ["<area>"],
  "recommendations": [
    {{
      "category": "<category>",
      "title": "<title>",
      "description": "<description>",
      "priority": "<high|medium|low>",
      "exercises": ["<exercise1>", "<exercise2>"],
      "estimated_improvement": "<improvement estimate>"
    }}
  ],
  "learning_path": [
    {{
      "week": 1,
      "focus": "<weekly focus>",
      "goals": ["<goal>"],
      "exercises": ["<exercise>"],
      "assessment": "<assessment>"
    }}
  ],
  "motivational_message": "<encouraging message>"
}}

User Performance Scores (0-10): {scores}
"""


def _llm_coaching(user_id: int, scores: dict) -> CoachingReport:
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        prompt = _LLM_COACHING_PROMPT.format(scores=json.dumps(scores))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1500,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        recs = [Recommendation(**r) for r in data.get("recommendations", [])]
        path = [LearningPathWeek(**w) for w in data.get("learning_path", [])]
        return CoachingReport(
            user_id=user_id,
            skill_gaps=data.get("skill_gaps", []),
            strengths=data.get("strengths", []),
            recommendations=recs,
            learning_path=path,
            motivational_message=data.get("motivational_message", ""),
        )
    except Exception:
        return _rule_based_coaching(user_id, scores)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def generate_coaching(user_id: int, scores: dict) -> dict:
    """
    Generate personalized coaching from a scores dict.
    scores: {dimension_name: float_0_to_10}
    """
    if OPENAI_API_KEY:
        report = _llm_coaching(user_id, scores)
    else:
        report = _rule_based_coaching(user_id, scores)
    return asdict(report)
