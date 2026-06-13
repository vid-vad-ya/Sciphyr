import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone
from db import get_conn, USE_POSTGRES

SECRET = os.environ.get("JWT_SECRET", "sciphyr_dev_secret")

def register_user(name, email, password):
    if not name or not email or not password:
        return None, "All fields are required"
    if len(password) < 6:
        return None, "Password must be at least 6 characters"

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_conn()
        cur  = conn.cursor()
        if USE_POSTGRES:
            cur.execute(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id, name, email",
                (name, email, hashed)
            )
            user = dict(cur.fetchone())
        else:
            cur.execute(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                (name, email, hashed)
            )
            user = {"id": cur.lastrowid, "name": name, "email": email}
        conn.commit(); cur.close(); conn.close()
        return _make_token(user), None
    except Exception as e:
        if "unique" in str(e).lower():
            return None, "Email already registered"
        return None, str(e)

def login_user(email, password):
    if not email or not password:
        return None, None, "Email and password are required"
    try:
        conn = get_conn()
        cur  = conn.cursor()
        if USE_POSTGRES:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        else:
            cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cur.fetchone(); cur.close(); conn.close()

        if not row:
            return None, None, "No account found with that email"

        user = dict(row)
        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return None, None, "Incorrect password"

        token = _make_token(user)
        return token, {"id": user["id"], "name": user["name"], "email": user["email"]}, None
    except Exception as e:
        return None, None, str(e)

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, "Session expired, please log in again"
    except jwt.InvalidTokenError:
        return None, "Invalid token"

def _make_token(user):
    payload = {
        "user_id": user["id"],
        "name":    user["name"],
        "email":   user["email"],
        "exp":     datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")
