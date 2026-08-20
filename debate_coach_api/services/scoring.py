"""Debate scoring engine with weighted formula and LLM feedback."""
import json
from models.models import DebateScore
from services.llm_engine import call_llm, parse_llm_json
from services.cache import leaderboard_update


def compute_debate_score(score: DebateScore, use_llm: bool = True) -> DebateScore:
    score.overall_score = round(
        score.argument_quality * 0.30
        + score.evidence_usage * 0.20
        + score.logical_consistency * 0.20
        + score.rebuttal_effectiveness * 0.15
        + score.communication_skills * 0.15,
        2,
    )

    if use_llm and not score.llm_feedback:
        prompt = f"""A debater received these scores:
- Argument Quality: {score.argument_quality}/10 (30% weight)
- Evidence Usage: {score.evidence_usage}/10 (20% weight)
- Logical Consistency: {score.logical_consistency}/10 (20% weight)
- Rebuttal Effectiveness: {score.rebuttal_effectiveness}/10 (15% weight)
- Communication Skills: {score.communication_skills}/10 (15% weight)
- Overall Score: {score.overall_score}/10

Write 3-4 sentences of constructive feedback and 3 specific improvement tips.
Respond in JSON with keys: feedback, tips (list)."""
        response, _, _ = call_llm(prompt, "You are a professional debate evaluator.")
        result = parse_llm_json(response)
        score.llm_feedback = json.dumps(result)
        if not score.feedback:
            score.feedback = result.get("feedback", "")

    # Update leaderboard
    leaderboard_update(score.user_id, score.overall_score)
    return score


def generate_recommendations(score: DebateScore) -> list[str]:
    # Try LLM feedback first
    if score.llm_feedback:
        try:
            data = json.loads(score.llm_feedback)
            tips = data.get("tips", [])
            if tips:
                return tips
        except Exception:
            pass

    # Heuristic fallback
    tips = []
    if score.argument_quality < 6:
        tips.append("Strengthen your main claims with clearer structure (Claim → Evidence → Impact).")
    if score.evidence_usage < 6:
        tips.append("Include more factual evidence, statistics, and credible citations.")
    if score.logical_consistency < 6:
        tips.append("Ensure your reasoning flows logically without contradictions or gaps.")
    if score.rebuttal_effectiveness < 6:
        tips.append("Practice directly addressing your opponent's strongest points.")
    if score.communication_skills < 6:
        tips.append("Work on vocal clarity, pacing, and confident body language.")
    return tips or ["Excellent performance! Keep refining your debate strategy."]


def compute_percentile(score: float, all_scores: list[float]) -> float:
    """Compute percentile rank of a score within a list."""
    if not all_scores:
        return 50.0
    below = sum(1 for s in all_scores if s < score)
    return round((below / len(all_scores)) * 100, 1)
