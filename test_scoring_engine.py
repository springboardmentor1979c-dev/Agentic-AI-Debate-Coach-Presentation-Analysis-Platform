"""Unit tests for the Performance Scoring Engine."""

from scoring_engine import PerformanceScoringEngine


def test_debate_weighted_scoring_model():
    engine = PerformanceScoringEngine()
    # AQ=90 (30%), EU=80 (20%), LC=85 (20%), RE=70 (15%), CS=80 (15%)
    # 27 + 16 + 17 + 10.5 + 12 = 82.5
    result = engine.calculate_debate_score(
        argument_quality=90.0,
        evidence_usage=80.0,
        logical_consistency=85.0,
        rebuttal_effectiveness=70.0,
        communication_skills=80.0,
    )
    assert result["debate_score"] == 82.5
    assert result["weights"]["argument_quality"]["contribution"] == 27.0
    assert result["weights"]["evidence_usage"]["contribution"] == 16.0


def test_presentation_scoring_model():
    engine = PerformanceScoringEngine()
    # 25% each: 80, 90, 70, 80 -> 20 + 22.5 + 17.5 + 20 = 80.0
    result = engine.calculate_presentation_score(
        pace_delivery=80.0, confidence=90.0, clarity=70.0, engagement=80.0
    )
    assert result["presentation_score"] == 80.0


def test_full_performance_evaluation_and_tiers():
    engine = PerformanceScoringEngine()

    # Master Orator case (>90)
    master_card = engine.evaluate_performance(
        title="Keynote Mastery",
        argument_quality=95,
        evidence_usage=92,
        logical_consistency=94,
        rebuttal_effectiveness=90,
        communication_skills=96,
        pace_delivery=92,
        confidence=95,
        clarity=94,
        engagement=92,
    )
    assert master_card["overall_performance_score"] >= 90.0
    assert master_card["performance_tier"] == "Master Orator"
    assert "🏆" in master_card["tier_badge"]

    # Developing Communicator case (60-74)
    dev_card = engine.evaluate_performance(
        title="Practice Session 1",
        argument_quality=65,
        evidence_usage=60,
        logical_consistency=65,
        rebuttal_effectiveness=60,
        communication_skills=65,
        pace_delivery=65,
        confidence=60,
        clarity=65,
        engagement=60,
    )
    assert 60.0 <= dev_card["overall_performance_score"] < 75.0
    assert dev_card["performance_tier"] == "Developing Communicator"


def test_text_derived_performance_evaluation():
    engine = PerformanceScoringEngine()
    speech = (
        "We must adopt renewable energy because research data proves a 40% reduction in carbon emissions. "
        "Therefore, studies show economic sustainability will increase. However, opponents argue costs are high."
    )
    result = engine.evaluate_performance(title="Speech Assessment", text=speech)

    assert result["overall_performance_score"] > 0
    assert "debate_performance" in result["scores"]
    assert "presentation_performance" in result["scores"]
    assert len(result["strengths"]) > 0
    assert len(result["coaching_plan"]) > 0


if __name__ == "__main__":
    print("Running Performance Scoring Engine tests...")
    test_debate_weighted_scoring_model()
    print("[PASS] test_debate_weighted_scoring_model (30/20/20/15/15 model verified)")
    test_presentation_scoring_model()
    print("[PASS] test_presentation_scoring_model")
    test_full_performance_evaluation_and_tiers()
    print("[PASS] test_full_performance_evaluation_and_tiers")
    test_text_derived_performance_evaluation()
    print("[PASS] test_text_derived_performance_evaluation")
    print("All performance scoring engine tests passed successfully!")
