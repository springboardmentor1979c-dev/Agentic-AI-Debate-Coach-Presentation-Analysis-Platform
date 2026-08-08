"""Tests for Argument Analysis Engine, Fallacy Detection Engine, and FastAPI Endpoints."""

from argument_engine import ArgumentAnalysisEngine
from database import initialize_database, connection_scope
from main import (
    ArgumentAnalysisRequest,
    analyze_argument,
    list_argument_analyses,
    get_argument_analysis,
    delete_argument_analysis,
)


def setup_db():
    initialize_database()


def test_argument_engine_basic_analysis():
    engine = ArgumentAnalysisEngine()
    sample_text = (
        "We must enact a total ban on single-use plastics immediately because data shows 8 million tons "
        "enter our oceans annually according to researchers at NASA. However, opponents claim that plastic is cheap. "
        "Therefore, switching to sustainable alternatives will protect marine biodiversity and economic long-term stability."
    )
    res = engine.analyze(sample_text, topic="Plastic Ban")

    assert res["scores"]["clarity"] > 0
    assert res["scores"]["relevance"] > 0
    assert res["scores"]["evidence_strength"] > 0
    assert res["scores"]["logical_consistency"] > 0
    assert res["scores"]["persuasiveness"] > 0
    assert res["scores"]["overall_strength"] > 0

    assert len(res["claims"]) > 0
    assert res["evidence_evaluation"]["count"] >= 1
    assert res["credibility"]["level"] in ["High", "Medium"]


def test_fallacy_detection_all_8_supported_fallacies():
    engine = ArgumentAnalysisEngine()

    fallacy_samples = [
        ("Ad Hominem", "You are an idiot and corrupt liar so your argument is invalid."),
        ("Straw Man", "So you are saying we should just complete destruction of society and ban everything."),
        ("False Dilemma", "You are either with us or you want to destroy our nation; there are only two choices."),
        ("Slippery Slope", "If we pass this small tax, it will inevitably lead to total collapse of society and disaster will follow."),
        ("Appeal to Authority", "A famous celebrity said this policy is great, so trust me because everyone knows that."),
        ("Circular Reasoning", "This proposal is correct because it cannot be wrong, and it is valid because it is valid."),
        ("Hasty Generalization", "I saw one worker slack off, so all of them never works in all cases."),
        ("Red Herring", "Why talk about this when what about the scandal involving the mayor instead of focusing on the bill."),
    ]

    detected_names = set()
    for expected_name, text in fallacy_samples:
        res = engine.analyze(text)
        found = [f["fallacy_name"] for f in res["fallacies_detected"]]
        for f in res["fallacies_detected"]:
            assert "explanation" in f and len(f["explanation"]) > 5
            assert "correction_suggestion" in f and len(f["correction_suggestion"]) > 5
        detected_names.update(found)

    for expected_name, _ in fallacy_samples:
        assert expected_name in detected_names, f"Expected fallacy {expected_name} was not detected"


def test_api_argument_analysis_endpoints():
    with connection_scope() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (999, 'Test User', 'testengine@example.com', 'hash', 'Learner')"
        )

    user = {"id": 999, "name": "Test User", "email": "testengine@example.com", "role": "Learner"}

    req = ArgumentAnalysisRequest(
        title="Speech on Renewable Energy",
        topic="Renewable Energy Transition",
        speech_text=(
            "We must implement renewable energy policies. Studies from Dr. Smith show 45% reduction in emissions. "
            "Therefore, investing in solar power will lead to sustainable economic growth."
        ),
    )

    # 1. Analyze POST endpoint handler
    data = analyze_argument(req, user=user)
    assert "id" in data
    assert data["scores"]["overall_strength"] > 0
    assert len(data["claims"]) > 0

    record_id = data["id"]

    # 2. History GET endpoint handler
    history = list_argument_analyses(user=user)
    assert any(item["id"] == record_id for item in history)

    # 3. Detail GET endpoint handler
    detail = get_argument_analysis(record_id, user=user)
    assert detail["title"] == "Speech on Renewable Energy"
    assert "analysis_json" in detail

    # 4. Delete DELETE endpoint handler
    res_del = delete_argument_analysis(record_id, user=user)
    assert res_del is None


if __name__ == "__main__":
    print("Running Argument & Fallacy Analysis Engine tests...")
    setup_db()
    test_argument_engine_basic_analysis()
    print("[PASS] test_argument_engine_basic_analysis")
    test_fallacy_detection_all_8_supported_fallacies()
    print("[PASS] test_fallacy_detection_all_8_supported_fallacies")
    test_api_argument_analysis_endpoints()
    print("[PASS] test_api_argument_analysis_endpoints")
    print("All backend tests passed successfully!")
