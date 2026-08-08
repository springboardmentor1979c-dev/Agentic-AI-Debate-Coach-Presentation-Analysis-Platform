"""SQLite persistence helpers for the FastAPI application."""

from pathlib import Path
import sqlite3
from contextlib import contextmanager


DATABASE_PATH = Path(__file__).with_name("users.db")


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def connection_scope():
    """Provide a transaction and always release SQLite's file handle."""
    connection = get_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _add_column_if_missing(connection: sqlite3.Connection, column: str, definition: str) -> None:
    existing_columns = {row["name"] for row in connection.execute("PRAGMA table_info(users)")}
    if column not in existing_columns:
        connection.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")


def _add_profile_column_if_missing(connection: sqlite3.Connection, column: str, definition: str) -> None:
    existing_columns = {row["name"] for row in connection.execute("PRAGMA table_info(user_profiles)")}
    if column not in existing_columns:
        connection.execute(f"ALTER TABLE user_profiles ADD COLUMN {column} {definition}")


def initialize_database() -> None:
    """Create the current schema and safely upgrade the original users table."""
    with connection_scope() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Learner'
                    CHECK (role IN ('Learner', 'Coach', 'Educator', 'Admin')),
                email TEXT UNIQUE,
                password_hash TEXT
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS communication_skills (
                user_id INTEGER PRIMARY KEY,
                clarity INTEGER NOT NULL DEFAULT 50 CHECK (clarity BETWEEN 0 AND 100),
                confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
                argumentation INTEGER NOT NULL DEFAULT 50 CHECK (argumentation BETWEEN 0 AND 100),
                rebuttal INTEGER NOT NULL DEFAULT 50 CHECK (rebuttal BETWEEN 0 AND 100),
                delivery INTEGER NOT NULL DEFAULT 50 CHECK (delivery BETWEEN 0 AND 100),
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS learning_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                target_date TEXT,
                completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS debate_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                topic TEXT NOT NULL,
                position TEXT NOT NULL,
                score INTEGER CHECK (score BETWEEN 0 AND 100),
                feedback TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS presentation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                domain TEXT NOT NULL,
                score INTEGER CHECK (score BETWEEN 0 AND 100),
                feedback TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS debate_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creator_id INTEGER NOT NULL,
                topic TEXT NOT NULL,
                description TEXT,
                format TEXT NOT NULL
                    CHECK (format IN (
                        'One-on-One',
                        'Parliamentary',
                        'Oxford',
                        'Policy',
                        'Public Forum',
                        'AI Debate Simulation'
                    )),
                scheduled_at TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
                recording_notes TEXT,
                recording_url TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS debate_session_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                user_id INTEGER,
                display_name TEXT NOT NULL,
                position TEXT NOT NULL,
                is_ai INTEGER NOT NULL DEFAULT 0 CHECK (is_ai IN (0, 1)),
                FOREIGN KEY (session_id) REFERENCES debate_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
            """
        )
        # Existing projects may already have the original id/name/role table.
        _add_column_if_missing(connection, "email", "TEXT")
        _add_column_if_missing(connection, "password_hash", "TEXT")
        connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                name TEXT NOT NULL,
                experience TEXT NOT NULL,
                goals TEXT NOT NULL,
                preferred_topics TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        _add_profile_column_if_missing(connection, "presentation_domains", "TEXT NOT NULL DEFAULT '[]'")
        _add_profile_column_if_missing(connection, "coaching_preference", "TEXT NOT NULL DEFAULT 'Self-guided'")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS argument_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                topic TEXT,
                speech_text TEXT NOT NULL,
                overall_score INTEGER NOT NULL,
                clarity_score INTEGER NOT NULL,
                relevance_score INTEGER NOT NULL,
                evidence_score INTEGER NOT NULL,
                logic_score INTEGER NOT NULL,
                persuasiveness_score INTEGER NOT NULL,
                credibility_score INTEGER NOT NULL,
                credibility_level TEXT NOT NULL,
                analysis_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS counterargument_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                topic TEXT,
                position TEXT,
                original_argument TEXT NOT NULL,
                counter_strength_score INTEGER NOT NULL,
                report_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS presentation_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                speech_text TEXT NOT NULL,
                duration_seconds REAL,
                wpm REAL NOT NULL,
                pace_category TEXT NOT NULL,
                filler_count INTEGER NOT NULL,
                filler_density REAL NOT NULL,
                confidence_score INTEGER NOT NULL,
                clarity_score INTEGER NOT NULL,
                engagement_score INTEGER NOT NULL,
                overall_score INTEGER NOT NULL,
                analysis_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS debate_simulation_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                topic TEXT NOT NULL,
                user_position TEXT NOT NULL,
                opponent_persona TEXT NOT NULL,
                opponent_name TEXT NOT NULL,
                opponent_title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed')),
                total_turns INTEGER NOT NULL DEFAULT 0,
                user_score INTEGER NOT NULL DEFAULT 0,
                ai_score INTEGER NOT NULL DEFAULT 0,
                opponent_json TEXT NOT NULL,
                summary_json TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS debate_simulation_turns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                turn_number INTEGER NOT NULL,
                user_argument TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                challenge_question TEXT NOT NULL,
                coaching_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES debate_simulation_sessions(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS performance_scorecards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                debate_score REAL NOT NULL,
                presentation_score REAL NOT NULL,
                critical_thinking_score REAL NOT NULL,
                communication_score REAL NOT NULL,
                overall_performance_score REAL NOT NULL,
                performance_tier TEXT NOT NULL,
                scorecard_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS coaching_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                experience_level TEXT NOT NULL,
                target_focus TEXT NOT NULL,
                plan_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                notification_type TEXT NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )





