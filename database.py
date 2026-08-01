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
