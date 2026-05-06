import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    return conn

def get_password():
    return

def post_password():
    return

def set_password():
    return

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL,
            role     TEXT    NOT NULL DEFAULT 'student'
        );
    """)
    conn.commit()
    conn.close()