# ⬡ Sciphyr — Research Paper Intelligence Platform

> Upload research papers. Choose your analysis lens. Get structured intelligence — not just summaries.

Built from a real pain point: extensive literature surveys during research internships. Sciphyr uses Gemini 1.5 Flash to deliver deep, structured analysis of academic papers.

---

## Features

| Lens | What it does |
|------|-------------|
| **Deep Summary** | Objective, methodology, dataset, findings, limitations |
| **Gap Analysis** | Unexplored areas, weaknesses, exploitable constraints, future directions |
| **Paper Comparison** | Upload 2–4 papers, get side-by-side methodology comparison |
| **Custom Query** | Ask anything specific about the paper(s) |

---

## Tech Stack

- **Frontend**: React + React Router + React Dropzone
- **Backend**: Flask + Flask-CORS
- **PDF Parsing**: PyMuPDF (fitz)
- **NLP Engine**: Google Gemini 1.5 Flash (free API)

---

## Setup

### 1. Get Gemini API Key
- Go to https://aistudio.google.com
- Create a new API key (free)

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set API key
copy .env.example .env
# Edit .env and paste your Gemini API key

# Run
python app.py
```

Backend runs on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

---

## Project Structure

```
sciphyr/
├── backend/
│   ├── app.py           # Flask routes
│   ├── analyzer.py      # PDF extraction + Gemini calls + prompt engineering
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx
        ├── index.css    # Global dark academic theme
        ├── index.js
        └── pages/
            ├── Home.jsx / Home.css     # Upload + lens selection
            └── Results.jsx / Results.css  # Structured output rendering
```

---

## How It Works (for interviews)

1. **PDF Parsing**: PyMuPDF extracts raw text from uploaded papers, trimmed to ~30,000 chars to stay within API limits.

2. **Prompt Engineering**: Each lens has a carefully crafted system prompt that instructs Gemini to return structured JSON with specific keys relevant to that analysis type.

3. **Multi-paper handling**: For comparison mode, all paper texts are concatenated with separators and sent in a single prompt. For other lenses, papers are analysed individually and results are returned as a list.

4. **Structured Output**: The backend enforces JSON-only output from Gemini and parses it server-side before returning to the frontend. If parsing fails, the raw response is passed through (graceful degradation).

5. **Frontend rendering**: Each lens type has its own React renderer that maps JSON keys to styled UI components — no generic blob of text.

---

## Deployment (Free Tier)

| Part | Platform | Notes |
|------|----------|-------|
| Frontend | Vercel | `npm run build` → deploy |
| Backend | Railway | Add `GEMINI_API_KEY` as env var |

---

## NLP Concepts Used (resume talking points)

- **Prompt engineering** — structured JSON extraction with constrained output
- **Document chunking** — handling long PDFs within context limits
- **Information extraction** — NER-style structured field extraction via LLM
- **Multi-document analysis** — comparative reasoning across papers
- **RAG-adjacent architecture** — retrieval (PDF) + generation (Gemini)

---

*Born from a literature survey on endometriosis detection at NIT Trichy.*
