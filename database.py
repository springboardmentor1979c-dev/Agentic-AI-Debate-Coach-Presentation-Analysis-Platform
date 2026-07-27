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
            presentation_domains TEXT,
            coaching_preferences TEXT,
            communication_skill_tracking TEXT,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
        """
    )

    # Check and add missing columns to profiles if they do not exist (for smooth migration)
    cursor.execute("PRAGMA table_info(profiles)")
    columns = [col[1] for col in cursor.fetchall()]
    for col_name in ["presentation_domains", "coaching_preferences", "communication_skill_tracking"]:
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} TEXT")

    # =========================
    # DEBATE SESSIONS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS debate_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            format TEXT NOT NULL,
            position TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # DEBATE TURNS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS debate_turns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            speaker TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES debate_sessions(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # ARGUMENT ANALYSES TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS argument_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            turn_id INTEGER UNIQUE NOT NULL,
            claims TEXT,
            evidence TEXT,
            reasoning_analysis TEXT,
            clarity REAL,
            relevance REAL,
            evidence_strength REAL,
            logical_consistency REAL,
            persuasiveness REAL,
            strengths TEXT,
            weaknesses TEXT,
            feedback TEXT,
            FOREIGN KEY (turn_id) REFERENCES debate_turns(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # FALLACY DETECTIONS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS fallacy_detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            turn_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            span TEXT,
            explanation TEXT,
            confidence REAL,
            correction TEXT,
            FOREIGN KEY (turn_id) REFERENCES debate_turns(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # PERFORMANCE SCORES TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS performance_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER UNIQUE NOT NULL,
            argument_quality REAL NOT NULL,
            evidence_usage REAL NOT NULL,
            logical_consistency REAL NOT NULL,
            rebuttal_effectiveness REAL NOT NULL,
            communication_skills REAL NOT NULL,
            overall_score REAL NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES debate_sessions(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # PRESENTATION SESSIONS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS presentation_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            duration REAL,
            transcript TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # PRESENTATION ANALYSES TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS presentation_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            presentation_id INTEGER UNIQUE NOT NULL,
            speech_pace REAL,
            filler_word_usage TEXT,
            confidence_score REAL,
            clarity_score REAL,
            audience_engagement_score REAL,
            feedback TEXT,
            FOREIGN KEY (presentation_id) REFERENCES presentation_sessions(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # RECOMMENDATIONS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # NOTIFICATIONS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # REPORTS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    conn.commit()
    conn.close()

    print("Database tables created successfully.")


if __name__ == "__main__":
    create_tables()