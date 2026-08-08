"""Unit tests for the Recommendation & Coaching Engine."""

from coaching_engine import RecommendationCoachingEngine


def test_coaching_engine_generation():
    engine = RecommendationCoachingEngine()
    result = engine.generate_recommendations(
        debate_score=68.0,
        presentation_score=82.0,
        recent_fallacies=["Straw Man", "Ad Hominem"],
        filler_density=2.1,
        user_role="Learner",
        experience_level="Intermediate",
    )

    assert len(result["debate_recommendations"]) >= 2
    assert len(result["presentation_suggestions"]) >= 2
    assert len(result["skill_development_plan"]) == 4
    assert "Learner" in result["personalized_coaching_feedback"] or "practice" in result["personalized_coaching_feedback"]

    path = result["learning_path"]
    assert path["target_level"] == "Intermediate"
    assert len(path["weekly_modules"]) == 4


if __name__ == "__main__":
    print("Running Recommendation & Coaching Engine tests...")
    test_coaching_engine_generation()
    print("[PASS] test_coaching_engine_generation")
    print("All coaching engine tests passed successfully!")
