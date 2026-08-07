import sqlite3
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).parent / "app.db"

VALID_ROLES = {"learner", "coach", "educator", "admin"}


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        # ------------------------------------------------------------------ #
        # Users & Profiles
        # ------------------------------------------------------------------ #
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                name            TEXT     NOT NULL,
                email           TEXT     NOT NULL UNIQUE,
                hashed_password TEXT     NOT NULL,
                role            TEXT     NOT NULL DEFAULT 'learner',
                created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id               INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER  NOT NULL UNIQUE
                                          REFERENCES users(id) ON DELETE CASCADE,
                experience       TEXT,
                goals            TEXT,
                preferred_topics TEXT,
                updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ------------------------------------------------------------------ #
        # Debate Sessions & Arguments
        # ------------------------------------------------------------------ #
        conn.execute("""
            CREATE TABLE IF NOT EXISTS debate_sessions (
                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id         INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                topic           TEXT     NOT NULL,
                format          TEXT     NOT NULL DEFAULT 'one_on_one',
                position        TEXT     NOT NULL DEFAULT 'for',
                status          TEXT     NOT NULL DEFAULT 'active',
                notes           TEXT,
                created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS debate_arguments (
                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                session_id      INTEGER  NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
                user_id         INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content         TEXT     NOT NULL,
                argument_type   TEXT     NOT NULL DEFAULT 'opening',
                analysis_json   TEXT,
                created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ------------------------------------------------------------------ #
        # Performance Scores
        # ------------------------------------------------------------------ #
        conn.execute("""
            CREATE TABLE IF NOT EXISTS performance_scores (
                id                    INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                session_id            INTEGER REFERENCES debate_sessions(id) ON DELETE SET NULL,
                score_type            TEXT    NOT NULL DEFAULT 'debate',
                argument_quality      REAL    DEFAULT 0,
                evidence_usage        REAL    DEFAULT 0,
                logical_consistency   REAL    DEFAULT 0,
                rebuttal_effectiveness REAL   DEFAULT 0,
                communication_skills  REAL    DEFAULT 0,
                weighted_total        REAL    DEFAULT 0,
                grade                 TEXT    DEFAULT 'N/A',
                performance_level     TEXT    DEFAULT 'Beginner',
                score_json            TEXT,
                created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ------------------------------------------------------------------ #
        # Coaching Recommendations
        # ------------------------------------------------------------------ #
        conn.execute("""
            CREATE TABLE IF NOT EXISTS coaching_recommendations (
                id          INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                report_json TEXT     NOT NULL,
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ------------------------------------------------------------------ #
        # Notifications
        # ------------------------------------------------------------------ #
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id          INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title       TEXT     NOT NULL,
                message     TEXT     NOT NULL,
                notif_type  TEXT     NOT NULL DEFAULT 'info',
                is_read     INTEGER  NOT NULL DEFAULT 0,
                created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


# ========================================================================== #
# Users
# ========================================================================== #
def create_user(name: str, email: str, hashed_password: str, role: str = "learner") -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO users (name, email, hashed_password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_password, role),
        )
        conn.commit()
        return get_user_by_id(cur.lastrowid)


def get_user_by_email(email: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, name, email, hashed_password, role, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, name, email, hashed_password, role, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


def get_all_users() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, email, role, created_at FROM users"
        ).fetchall()
        return [dict(r) for r in rows]


# ========================================================================== #
# Profiles
# ========================================================================== #
def upsert_profile(user_id: int, experience: str, goals: str, preferred_topics: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute("""
            INSERT INTO profiles (user_id, experience, goals, preferred_topics, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                experience       = excluded.experience,
                goals            = excluded.goals,
                preferred_topics = excluded.preferred_topics,
                updated_at       = excluded.updated_at
        """, (user_id, experience, goals, preferred_topics, now))
        conn.commit()
        return get_profile_by_user(user_id)


def get_profile_by_user(user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, user_id, experience, goals, preferred_topics, updated_at "
            "FROM profiles WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


# ========================================================================== #
# Debate Sessions
# ========================================================================== #
def create_debate_session(user_id: int, topic: str, format: str, position: str, notes: str = "") -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO debate_sessions (user_id, topic, format, position, notes, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, topic, format, position, notes, now, now),
        )
        conn.commit()
        return get_debate_session(cur.lastrowid)


def get_debate_session(session_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM debate_sessions WHERE id = ?", (session_id,)
        ).fetchone()
        return dict(row) if row else None


def get_user_debate_sessions(user_id: int) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM debate_sessions WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def update_session_status(session_id: int, status: str) -> dict | None:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "UPDATE debate_sessions SET status = ?, updated_at = ? WHERE id = ?",
            (status, now, session_id),
        )
        conn.commit()
        return get_debate_session(session_id)


# ========================================================================== #
# Debate Arguments
# ========================================================================== #
def add_argument(session_id: int, user_id: int, content: str, argument_type: str, analysis_json: str = "") -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO debate_arguments (session_id, user_id, content, argument_type, analysis_json, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, user_id, content, argument_type, analysis_json, now),
        )
        conn.commit()
        return get_argument(cur.lastrowid)


def get_argument(arg_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM debate_arguments WHERE id = ?", (arg_id,)).fetchone()
        return dict(row) if row else None


def get_session_arguments(session_id: int) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM debate_arguments WHERE session_id = ? ORDER BY created_at ASC",
            (session_id,),
        ).fetchall()
        return [dict(r) for r in rows]


# ========================================================================== #
# Performance Scores
# ========================================================================== #
def save_performance_score(
    user_id: int,
    score_type: str,
    weighted_total: float,
    grade: str,
    performance_level: str,
    score_json: str,
    session_id: int | None = None,
    argument_quality: float = 0,
    evidence_usage: float = 0,
    logical_consistency: float = 0,
    rebuttal_effectiveness: float = 0,
    communication_skills: float = 0,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute("""
            INSERT INTO performance_scores
            (user_id, session_id, score_type, argument_quality, evidence_usage,
             logical_consistency, rebuttal_effectiveness, communication_skills,
             weighted_total, grade, performance_level, score_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, session_id, score_type, argument_quality, evidence_usage,
              logical_consistency, rebuttal_effectiveness, communication_skills,
              weighted_total, grade, performance_level, score_json, now))
        conn.commit()
        row = conn.execute("SELECT * FROM performance_scores WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row) if row else {}


def get_user_scores(user_id: int, limit: int = 20) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM performance_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
        return [dict(r) for r in rows]


def get_all_scores() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM performance_scores ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


# ========================================================================== #
# Coaching Recommendations
# ========================================================================== #
def save_coaching(user_id: int, report_json: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO coaching_recommendations (user_id, report_json, created_at) VALUES (?, ?, ?)",
            (user_id, report_json, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM coaching_recommendations WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row) if row else {}


def get_latest_coaching(user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM coaching_recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


# ========================================================================== #
# Notifications
# ========================================================================== #
def create_notification(user_id: int, title: str, message: str, notif_type: str = "info") -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO notifications (user_id, title, message, notif_type, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, title, message, notif_type, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM notifications WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row) if row else {}


def get_user_notifications(user_id: int) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def mark_notification_read(notif_id: int) -> dict | None:
    with get_connection() as conn:
        conn.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notif_id,))
        conn.commit()
        row = conn.execute("SELECT * FROM notifications WHERE id = ?", (notif_id,)).fetchone()
        return dict(row) if row else None


