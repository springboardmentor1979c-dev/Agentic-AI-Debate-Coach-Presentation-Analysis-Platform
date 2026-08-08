"""Unit tests for the AI Debate Simulation Engine."""

from simulation_engine import AIDebateSimulationEngine


def test_simulation_opponent_generation():
    engine = AIDebateSimulationEngine()
    opponent = engine.generate_opponent(
        persona_key="socratic",
        topic="Universal Basic Income",
        user_position="For",
    )

    assert opponent["persona_key"] == "socratic"
    assert opponent["name"] == "Dr. Sophia Vance"
    assert opponent["user_position"] == "For"
    assert opponent["ai_position"] == "Against"
    assert "Universal Basic Income" in opponent["opening_statement"]


def test_simulation_process_turn():
    engine = AIDebateSimulationEngine()
    opponent = engine.generate_opponent("policy", "Carbon Tax Policy", "Against")
    session = {"topic": "Carbon Tax Policy", "opponent": opponent}
    turn = engine.process_turn(
        session,
        "Carbon taxes create direct financial incentive for industries to adopt green technologies.",
    )

    assert turn["turn_number"] == 1
    assert len(turn["ai_response"]) > 20
    assert "Challenge Question" in turn["challenge_question"] or "Cross-Examination" in turn["challenge_question"] or "Dilemma" in turn["challenge_question"] or "Counter-Challenge" in turn["challenge_question"]
    coaching = turn["coaching_feedback"]
    assert coaching["turn_score"] > 0
    assert len(coaching["strengths"]) > 0
    assert len(coaching["suggested_responses"]) > 0


def test_simulation_generate_summary():
    engine = AIDebateSimulationEngine()
    opponent = engine.generate_opponent("hard_hitting", "AI Automation", "For")
    turns = [
        {
            "turn_number": 1,
            "user_argument": "AI increases productivity and creates new technological sectors.",
            "coaching_feedback": {"turn_score": 85},
        },
        {
            "turn_number": 2,
            "user_argument": "Reskilling programs will mitigate job displacement effects.",
            "coaching_feedback": {"turn_score": 78},
        },
    ]
    summary = engine.generate_summary(topic="AI Automation", opponent=opponent, turns=turns)

    assert summary["total_rounds"] == 2
    assert summary["final_user_score"] > 0
    assert summary["final_ai_score"] > 0
    assert len(summary["verdict"]) > 10
    assert len(summary["key_takeaways"]) > 0


if __name__ == "__main__":
    print("Running AI Debate Simulation Engine tests...")
    test_simulation_opponent_generation()
    print("[PASS] test_simulation_opponent_generation")
    test_simulation_process_turn()
    print("[PASS] test_simulation_process_turn")
    test_simulation_generate_summary()
    print("[PASS] test_simulation_generate_summary")
    print("All simulation engine tests passed successfully!")
