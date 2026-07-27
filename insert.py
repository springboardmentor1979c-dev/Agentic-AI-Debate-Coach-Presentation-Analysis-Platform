import sqlite3

conn = sqlite3.connect("users.db")

cursor = conn.cursor()

cursor.execute(
    "INSERT INTO users(name, role) VALUES(?, ?)",
    ("Jeevan", "Learner")
)

conn.commit()

conn.close()

print("User inserted successfully")
