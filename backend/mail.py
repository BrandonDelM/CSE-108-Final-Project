import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def temp():
    conn = get_conn()
    c = conn.cursor()
    # c.execute("UPDATE emails SET sent = 0")
    # c.execute("ALTER TABLE emails ADD COLUMN sent INTEGER")
    # c.execute("INSERT INTO groups (username, body, header, date) VALUES (?,?,?,?)", ("test", "<p>HELLO</p>", "Funny", "2026-05-10"))
    c.execute("""CREATE TABLE IF NOT EXISTS groups (
              id                INTEGER PRIMARY KEY AUTOINCREMENT,
              username          TEXT NOT NULL,
              email             TEXT NOT NULL,
              name             TEXT NOT NULL 
              )""")
    conn.commit()
    conn.close()

# temp()