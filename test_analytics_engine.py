"""Unit tests for the Dashboard & Analytics Engine."""

import time
from database import initialize_database, connection_scope
from analytics_engine import DashboardAnalyticsEngine


def test_analytics_engine():
    initialize_database()
    engine = DashboardAnalyticsEngine()
    test_email = f"learner_{int(time.time())}@test.com"

    with connection_scope() as conn:
        # Create test user with unique email
        cursor = conn.execute("INSERT INTO users (name, role, email) VALUES ('Test Learner', 'Learner', ?)", (test_email,))
        user_id = cursor.lastrowid

        # 1. Test Learner Analytics
        learner_data = engine.get_learner_analytics(user_id, conn)
        assert learner_data["role"] == "Learner"
        assert "recommended_exercises" in learner_data
        assert "coaching_insights" in learner_data

        # 2. Test Coach Analytics
        coach_data = engine.get_coach_analytics(user_id, conn)
        assert coach_data["role"] == "Coach"
        assert len(coach_data["students"]) >= 1
        assert len(coach_data["skill_gap_analysis"]) >= 1

        # 3. Test Educator Analytics
        educator_data = engine.get_educator_analytics(user_id, conn)
        assert educator_data["role"] == "Educator"
        assert "student_rankings" in educator_data
        assert "debate_performance_reports" in educator_data

        # 4. Test Admin Analytics
        admin_data = engine.get_admin_analytics(user_id, conn)
        assert admin_data["role"] == "Admin"
        assert "user_management" in admin_data
        assert len(admin_data["ai_model_monitoring"]) == 5


if __name__ == "__main__":
    print("Running Dashboard & Analytics Engine tests...")
    test_analytics_engine()
    print("[PASS] test_analytics_engine")
    print("All analytics engine tests passed successfully!")
