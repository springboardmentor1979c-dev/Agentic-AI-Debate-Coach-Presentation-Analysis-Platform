import logging
from typing import Dict, Any, List

logger = logging.getLogger("debate_coach.notifications_service")

def create_notification(db_conn, user_id: int, title: str, content: str):
    cursor = db_conn.cursor()
    cursor.execute(
        """
        INSERT INTO notifications (user_id, title, content)
        VALUES (?, ?, ?)
        """,
        (user_id, title, content)
    )
    db_conn.commit()

def get_notifications(db_conn, user_id: int) -> List[Dict[str, Any]]:
    cursor = db_conn.cursor()
    cursor.execute(
        """
        SELECT id, title, content, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    )
    rows = cursor.fetchall()
    return [dict(r) for r in rows]

def mark_notification_as_read(db_conn, notification_id: int, user_id: int):
    cursor = db_conn.cursor()
    cursor.execute(
        """
        UPDATE notifications
        SET is_read = 1
        WHERE id = ? AND user_id = ?
        """,
        (notification_id, user_id)
    )
    db_conn.commit()
