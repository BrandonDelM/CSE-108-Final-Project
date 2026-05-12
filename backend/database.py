import psycopg2
import psycopg2.extras
import os
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_conn():
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    return conn

def dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def get_credentials_username(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("SELECT * FROM credentials WHERE username = %s", (username,))
        row = c.fetchone()
    except Exception as e:
        print(f"Error: {e}")
        row = None
    conn.close()
    return dict(row) if row else None

def post_credentials(username: str, email: str, password: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("INSERT INTO credentials (username, email, password) VALUES (%s, %s, %s)",
                  (username, email, password))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    conn.close()

def put_credentials(username: str, email: str, password: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("UPDATE credentials SET email = %s, password = %s WHERE username = %s",
                  (email, password, username))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    conn.close()


def get_subscribers(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("SELECT id, email, first_name, last_name, groups FROM subscribers WHERE username = %s", (username,))
        rows = c.fetchall()
    except Exception as e:
        print(f"Error: {e}")
        return None
    conn.close()
    return [dict(row) for row in rows]

def get_subscribers_email(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("SELECT email FROM subscribers WHERE username = %s", (username,))
        rows = c.fetchall()
    except Exception as e:
        print(f"Error: {e}")
        return []
    conn.close()
    return [row["email"] for row in rows]

def post_subscriber(username: str, email: str, first_name: str, last_name: str, groups: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("INSERT INTO subscribers (username, email, first_name, last_name, groups) VALUES (%s, %s, %s, %s, %s)",
                  (username, email, first_name, last_name, groups))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    conn.close()

def put_subscriber(id: str, email: str, first_name: str, last_name: str, groups: str = None):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("UPDATE subscribers SET email = %s, first_name = %s, last_name = %s, groups = %s WHERE id = %s",
                  (email, first_name, last_name, groups, id))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    conn.close()

def delete_subscriber(username: str, email: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("DELETE FROM subscribers WHERE username = %s AND email = %s", (username, email))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    conn.close()


def get_campaign_username(id: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("SELECT username FROM credentials WHERE id = %s", (id,))
        row = c.fetchone()
    except Exception as e:
        print(f"Error: {e}")
        return None
    conn.close()
    return row["username"] if row else None

def get_campaign_id(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("SELECT id FROM credentials WHERE username = %s", (username,))
        row = c.fetchone()
    except Exception as e:
        print(f"Error: {e}")
        return None
    conn.close()
    return row["id"] if row else None


def get_user_by_username(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("""SELECT u.id, u.username, u.role, u.password, c.email
                 FROM users u
                 LEFT JOIN credentials c ON c.username = u.username
                 WHERE u.username = %s""", (username,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(username: str, hashed_password: str, role: str = "student"):
    conn = get_conn()
    c = dict_cursor(conn)
    try:
        c.execute("INSERT INTO users (username, password, role) VALUES (%s, %s, %s) RETURNING id",
                  (username, hashed_password, role))
        user_id = c.fetchone()["id"]
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
        user_id = None
    conn.close()
    return user_id

def get_all_users():
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT id, username, role, emails FROM users ORDER BY id")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_user_role(user_id: int, role: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
    conn.commit()
    conn.close()

def get_user_emails(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT emails FROM users WHERE username = %s", (username,))
    row = c.fetchone()
    conn.close()
    return row["emails"] if row else 0

def get_user_sent_emails(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT sent FROM users WHERE username = %s", (username,))
    row = c.fetchone()
    conn.close()
    return row["sent"] if row else 0

def delete_user(user_id: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()

def put_sent_emails(username: str, recipients: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("UPDATE users SET sent = sent + %s WHERE username = %s", (recipients, username))
    conn.commit()
    conn.close()

def put_created_emails(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("UPDATE users SET emails = emails + 1 WHERE username = %s", (username,))
    conn.commit()
    conn.close()


def get_username_emails(username: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT * FROM emails WHERE username = %s AND sent = 0", (username,))
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_email_by_id(id: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT * FROM emails WHERE id = %s", (id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_email_body(id: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("SELECT body FROM emails WHERE id = %s", (id,))
    row = c.fetchone()
    conn.close()
    return row["body"] if row else None

def update_email_body(id: int, body: str):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("UPDATE emails SET body = %s WHERE id = %s", (body, id))
    conn.commit()
    conn.close()

def post_save_email(username: str, body: str, plain: str, header: str, sent: int = 0):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("INSERT INTO emails (username, body, plain, header, date, sent) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
              (username, body, plain, header, datetime.now(), sent))
    email_id = c.fetchone()["id"]
    conn.commit()
    conn.close()
    return email_id

def delete_email_by_id(id: int):
    conn = get_conn()
    c = dict_cursor(conn)
    c.execute("UPDATE emails SET sent = 1 WHERE id = %s", (id,))
    conn.commit()
    conn.close()

def put_email_as_sent(id: int):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE emails SET sent = 1 WHERE id = %s", (id,))
    conn.commit()
    conn.close()


def init_db(): pass
def init_credentials_db(): pass
def init_subscribers_db(): pass