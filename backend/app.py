from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json

from db   import init_db, get_conn
from auth import register_user, login_user, verify_token
from analyzer import analyze_papers

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)



# ── Auth middleware ───────────────────────────────────────────────────────────
def require_auth():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, "Missing token"
    token = auth.split(" ", 1)[1]
    return verify_token(token)

# ── Auth routes ───────────────────────────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    token, err = register_user(data.get("name"), data.get("email"), data.get("password"))
    if err:
        return jsonify({"error": err}), 400
    return jsonify({"token": token})

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    token, user, err = login_user(data.get("email"), data.get("password"))
    if err:
        return jsonify({"error": err}), 401
    return jsonify({"token": token, "user": user})

@app.route("/auth/me", methods=["GET"])
def me():
    payload, err = require_auth()
    if err:
        return jsonify({"error": err}), 401
    return jsonify({"user": {"id": payload["user_id"], "name": payload["name"], "email": payload["email"]}})

# ── Analyze route (protected) ─────────────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze():
    payload, err = require_auth()
    if err:
        return jsonify({"error": "Please log in to analyse papers"}), 401

    files        = request.files.getlist("papers")
    lens         = request.form.get("lens", "summary")
    custom_query = request.form.get("custom_query", "")

    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "No files uploaded"}), 400

    saved_paths = []
    paper_names = []
    for f in files:
        if f.filename.endswith(".pdf"):
            path = os.path.join(UPLOAD_FOLDER, f.filename)
            f.save(path)
            saved_paths.append(path)
            paper_names.append(f.filename)

    if not saved_paths:
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        result = analyze_papers(saved_paths, lens, custom_query)

        # Save to DB
        try:
            conn = get_conn()
            cur  = conn.cursor()
            cur.execute(
                "INSERT INTO analyses (user_id, lens, paper_names, result_json) VALUES (%s, %s, %s, %s)",
                (payload["user_id"], lens, paper_names, json.dumps(result))
            )
            conn.commit(); cur.close(); conn.close()
        except Exception as db_err:
            print(f"DB save error: {db_err}")  # non-fatal

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── History route ─────────────────────────────────────────────────────────────
@app.route("/history", methods=["GET"])
def history():
    payload, err = require_auth()
    if err:
        return jsonify({"error": err}), 401

    try:
        import psycopg2.extras
        conn = get_conn()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT id, lens, paper_names, created_at FROM analyses WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
            (payload["user_id"],)
        )
        rows = cur.fetchall(); cur.close(); conn.close()
        return jsonify({"history": [dict(r) for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
