from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from analyzer import analyze_papers

app = Flask(__name__)
CORS(app)



UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze():
    files = request.files.getlist("papers")
    lens = request.form.get("lens", "summary")
    custom_query = request.form.get("custom_query", "")

    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "No files uploaded"}), 400

    saved_paths = []
    for f in files:
        if f.filename.endswith(".pdf"):
            path = os.path.join(UPLOAD_FOLDER, f.filename)
            f.save(path)
            saved_paths.append(path)

    if not saved_paths:
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        result = analyze_papers(saved_paths, lens, custom_query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
