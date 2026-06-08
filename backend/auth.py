import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone
from db import get_conn

SECRET = os.environ.get("JWT_SECRET", "sciphyr_dev_secret")

# ── Register ──────────────────────────────────────────────────────────────────
def register_user(name: str, email: str, password: str):
    if not name or not email or not password:
        return None, "All fields are required"
    if len(password) < 6:
        return None, "Password must be at least 6 characters"

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id, name, email",
            (name, email, hashed)
        )
        user = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return _make_token(user), None
    except Exception as e:
        if "unique" in str(e).lower():
            return None, "Email already registered"
        return None, str(e)

# ── Login ─────────────────────────────────────────────────────────────────────
def login_user(email: str, password: str):
    if not email or not password:
        return None, None, "Email and password are required"
    try:
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone(); cur.close(); conn.close()

        if not user:
            return None, None, "No account found with that email"
        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return None, None, "Incorrect password"

        token = _make_token(user)
        return token, {"id": user["id"], "name": user["name"], "email": user["email"]}, None
    except Exception as e:
        return None, None, str(e)

# ── Verify JWT ────────────────────────────────────────────────────────────────
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, "Session expired, please log in again"
    except jwt.InvalidTokenError:
        return None, "Invalid token"

# ── Helper ────────────────────────────────────────────────────────────────────
def _make_token(user):
    payload = {
        "user_id": user["id"],
        "name":    user["name"],
        "email":   user["email"],
        "exp":     datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

import psycopg2.extras  # ensure import available
