"""SQLite setup and connection helpers for the Debate Coach API."""

from __future__ import annotations

import os
import sqlite3


DEFAULT_DATABASE_PATH = "users.db"


def get_database_path() -> str:
    """Allow tests and deployments to choose a database without code changes."""
    return os.getenv("DATABASE_PATH", DEFAULT_DATABASE_PATH)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(get_database_path())
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    """Create the application tables if they do not already exist."""
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('Learner', 'Coach', 'Educator', 'Admin'))
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                name TEXT NOT NULL,
                experience_level TEXT NOT NULL,
                goals TEXT NOT NULL,
                preferred_topics TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully!")
