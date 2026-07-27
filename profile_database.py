import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS user_profiles(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    experience TEXT,
    goals TEXT,
    preferred_topics TEXT
)
""")

cursor.execute("""
INSERT INTO user_profiles
(name, experience, goals, preferred_topics)
VALUES (?, ?, ?, ?)
""",
(
    "Rashmita",
    "Beginner",
    "Improve Debate Skills",
    "AI, Technology"
))

conn.commit()
conn.close()

print("User Profile table created successfully!")