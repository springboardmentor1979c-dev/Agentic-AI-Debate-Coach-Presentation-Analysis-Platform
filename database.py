import sqlite3

# Connect to database (creates it if it doesn't exist)
conn = sqlite3.connect("users.db")

# Create cursor
cursor = conn.cursor()

# Create table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT
)
""")

# Insert sample user
cursor.execute(
    "INSERT INTO users (name, role) VALUES (?, ?)",
    ("Rashmita", "Learner")
)

# Save changes
conn.commit()

# Close connection
conn.close()

print("Database created and sample user inserted successfully!")