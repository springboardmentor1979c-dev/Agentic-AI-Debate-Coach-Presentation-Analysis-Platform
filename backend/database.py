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
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id              INTEGER  PRIMARY KEY AUTOINCREMENT,
                name            TEXT     NOT NULL,
                email           TEXT     NOT NULL UNIQUE,
                hashed_password TEXT     NOT NULL,
                role            TEXT     NOT NULL DEFAULT 'learner',
                created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id               INTEGER  PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER  NOT NULL UNIQUE
                                          REFERENCES users(id) ON DELETE CASCADE,
                experience       TEXT,
                goals            TEXT,
                preferred_topics TEXT,
                updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


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


def upsert_profile(
    user_id: int,
    experience: str,
    goals: str,
    preferred_topics: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO profiles (user_id, experience, goals, preferred_topics, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                experience       = excluded.experience,
                goals            = excluded.goals,
                preferred_topics = excluded.preferred_topics,
                updated_at       = excluded.updated_at
            """,
            (user_id, experience, goals, preferred_topics, now),
        )
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


init_db()
