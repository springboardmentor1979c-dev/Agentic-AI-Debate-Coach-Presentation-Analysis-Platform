"""Unit tests for the Notification & Engagement System."""

import time
from database import initialize_database, connection_scope
from notification_system import NotificationEngagementSystem


def test_notification_system():
    initialize_database()
    notifier = NotificationEngagementSystem()
    test_email = f"notify_user_{int(time.time())}@test.com"

    with connection_scope() as conn:
        # Create test user
        cursor = conn.execute("INSERT INTO users (name, role, email) VALUES ('Notify Tester', 'Learner', ?)", (test_email,))
        user_id = cursor.lastrowid

        # 1. Fetch notifications (triggers seeding of 5 default notification types)
        notes = notifier.get_user_notifications(user_id, conn)
        assert len(notes) >= 5

        types = [n["notification_type"] for n in notes]
        assert "debate_reminder" in types
        assert "coaching_feedback" in types
        assert "practice_reminder" in types
        assert "skill_milestone" in types
        assert "platform_announcement" in types

        # 2. Test mark as read
        note_id = notes[0]["id"]
        res = notifier.mark_as_read(note_id, user_id, conn)
        assert res is True

        # 3. Create custom notification
        new_id = notifier.create_notification(user_id, "Custom Alert", "Test Message", "custom", conn)
        assert new_id > 0


if __name__ == "__main__":
    print("Running Notification & Engagement System tests...")
    test_notification_system()
    print("[PASS] test_notification_system (Debate Reminders, Coaching Feedback Alerts, Practice Reminders, Skill Milestones, and Announcements verified)")
    print("All notification system tests passed successfully!")
