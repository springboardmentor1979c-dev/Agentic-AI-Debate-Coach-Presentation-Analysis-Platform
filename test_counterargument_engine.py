"""Tests for Counterargument Generation Engine and FastAPI Endpoints."""

from counterargument_engine import CounterargumentEngine
from database import initialize_database, connection_scope
from main import (
    CounterargumentRequest,
    generate_counterarguments,
    list_counterargument_reports,
    get_counterargument_report,
    delete_counterargument_report,
)


def setup_db():
    initialize_database()


def test_counter_engine_basic_generation():
    engine = CounterargumentEngine()
    sample = (
        "We must enact a total ban on single-use plastics immediately because data shows 8 million tons "
        "enter our oceans annually according to researchers at NASA. Therefore, switching to sustainable "
        "alternatives will protect marine biodiversity and long-term economic stability."
    )
    res = engine.generate(sample, topic="Plastic Ban", position="Against")

    assert res["summary"]["claims_addressed"] > 0
    assert res["summary"]["rebuttals_generated"] > 0
    assert res["summary"]["counterpoints_generated"] > 0
    assert res["summary"]["challenge_questions_generated"] > 0
    assert res["summary"]["strategies_suggested"] > 0
    assert 10 <= res["summary"]["counter_strength_score"] <= 100


def test_counter_engine_rebuttals_and_counterpoints():
    engine = CounterargumentEngine()
    res = engine.generate("Renewable energy should replace all fossil fuels because it causes less pollution.")
    rebuttals = res["rebuttals"]
    counterpoints = res["counterpoints"]
    assert len(rebuttals) > 0
    for r in rebuttals:
        assert "original_claim" in r
        assert len(r["rebuttals"]) > 0
        for rb in r["rebuttals"]:
            assert "type" in rb
            assert "rebuttal" in rb and len(rb["rebuttal"]) > 10
    assert len(counterpoints) > 0
    for cp in counterpoints:
        assert len(cp["counterpoints"]) > 0


def test_counter_engine_typed_counterarguments():
    engine = CounterargumentEngine()
    res = engine.generate("Universal healthcare should be mandatory.", topic="Healthcare Policy")
    typed = res["typed_counterarguments"]
    expected_types = [
        "Logical Rebuttals",
        "Evidence-Based Rebuttals",
        "Ethical Counterarguments",
        "Practical Counterarguments",
        "Policy Counterarguments",
    ]
    for t in expected_types:
        assert t in typed, f"Missing type: {t}"
        assert len(typed[t]) >= 2, f"Type {t} should have at least 2 counterarguments"
        for arg in typed[t]:
            assert "title" in arg
            assert "argument" in arg and len(arg["argument"]) > 10


def test_counter_engine_perspectives_and_questions():
    engine = CounterargumentEngine()
    res = engine.generate("Taxes should be raised on the wealthy.", topic="Tax Reform")
    assert len(res["alternative_perspectives"]) >= 3
    for p in res["alternative_perspectives"]:
        assert "lens" in p and "perspective" in p
    assert len(res["challenge_questions"]) > 0
    for cq in res["challenge_questions"]:
        assert len(cq["questions"]) >= 2


def test_counter_engine_debate_strategy():
    engine = CounterargumentEngine()
    res = engine.generate(
        "We should ban all social media for children because it causes mental health problems.",
        topic="Social Media Regulation",
    )
    strategies = res["debate_strategy"]
    assert len(strategies) >= 3
    for s in strategies:
        assert "strategy" in s
        assert "description" in s
        assert s["priority"] in ["High", "Medium"]


def test_api_counterargument_endpoints():
    with connection_scope() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (998, 'Counter Tester', 'counter@example.com', 'hash', 'Learner')"
        )

    user = {"id": 998, "name": "Counter Tester", "email": "counter@example.com", "role": "Learner"}

    req = CounterargumentRequest(
        title="Counter to Climate Speech",
        topic="Climate Policy",
        position="Skeptic",
        argument_text=(
            "Climate change will cause catastrophic sea-level rise. According to Dr. Hansen, 3 meters "
            "of rise is inevitable by 2100. Therefore, we must ban all fossil fuel usage immediately."
        ),
    )

    # 1. Generate
    data = generate_counterarguments(req, user=user)
    assert "id" in data
    assert data["summary"]["counter_strength_score"] > 0
    assert len(data["rebuttals"]) > 0
    record_id = data["id"]

    # 2. History
    history = list_counterargument_reports(user=user)
    assert any(item["id"] == record_id for item in history)

    # 3. Detail
    detail = get_counterargument_report(record_id, user=user)
    assert detail["title"] == "Counter to Climate Speech"
    assert "report_json" in detail

    # 4. Delete
    res_del = delete_counterargument_report(record_id, user=user)
    assert res_del is None


if __name__ == "__main__":
    print("Running Counterargument Engine tests...")
    setup_db()
    test_counter_engine_basic_generation()
    print("[PASS] test_counter_engine_basic_generation")
    test_counter_engine_rebuttals_and_counterpoints()
    print("[PASS] test_counter_engine_rebuttals_and_counterpoints")
    test_counter_engine_typed_counterarguments()
    print("[PASS] test_counter_engine_typed_counterarguments")
    test_counter_engine_perspectives_and_questions()
    print("[PASS] test_counter_engine_perspectives_and_questions")
    test_counter_engine_debate_strategy()
    print("[PASS] test_counter_engine_debate_strategy")
    test_api_counterargument_endpoints()
    print("[PASS] test_api_counterargument_endpoints")
    print("All counterargument engine tests passed successfully!")
