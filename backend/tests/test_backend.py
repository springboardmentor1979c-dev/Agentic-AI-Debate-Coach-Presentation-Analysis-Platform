import pytest
from app.services.ai_engines import (
    analyze_argument, detect_fallacies, generate_counterarguments,
    analyze_speech, compute_performance_score
)
from app.models.schemas_and_models import ScoreCalculationRequest

def test_argument_analysis():
    res = analyze_argument("We must regulate AI because empirical studies show 45% risk of job displacement.")
    assert len(res.claims) > 0
    assert res.evidence_score > 50
    assert res.persuasiveness_index > 0

def test_fallacy_detection_ad_hominem():
    res = detect_fallacies("You are just an idiot and a fool so your opinion on climate policy is invalid.")
    assert res.total_fallacies >= 1
    types = [f.fallacy_type for f in res.fallacies_detected]
    assert "Ad Hominem" in types

def test_fallacy_detection_straw_man():
    res = detect_fallacies("So you're saying we should completely eliminate all law enforcement?")
    assert res.total_fallacies >= 1
    types = [f.fallacy_type for f in res.fallacies_detected]
    assert "Straw Man" in types

def test_counterargument_generation():
    res = generate_counterarguments("AI models should be strictly licensed.", "AI Policy", "All")
    assert len(res.counterarguments) == 5
    categories = [c.category for c in res.counterarguments]
    assert "Logical" in categories
    assert "Evidence-based" in categories

def test_speech_analysis():
    transcript = "Um hello everyone. Uh today I like want to talk about um renewable energy. You know it is crucial."
    res = analyze_speech(transcript, duration_seconds=30.0)
    assert res.filler_word_count >= 3
    assert res.words_per_minute > 0

def test_weighted_performance_scoring():
    # Formula: 30% Arg Quality, 20% Evidence, 20% Logical Consistency, 15% Rebuttal, 15% Communication
    # Arg=100 (30), Evid=100 (20), Logic=100 (20), Reb=100 (15), Comm=100 (15) -> Total=100
    req = ScoreCalculationRequest(
        argument_quality=100.0,
        evidence_usage=100.0,
        logical_consistency=100.0,
        rebuttal_effectiveness=100.0,
        communication_skills=100.0
    )
    res = compute_performance_score(req)
    assert res.overall_score == 100.0
    assert res.rating_tier == "Master Debater"

    # Test custom weights: Arg=80 (24), Evid=70 (14), Logic=90 (18), Reb=60 (9), Comm=80 (12) = 77.0
    req2 = ScoreCalculationRequest(
        argument_quality=80.0,
        evidence_usage=70.0,
        logical_consistency=90.0,
        rebuttal_effectiveness=60.0,
        communication_skills=80.0
    )
    res2 = compute_performance_score(req2)
    assert res2.overall_score == 77.0
