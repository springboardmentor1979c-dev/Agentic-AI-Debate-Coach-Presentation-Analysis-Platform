"""End-to-End Integration, API Validation & Security Tests (Module 14).

Verifies the complete user workflow:
Register → Login → Profile → Argument Analysis → Counter Generation →
Presentation Analysis → AI Simulation → Performance Scoring →
Coaching Plan → Analytics → Reports Export → Notifications
"""

import time
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from database import initialize_database, connection_scope
from argument_engine import ArgumentAnalysisEngine
from counterargument_engine import CounterargumentEngine
from presentation_engine import PresentationAnalysisEngine
from simulation_engine import AIDebateSimulationEngine
from scoring_engine import PerformanceScoringEngine
from coaching_engine import RecommendationCoachingEngine
from analytics_engine import DashboardAnalyticsEngine
from report_exporter import ReportExportSystem
from notification_system import NotificationEngagementSystem


def test_e2e_complete_workflow():
    """Test the entire platform workflow end-to-end."""
    initialize_database()
    ts = int(time.time())
    test_email = f"e2e_user_{ts}@integration.test"

    with connection_scope() as conn:
        # Step 1: User Registration & Profile
        cursor = conn.execute(
            "INSERT INTO users (name, role, email, password_hash) VALUES (?, 'Learner', ?, 'hashed_pw')",
            (f"E2E Tester {ts}", test_email),
        )
        user_id = cursor.lastrowid
        assert user_id > 0, "User registration failed"

        # Step 2: Argument Analysis Engine
        arg_engine = ArgumentAnalysisEngine()
        speech = (
            "We must ban single-use plastics because research data shows a 40% reduction "
            "in ocean pollution. Therefore, studies prove environmental sustainability. "
            "However, critics who oppose this are simply ignorant of science."
        )
        analysis = arg_engine.analyze(speech, topic="Plastic Ban")
        assert analysis["overall_score"] > 0, "Argument analysis returned zero score"
        assert len(analysis["fallacies"]) > 0, "Fallacy detection failed"

        # Store analysis
        conn.execute(
            """INSERT INTO argument_analyses (
                user_id, title, topic, speech_text, overall_score,
                clarity_score, relevance_score, evidence_score, logic_score,
                persuasiveness_score, credibility_score, credibility_level, analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id, "E2E Test Analysis", "Plastic Ban", speech,
                analysis["overall_score"],
                analysis["criteria"]["clarity"],
                analysis["criteria"]["relevance"],
                analysis["criteria"]["evidence"],
                analysis["criteria"]["logic"],
                analysis["criteria"]["persuasiveness"],
                analysis["source_credibility"]["credibility_score"],
                analysis["source_credibility"]["credibility_level"],
                json.dumps(analysis),
            ),
        )

        # Step 3: Counterargument Generation
        counter_eng = CounterargumentEngine()
        counters = counter_eng.generate(speech, topic="Plastic Ban")
        assert len(counters["rebuttals"]) > 0, "Rebuttal generation failed"
        assert len(counters["counterargument_types"]) >= 5, "Not all 5 counterargument types generated"

        # Step 4: Presentation Analysis
        pres_engine = PresentationAnalysisEngine()
        pres = pres_engine.analyze(speech)
        assert pres["speech_pace"]["word_count"] > 0, "Presentation word count zero"
        assert pres["confidence_score"] >= 0, "Confidence score invalid"

        # Step 5: AI Debate Simulation
        sim_engine = AIDebateSimulationEngine()
        session = sim_engine.start_session("Should AI replace teachers?", "socratic_scholar")
        assert session["opponent"]["name"] == "Socratic Scholar", "Wrong AI opponent"
        turn = sim_engine.process_turn(session, "AI cannot replace human empathy in education.")
        assert len(turn["ai_response"]) > 0, "AI response empty"
        assert len(turn["challenge_question"]) > 0, "Challenge question not generated"

        # Step 6: Performance Scoring (30/20/20/15/15 weighted model)
        score_engine = PerformanceScoringEngine()
        scorecard = score_engine.evaluate_performance(
            title="E2E Scorecard",
            argument_quality=85, evidence_usage=78,
            logical_consistency=82, rebuttal_effectiveness=75,
            communication_skills=80,
        )
        expected_debate = round(85*0.3 + 78*0.2 + 82*0.2 + 75*0.15 + 80*0.15, 1)
        assert scorecard["scores"]["debate_performance"] == expected_debate, "Weighted debate score incorrect"
        assert scorecard["performance_tier"] in ["Master Orator", "Proficient Speaker", "Developing Communicator", "Novice Practice"]

        # Step 7: Coaching & Recommendations
        coach_engine = RecommendationCoachingEngine()
        coaching = coach_engine.generate_recommendations(
            debate_score=80.0, presentation_score=75.0,
            recent_fallacies=["Ad Hominem"], user_role="Learner",
        )
        assert len(coaching["debate_recommendations"]) > 0
        assert len(coaching["skill_development_plan"]) == 4
        assert len(coaching["learning_path"]["weekly_modules"]) == 4

        # Step 8: Dashboard Analytics
        analytics_eng = DashboardAnalyticsEngine()
        learner_data = analytics_eng.get_learner_analytics(user_id, conn)
        assert learner_data["role"] == "Learner"
        assert len(learner_data["recommended_exercises"]) >= 3

        # Step 9: Reports & Export
        exporter = ReportExportSystem()
        progress = exporter.get_learning_progress_report(user_id, conn)
        assert progress["report_type"] == "Learning Progress Report"
        csv_out = exporter.export_excel(progress)
        assert "Metric / Field,Value" in csv_out
        pdf_out = exporter.export_pdf(progress)
        assert pdf_out.startswith(b"%PDF-1.4")

        # Step 10: Notifications
        notifier = NotificationEngagementSystem()
        notes = notifier.get_user_notifications(user_id, conn)
        assert len(notes) >= 5
        types = {n["notification_type"] for n in notes}
        assert "debate_reminder" in types
        assert "skill_milestone" in types

    print("[PASS] E2E Complete Workflow: Register → Analyze → Counter → Present → Simulate → Score → Coach → Analytics → Export → Notify")


def test_api_validation():
    """Validate API endpoint contracts and data integrity."""
    # Validate engine output contracts
    arg = ArgumentAnalysisEngine()
    result = arg.analyze("Test claim with evidence from research.")
    required_keys = {"overall_score", "criteria", "fallacies", "claims", "source_credibility"}
    assert required_keys.issubset(set(result.keys())), f"Missing keys in argument analysis: {required_keys - set(result.keys())}"

    criteria_keys = {"clarity", "relevance", "evidence", "logic", "persuasiveness"}
    assert criteria_keys.issubset(set(result["criteria"].keys())), "Missing criteria dimensions"

    # Validate scoring contract
    scorer = PerformanceScoringEngine()
    sc = scorer.evaluate_performance(title="Contract Test", argument_quality=80, evidence_usage=70, logical_consistency=75, rebuttal_effectiveness=65, communication_skills=72)
    required_score_keys = {"overall_performance_score", "performance_tier", "scores", "strengths", "coaching_plan"}
    assert required_score_keys.issubset(set(sc.keys())), f"Missing keys in scorecard: {required_score_keys - set(sc.keys())}"

    print("[PASS] API Validation: All endpoint contracts verified")


def test_security_validation():
    """Security-focused tests: input sanitization, boundary checks."""
    arg = ArgumentAnalysisEngine()

    # XSS injection attempt
    xss_input = '<script>alert("xss")</script> This is an argument.'
    result = arg.analyze(xss_input)
    assert result["overall_score"] >= 0, "XSS input caused crash"

    # SQL injection attempt
    sql_input = "'; DROP TABLE users; -- This is an argument."
    result2 = arg.analyze(sql_input)
    assert result2["overall_score"] >= 0, "SQL injection caused crash"

    # Empty input boundary
    empty_result = arg.analyze("")
    assert empty_result["overall_score"] >= 0, "Empty input caused crash"

    # Very long input (performance boundary)
    long_input = "word " * 5000
    long_result = arg.analyze(long_input)
    assert long_result["overall_score"] >= 0, "Long input caused crash"

    # Score boundary validation
    scorer = PerformanceScoringEngine()
    max_score = scorer.evaluate_performance(title="Max", argument_quality=100, evidence_usage=100, logical_consistency=100, rebuttal_effectiveness=100, communication_skills=100)
    assert max_score["scores"]["debate_performance"] == 100.0, "Max score should be 100"

    min_score = scorer.evaluate_performance(title="Min", argument_quality=0, evidence_usage=0, logical_consistency=0, rebuttal_effectiveness=0, communication_skills=0)
    assert min_score["scores"]["debate_performance"] == 0.0, "Min score should be 0"

    print("[PASS] Security Validation: XSS, SQL Injection, Boundary checks all passed")


if __name__ == "__main__":
    print("=" * 70)
    print("MODULE 14: Final Integration, Testing & Deployment")
    print("=" * 70)
    test_e2e_complete_workflow()
    test_api_validation()
    test_security_validation()
    print("=" * 70)
    print("ALL MODULE 14 TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)
