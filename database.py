import sqlite3

DATABASE_NAME = "debate.db"


def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():

    conn = get_db()
    cursor = conn.cursor()

    # =========================
    # USERS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
        """
    )

    # =========================
    # PROFILES TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            name TEXT NOT NULL,
            experience_level TEXT,
            goals TEXT,
            preferred_topics TEXT,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
        """
    )

    conn.commit()
    conn.close()

    print("Database tables created successfully.")


if __name__ == "__main__":
    create_tables()