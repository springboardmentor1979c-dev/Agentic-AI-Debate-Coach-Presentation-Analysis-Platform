import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

# Delete old users table
cursor.execute("DROP TABLE IF EXISTS users")

# Create users table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
)
""")

# Insert one sample user
cursor.execute("""
INSERT OR IGNORE INTO users(username, password, role)
VALUES (?, ?, ?)
""", ("rashmita", "1234", "Learner"))

conn.commit()
conn.close()

print("Day 2 database created successfully!")