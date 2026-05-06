import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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

# ── Users ────────────────────────────────────────────────────────────────────

def get_user_by_username(username: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id: int):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(username: str, hashed_password: str, role: str = "student"):
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            (username, hashed_password, role),
        )
        conn.commit()
        user_id = c.lastrowid
    except sqlite3.IntegrityError:
        user_id = None
    conn.close()
    return user_id


def get_all_users():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, username, role FROM users ORDER BY id")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_user_role(user_id: int, role: str):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
    conn.commit()
    conn.close()


def delete_user(user_id: int):
    conn = get_conn()
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()