from flask import Flask, request, jsonify, redirect
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, set_access_cookies,
    unset_jwt_cookies, jwt_required, get_jwt_identity,
    verify_jwt_in_request,
)
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from database import *
import os
from send_email import *
from models import User

app = Flask(__name__)

app.config["SECRET_KEY"]                 = "secret main key"
app.config["JWT_SECRET_KEY"]             = "jwt production key"
app.config["JWT_TOKEN_LOCATION"]         = ["cookies"]
app.config["JWT_COOKIE_SECURE"]          = False
app.config["JWT_COOKIE_CSRF_PROTECT"]    = False
app.config["JWT_COOKIE_SAMESITE"]        = "Lax"
app.config["JWT_SESSION_COOKIE"]         = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"]   = timedelta(hours=2)
app.config["PROPAGATE_EXCEPTIONS"]       = True
app.config["SQLALCHEMY_DATABASE_URI"]    = (
    "sqlite:///" + os.path.join(os.path.dirname(__file__), "database.db")
)

jwt    = JWTManager(app)
bcrypt = Bcrypt(app)
db     = SQLAlchemy(app)
CORS(app, origins=["http://127.0.0.1:5173", "http://localhost:5173"],
     supports_credentials=True)

"""class User(db.Model):
    __tablename__ = "users"
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role     = db.Column(db.String, nullable=False, default="student")
"""
class SecureAdminView(ModelView):
    column_exclude_list    = ["password"]
    form_excluded_columns  = ["password"]

    def is_accessible(self):
        try:
            verify_jwt_in_request(locations=["cookies"])
            username = get_jwt_identity()
            user = get_user_by_username(username)
            return user and user["role"] == "admin"
        except Exception:
            return False

    def inaccessible_callback(self, name, **kwargs):
        return redirect("/")

    def on_model_change(self, form, model, is_created):
        """Hash password if a raw value is provided via the admin form."""
        raw = getattr(form, "raw_password", None)
        if raw and raw.data:
            model.password = bcrypt.generate_password_hash(raw.data).decode("utf-8")

admin = Admin(app, name="Admin Panel")
admin.add_view(SecureAdminView(User, db))

def current_user():
    username = get_jwt_identity()
    return get_user_by_username(username)

@app.route("/")
def index():
    return "", 204

@app.route("/register", methods=["POST"])
def register():
    data     = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")
    role     = data.get("role", "student")

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    if role not in ("student", "teacher", "admin"):
        role = "student"

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    uid    = create_user(username, hashed, role)
    if uid is None:
        return jsonify({"msg": "Username already taken"}), 409

    return jsonify({"msg": "Account created", "id": uid}), 201


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 204
    data     = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "")

    user = get_user_by_username(username)
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"msg": "Invalid username or password"}), 401

    token    = create_access_token(identity=username)
    response = jsonify({"msg": "Login successful"})
    set_access_cookies(response, token)
    return response


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "Logged out"})
    unset_jwt_cookies(response)
    return response


@app.route("/session")
@jwt_required()
def session():
    user = current_user()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({"id": user["id"], "username": user["username"], "role": user["role"], "is_setup": user["email"] is not None})

@app.route("/api/credentials", methods=["GET"])
def get_campaign_credentials():
    username: str = request.headers.get('X-Username')
    user = get_credentials_username(username)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({"username": user["username"], "email": user["email"], "password": user["password"]}), 200

@app.route("/api/credentials", methods=["POST"])
def post_campaign_credentials():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    password: str = data.get('password')
    try:
        post_credentials(username, email, password)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": "User not added"}), 404
    return jsonify({"msg": f"{username} added successfully"}), 200

@app.route("/api/credentials", methods=["PUT"])
def put_campaign_credentials():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    password: str = data.get('password')
    try:
        put_credentials(username, email, password)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": "User not updated"}), 404
    return jsonify({"msg": f"{username} updated successfully"}), 200

@app.route("/api/subscriber", methods=["GET"])
def get_campaign_subscribers():
    username: str = request.headers.get('X-Username')
    subscribers = get_subscribers(username)
    if subscribers is None:
        return jsonify([]), 200
    return jsonify(subscribers), 200

@app.route("/api/subscriber", methods=["POST"])
def post_campaign_subscribers():
    data = request.get_json()

    subscribers = data if isinstance(data, list) else [data]
    unsuccessfuls = []
    successfuls = []

    for subscriber in subscribers:
        username = subscriber.get("username")
        email = subscriber.get("email")
        first_name = subscriber.get("first_name")
        last_name = subscriber.get("last_name")
        groups = None
        try:
            groups = subscriber.get("groups")
        except Exception as e:
            ...
        try:
            post_subscriber(username, email, first_name, last_name, groups)
            successfuls.append(email)
        except Exception as e:
            print(f"Error: {e}")
            unsuccessfuls.append({"email": email, "error": str(e)})
    return jsonify({
        "added": successfuls,
        "errors": unsuccessfuls,
        "msg": f"Successfully added {len(successfuls)} emails with {len(successfuls)} fails."
    }), 200

@app.route("/api/subscriber", methods=["PUT"])
def put_campaign_subscriber():
    data = request.get_json()
    id: str = data.get('id')
    email: str = data.get('email')
    first_name: str = data.get('first_name')
    last_name: str = data.get('last_name')
    groups = None
    try:
        groups: str = data.get('groups')
    except Exception as e:
        print(e)
    try:
        put_subscriber(id, email, first_name, last_name, groups)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": f"Subscriber not updated: {e}"}), 404
    return jsonify({"msg": f"{email} added successfully"}), 200


@app.route("/api/subscriber", methods=["DELETE"])
def delete_campaign_subscriber():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    try:
        delete_subscriber(username, email)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": f"Subscriber not deleted: {e}"}), 404
    return jsonify({"msg": f"{email} added successfully"}), 200

def require_admin():
    """Call inside a route; returns (user, None) or (None, error_response)."""
    try:
        verify_jwt_in_request(locations=["cookies"])
    except Exception:
        return None, (jsonify({"msg": "Unauthorized"}), 401)
    user = current_user()
    if not user or user["role"] != "admin":
        return None, (jsonify({"msg": "Forbidden"}), 403)
    return user, None


@app.route("/api/users", methods=["GET"])
def api_users():
    _, err = require_admin()
    if err:
        return err
    return jsonify(get_all_users())

@app.route("/api/users/emails", methods=["GET"])
def api_get_users_emails():
    username: str = request.headers.get('X-Username')
    email = get_user_emails(username)
    if email is None:
        return jsonify({"msg": "Emails not found"}), 404
    return jsonify(email), 200

@app.route("/api/users/sent", methods=["GET"])
def api_get_users_sent_emails():
    username: str = request.headers.get('X-Username')
    email = get_user_sent_emails(username)
    if email is None:
        return jsonify({"msg": "Sent not found"}), 404
    return jsonify(email), 200

@app.route("/api/campaign/username", methods=["GET"])
def api_get_campaign_username():
    id: str = request.headers.get('X-Id')
    username = get_campaign_username(id)
    if username is None:
        return jsonify({"msg": "Campaign username not found"}), 404
    return jsonify(username), 200

@app.route("/api/campaign/id", methods=["GET"])
def api_get_campaign_id():
    username: str = request.headers.get('X-Username')
    id = get_campaign_id(username)
    if id is None:
        return jsonify({"msg": "Campaign username not found"}), 404
    return jsonify(id), 200

@app.route("/api/mail", methods=["GET"])
def api_get_username_mail():
    username: str = request.headers.get('X-Username')
    emails = get_username_emails(username)
    if emails is None:
        return jsonify({"msg": "Campaign username not found"}), 404
    return jsonify(emails), 200

@app.route("/api/mail/id", methods=["GET"])
def api_get_email_by_id():
    id: int = request.headers.get('X-Id')
    email = get_email_by_id(id)
    if email is None:
        return jsonify({"msg": "Email can't be found"}), 404
    return jsonify(email), 200

@app.route("/api/users/<int:uid>", methods=["PATCH"])
def api_update_user(uid):
    _, err = require_admin()
    if err:
        return err
    data = request.get_json(force=True)
    role = data.get("role")
    if role not in ("student", "teacher", "admin"):
        return jsonify({"msg": "Invalid role"}), 400
    update_user_role(uid, role)
    return jsonify({"msg": "Updated"})


@app.route("/api/users/<int:uid>", methods=["DELETE"])
def api_delete_user(uid):
    _, err = require_admin()
    if err:
        return err
    delete_user(uid)
    return jsonify({"msg": "Deleted"})

@app.route("/api/save", methods=["POST"])
@jwt_required()
def api_save_email():
    username = get_jwt_identity()
    creds    = get_credentials_username(username)
    if not creds:
        return jsonify({"msg": "No sender credentials set up"}), 400

    data    = request.get_json(force=True)
    subject = data.get("subject", "")
    fields  = data.get("fields", [])
    bg_color = data.get("bgColor", "")  # NEW: get background color

    text_parts = []
    html_parts = []
    
    if bg_color:
        html_parts.append(f"<div style='background:{bg_color};padding:20px'>")
    else:
        html_parts.append("<div style='padding:20px'>")

    html_parts.append("""
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="20" cellspacing="0" border="0"
                 style="font-family:sans-serif;background:white;max-width:600px">
    """)

    for f in fields:
        ftype = f.get("type")
        value = (f.get("value") or "").strip()
        if not value:
            continue
        if ftype == "header":
            text_parts.append(value.upper())
            html_parts.append(f"<tr><td align='center'><h1 style='font-size:24px;color:#111;margin:0'>{value}</h1><hr></td></tr>")
        elif ftype == "body":
            text_parts.append(value)
            html_parts.append(f"<tr><td align='center'><div style='font-size:15px;color:#333;line-height:1.6'>{value}</div></td></tr>")
        elif ftype == "link":
            text_parts.append(value)
            html_parts.append(f"<tr><td align='center'><a href='{value}' style='color:#e8a030'>{value}</a></td></tr>")
        elif ftype == "image":
            text_parts.append("[Image]")
            html_parts.append(f"<tr><td align='center'><img src='{value}' style='max-width:100%;border-radius:6px;margin:12px 0' alt='' /></td></tr>")

    html_parts.append("</table></td></tr></table>")
    html_parts.append("</div>")

    body_text = "\n\n".join(text_parts)
    body_html = "".join(html_parts)

    email_id = post_save_email(username, body_html, body_text, subject, 0)

    web_link = f"http://localhost:8080/email/{email_id}"
    view_in_browser = f"""
    <table width="100%" cellpadding="8" cellspacing="0" border="0">
      <tr>
        <td align="center" style="font-family:sans-serif;font-size:12px;color:#888">
          Having trouble viewing this email?
          <a href='{web_link}' style='color:#e8a030'>View in browser</a>
        </td>
      </tr>
    </table>
    """
    body_html = view_in_browser + body_html

    update_email_body(email_id, body_html)

    put_created_emails(username)
    return jsonify({"msg": f"Successfully saved email"}), 200

@app.route("/api/mail/send", methods=["POST"])
@jwt_required()
def api_send_save_email():
    username = get_jwt_identity()
    creds    = get_credentials_username(username)
    if not creds:
        return jsonify({"msg": "No sender credentials set up"}), 400
    data = request.get_json(force=True)
    id = data.get("id")
    recipients = data.get("recipients")
    email_data = get_email_by_id(id)
    subject = email_data["header"]
    body_text = email_data["plain"]
    body_html = email_data["body"]

    send_email(creds["email"], creds["password"], recipients, subject, body_text, body_html)
    put_email_as_sent(id)
    put_sent_emails(username, len(recipients))
    return jsonify({"msg": f"Sent to {len(recipients)} subscribers"}), 200

@app.route("/api/mail/delete", methods=["DELETE"])
@jwt_required()
def api_delete_email():
    data = request.get_json(force=True)
    id = data.get("id")
    recipients = data.get("recipients")
    data = get_email_by_id(id)
    delete_email_by_id(id)
    return jsonify({"msg": f"Deleted email successfully"}), 200

@app.route("/api/mail/html", methods=["GET"])
def api_get_mail_html():
    id = request.headers.get('X-Id')
    body = get_email_body(id)
    if body is None:
        return jsonify({"msg": "No email associated with this id"}), 400
    return jsonify(body)

@app.route("/api/send", methods=["POST"])
@jwt_required()
def api_send():
    username = get_jwt_identity()
    creds    = get_credentials_username(username)
    if not creds:
        return jsonify({"msg": "No sender credentials set up"}), 400

    data     = request.get_json(force=True)
    subject  = data.get("subject", "")
    fields   = data.get("fields", [])
    bg_color = data.get("bgColor", "")

    text_parts = []
    html_parts = []

    if bg_color:
        html_parts.append(f"<div style='background:{bg_color};padding:20px'>")
    else:
        html_parts.append("<div style='padding:20px'>")

    html_parts.append("""
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="20" cellspacing="0" border="0"
                 style="font-family:sans-serif;background:white;max-width:600px">
    """)

    for f in fields:
        ftype = f.get("type")
        value = (f.get("value") or "").strip()
        if not value:
            continue
        if ftype == "header":
            text_parts.append(value.upper())
            html_parts.append(f"<tr><td align='center'><h1 style='font-size:24px;color:#111;margin:0'>{value}</h1><hr></td></tr>")
        elif ftype == "body":
            text_parts.append(value)
            html_parts.append(f"<tr><td align='center'><div style='font-size:15px;color:#333;line-height:1.6'>{value}</div></td></tr>")
        elif ftype == "link":
            text_parts.append(value)
            html_parts.append(f"<tr><td align='center'><a href='{value}' style='color:#e8a030'>{value}</a></td></tr>")
        elif ftype == "image":
            text_parts.append("[Image]")
            html_parts.append(f"<tr><td align='center'><img src='{value}' style='max-width:100%;border-radius:6px;margin:12px 0' alt='' /></td></tr>")

    html_parts.append("</table></td></tr></table>")
    html_parts.append("</div>")

    body_text = "\n\n".join(text_parts)
    body_html = "".join(html_parts)

    email_id = post_save_email(username, body_html, body_text, subject, 1)

    web_link = f"http://localhost:8080/email/{email_id}"
    view_in_browser = f"""
    <table width="100%" cellpadding="8" cellspacing="0" border="0">
      <tr>
        <td align="center" style="font-family:sans-serif;font-size:12px;color:#888">
          Having trouble viewing this email?
          <a href='{web_link}' style='color:#e8a030'>View in browser</a>
        </td>
      </tr>
    </table>
    """
    body_html = view_in_browser + body_html

    update_email_body(email_id, body_html)

    recipients = get_subscribers_email(username)
    if not recipients:
        return jsonify({"msg": "No subscribers to send to"}), 400

    send_email(creds["email"], creds["password"], recipients, subject, body_text, body_html)
    put_created_emails(username)
    put_sent_emails(username, len(recipients))
    return jsonify({"msg": f"Sent to {len(recipients)} subscribers"}), 200
# ── Startup ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()

    # Seed an admin account if none exists
    if not get_user_by_username("admin"):
        hashed = bcrypt.generate_password_hash("admin123").decode("utf-8")
        create_user("admin", hashed, "admin")
        print("✓  Created default admin  (username: admin, password: admin123)")

    app.run(debug=True, port=5000)