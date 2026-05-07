import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_credentials_username(username: str):
    init_credentials_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute(
            "SELECT * FROM credentials where username = ?", (username,)
        )
        credentials = c.fetchone()
    except sqlite3.IntegrityError as e:
        print(f'Error: {e}')
        credentials = None
    conn.close()
    return credentials


def post_credentials(username: str, email: str, password: str):
    init_credentials_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO credentials (username, email, password) VALUES (?, ?, ?)",
            (username, email, password),
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        print(f'Error: {e}')
    conn.close()

def put_credentials(username: str, email: str, password: str): 
    init_credentials_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute(
            "UPDATE credentials SET email = ?, password = ? WHERE username = ?", (email, password, username)
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        print(f'Error: {e}')
    conn.close()

def get_subscribers(username: str):
    init_subscribers_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute('''SELECT email, first_name, last_name 
                   FROM subscribers
                   WHERE username = ?''', (username,))
        data = c.fetchall()
    except Exception as e:
        print(f"Error: {e}")
        return None
    conn.close()
    return dict(data) if data else None

def post_subscriber(username: str, email: str, first_name: str, last_name: str):
    init_subscribers_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO subscribers (username, email, first_name, last_name) VALUES (?, ?, ?, ?)", (username, email, first_name, last_name))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    conn.close()

def put_subscriber(username: str, email: str, first_name: str, last_name: str):
    init_subscribers_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute("UPDATE subscribers SET email = ?, first_name = ?, last_name = ? WHERE username = ?", (email, first_name, last_name, username))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    conn.close()

def delete_subscriber(username: str, email: str):
    init_subscribers_db()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute("DELETE FROM subscribers WHERE username = ? AND email = ?", (username, email))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    conn.close()

def init_subscribers_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT     NOT NULL,
            email TEXT        NOT NULL,
            first_name TEXT   NOT NULL,
            last_name TEXT    NOT NULL,
            UNIQUE(username, email)
        );
    """)
    conn.commit()
    conn.close()

def init_credentials_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS credentials (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    NOT NULL UNIQUE,
            email TEXT    NOT NULL UNIQUE,
            password     TEXT    NOT NULL
        );
    """)
    conn.commit()
    conn.close()

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
    init_credentials_db()
    conn = get_conn()
    c = conn.cursor()
    c.execute("""SELECT u.id, u.username, u.role, u.password, c.email FROM users u
              LEFT JOIN credentials c ON c.username = u.username
              WHERE u.username = ?""", (username,))
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