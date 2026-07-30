import os
import sqlite3

DATABASE_PATH = os.environ.get("DATABASE_PATH")
if not DATABASE_PATH:
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("sqlite:///"):
        DATABASE_PATH = db_url.replace("sqlite:///", "")
    elif os.path.exists("/app/data") or os.environ.get("AM_I_IN_A_DOCKER_CONTAINER") == "true":
        DATABASE_PATH = "/app/data/debate.db"
    else:
        DATABASE_PATH = "debate.db"

# Ensure the parent directory of the database file exists
db_dir = os.path.dirname(DATABASE_PATH)
if db_dir:
    os.makedirs(db_dir, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
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

    # Migrate debate_turns to support audio recording path & duration
    cursor.execute("PRAGMA table_info(debate_turns)")
    columns = [col[1] for col in cursor.fetchall()]
    if "audio_path" not in columns:
        cursor.execute("ALTER TABLE debate_turns ADD COLUMN audio_path TEXT")
    if "duration" not in columns:
        cursor.execute("ALTER TABLE debate_turns ADD COLUMN duration REAL DEFAULT 0.0")

    # Migrate performance_scores to support aggregate speech analytics metrics
    cursor.execute("PRAGMA table_info(performance_scores)")
    columns = [col[1] for col in cursor.fetchall()]
    for col_name in ["total_duration", "total_words", "avg_wpm", "total_fillers"]:
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE performance_scores ADD COLUMN {col_name} REAL")

    # =========================================================
    # NEW TABLES FOR ROLE-SPECIFIC WORKSPACES & TELEMETRY
    # =========================================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS coach_learner_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coach_id INTEGER NOT NULL,
            learner_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(coach_id, learner_id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            educator_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (educator_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS class_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            learner_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(class_id, learner_id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ai_request_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL,
            model TEXT NOT NULL,
            operation TEXT NOT NULL,
            success INTEGER NOT NULL,
            latency_ms INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            error_category TEXT
        )
        """
    )

    # =========================
    # COACH FEEDBACK TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS coach_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coach_id INTEGER NOT NULL,
            learner_id INTEGER NOT NULL,
            feedback_type TEXT NOT NULL DEFAULT 'general',
            content TEXT NOT NULL,
            exercises TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # =========================
    # ACHIEVEMENTS TABLE
    # =========================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # Seed assignments and class associations for demo/development ease
    cursor.execute("SELECT id FROM users WHERE role = 'Coach'")
    coaches = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM users WHERE role = 'Educator'")
    educators = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT id FROM users WHERE role = 'Learner'")
    learners = [row[0] for row in cursor.fetchall()]

    if coaches and learners:
        for l_id in learners:
            for c_id in coaches:
                cursor.execute(
                    "INSERT OR IGNORE INTO coach_learner_assignments (coach_id, learner_id) VALUES (?, ?)",
                    (c_id, l_id)
                )

    if educators and learners:
        for ed_id in educators:
            cursor.execute("SELECT id FROM classes WHERE educator_id = ?", (ed_id,))
            class_row = cursor.fetchone()
            if not class_row:
                cursor.execute("INSERT INTO classes (name, educator_id) VALUES (?, ?)", ("Debate & Presentation Class A", ed_id))
                class_id = cursor.lastrowid
            else:
                class_id = class_row[0]
                
            for l_id in learners:
                cursor.execute(
                    "INSERT OR IGNORE INTO class_members (class_id, learner_id) VALUES (?, ?)",
                    (class_id, l_id)
                )

    conn.commit()
    conn.close()

    print("Database tables created successfully.")


if __name__ == "__main__":
    create_tables()