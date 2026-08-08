"""Notification & Engagement System (Module 12).

Provides Debate Reminders, Coaching Feedback Alerts, Practice Session Reminders,
Skill Milestone Notifications, and Platform Announcements.
"""

from typing import Any, Dict, List
import sqlite3


class NotificationEngagementSystem:
    """Core notification and engagement system."""

    def get_user_notifications(self, user_id: int, connection: sqlite3.Connection) -> List[Dict[str, Any]]:
        """Fetch active notifications for user."""
        rows = connection.execute(
            """SELECT id, title, message, notification_type, is_read, created_at
               FROM notifications WHERE user_id = ? ORDER BY id DESC""",
            (user_id,),
        ).fetchall()

        if not rows:
            # Seed default system notifications for user
            self.seed_default_notifications(user_id, connection)
            rows = connection.execute(
                """SELECT id, title, message, notification_type, is_read, created_at
                   FROM notifications WHERE user_id = ? ORDER BY id DESC""",
                (user_id,),
            ).fetchall()

        return [dict(r) for r in rows]

    def seed_default_notifications(self, user_id: int, connection: sqlite3.Connection):
        """Seed initial notifications (reminders, alerts, milestones, announcements)."""
        defaults = [
            ("Debate Round Reminder", "Your scheduled Oxford Debate round starts tomorrow at 10:00 AM.", "debate_reminder"),
            ("Coaching Feedback Alert", "New personalized feedback generated for your latest Keynote speech.", "coaching_feedback"),
            ("Daily Practice Session Reminder", "Complete a 5-minute filler word control drill to maintain your streak.", "practice_reminder"),
            ("Skill Milestone Unlocked", "🏆 Milestone Reached: Achieved >80 in Rebuttal Effectiveness!", "skill_milestone"),
            ("Platform Announcement", "🚀 Version 2.4 Agentic Debate Coach is live with AI Simulation Arena!", "platform_announcement"),
        ]
        for title, msg, ntype in defaults:
            connection.execute(
                """INSERT INTO notifications (user_id, title, message, notification_type)
                   VALUES (?, ?, ?, ?)""",
                (user_id, title, msg, ntype),
            )

    def create_notification(self, user_id: int, title: str, message: str, notification_type: str, connection: sqlite3.Connection) -> int:
        """Create a new notification."""
        cursor = connection.execute(
            """INSERT INTO notifications (user_id, title, message, notification_type)
               VALUES (?, ?, ?, ?)""",
            (user_id, title, message, notification_type),
        )
        return cursor.lastrowid

    def mark_as_read(self, notification_id: int, user_id: int, connection: sqlite3.Connection) -> bool:
        """Mark a notification as read."""
        cursor = connection.execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            (notification_id, user_id),
        )
        return cursor.rowcount > 0
