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
