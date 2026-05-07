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

# ── App setup ────────────────────────────────────────────────────────────────

app = Flask(__name__)

app.config["SECRET_KEY"]                 = "change-me-in-production"
app.config["JWT_SECRET_KEY"]             = "jwt-change-me-in-production"
app.config["JWT_TOKEN_LOCATION"]         = ["cookies"]
app.config["JWT_COOKIE_SECURE"]          = False   # True in prod (HTTPS)
app.config["JWT_COOKIE_CSRF_PROTECT"]    = False   # enable in prod
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

# ── SQLAlchemy models (for Flask-Admin only) ──────────────────────────────────

class User(db.Model):
    __tablename__ = "users"
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role     = db.Column(db.String, nullable=False, default="student")

# ── Flask-Admin ──────────────────────────────────────────────────────────────

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
admin.add_view(SecureAdminView(User, db.session))

# ── Helpers ───────────────────────────────────────────────────────────────────

def current_user():
    username = get_jwt_identity()
    return get_user_by_username(username)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return "", 204


# ---------- Auth --------------------------------------------------------------

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
    return subscribers

@app.route("/api/subscriber", methods=["POST"])
def post_campaign_subscribers():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    first_name: str = data.get('first_name')
    last_name: str = data.get('last_name')
    try:
        post_subscriber(username, email, first_name, last_name)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": f"Subscriber not added: {e}"}), 404
    return jsonify({"msg": f"{email} added successfully"}), 200

@app.route("/api/subscriber", methods=["PUT"])
def put_campaign_subscriber():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    first_name: str = data.get('first_name')
    last_name: str = data.get('last_name')
    try:
        put_subscriber(username, email, first_name, last_name)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": f"Subscriber not updated: {e}"}), 404
    return jsonify({"msg": f"{email} added successfully"}), 200


def delete_subscriber():
    data = request.get_json()
    username: str = data.get('username')
    email: str = data.get('email')
    try:
        delete_subscriber(username, email)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"msg": f"Subscriber not deleted: {e}"}), 404
    return jsonify({"msg": f"{email} added successfully"}), 200

# ---------- Admin API ---------------------------------------------------------

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

# ── Startup ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()

    # Seed an admin account if none exists
    if not get_user_by_username("admin"):
        hashed = bcrypt.generate_password_hash("admin123").decode("utf-8")
        create_user("admin", hashed, "admin")
        print("✓  Created default admin  (username: admin, password: admin123)")

    app.run(debug=True, port=5000)