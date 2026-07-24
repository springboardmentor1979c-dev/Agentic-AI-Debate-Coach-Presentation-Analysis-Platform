import sqlite3

conn = sqlite3.connect("debate.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM users")

for row in cursor.fetchall():
    print(row)

conn.close()