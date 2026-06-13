# ⬡ Sciphyr — Research Paper Intelligence Platform

> Upload a research paper. Choose your analysis lens. Get structured intelligence — not just a summary.

Sciphyr is an NLP-powered web application that helps researchers and students extract meaningful insights from academic papers. Instead of restating the abstract, it surfaces gaps, exploitable constraints, methodology breakdowns, and original research directions.

---

## Live Demo
*Deployment in progress — run locally using the instructions below.*

---

## Features

| Lens | What it does |
|---|---|
| **Deep Summary** | Extracts objective, methodology flowchart, dataset stats, key findings, and limitations in structured visual format |
| **Gap Analysis** | Surfaces unexplored areas, methodological weaknesses, and exploitable constraints — your entry points for original contribution |
| **Paper Comparison** | Upload 2–4 papers and get a side-by-side comparison matrix across method, dataset, metrics, strengths and weaknesses |
| **Custom Query** | Ask anything specific — *"What ML techniques could improve this model's PPV?"* |
| **Research Angles** | Generates 3 concrete, actionable research directions you could pursue from the paper, with difficulty and novelty ratings |

---

## Tech Stack

### Backend
- **Flask** — REST API server
- **PyMuPDF** — PDF text extraction (in-memory, no disk writes)
- **Google Gemini 2.5 Flash** — NLP analysis engine via structured prompt engineering
- **bcrypt** — Password hashing
- **PyJWT** — JSON Web Token authentication
- **PostgreSQL / SQLite** — User and analysis history storage (auto-detects environment)

### Frontend
- **React** — UI framework
- **React Router** — Client-side routing with protected routes
- **Axios** — API communication
- **React Dropzone** — PDF upload interface

### Infrastructure
- **Vercel** — Frontend and backend hosting
- **Supabase / SQLite** — Database (cloud/local)

---

## NLP Concepts Used

- **Prompt Engineering** — Structured JSON extraction with constrained output formatting
- **Document Chunking** — Long PDF handling within LLM context limits (30k char window)
- **Information Extraction** — Field-level structured extraction from unstructured academic text
- **Multi-document Analysis** — Comparative reasoning across multiple papers in a single prompt
- **Domain-aware Querying** — Custom research lens prompts tuned for academic paper structure

---

## Architecture

```
React Frontend (Vercel)
       ↓  JWT in Authorization header
Flask Backend (Vercel)
       ↓  PDF bytes (in-memory)
PyMuPDF → text extraction
       ↓  structured prompt
Gemini 1.5 Flash API
       ↓  JSON response
PostgreSQL/SQLite ← save analysis history
       ↓
Structured JSON → React renders visual components
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Add your GEMINI_API_KEY and JWT_SECRET to .env

python app.py
# Backend runs at http://localhost:5000
# SQLite database created automatically — no setup needed
```

### Frontend

```bash
cd frontend
npm install
npm start
# Frontend runs at http://localhost:3000
```

---

## Environment Variables

### Backend (`.env`)
```
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=any_long_random_string
DATABASE_URL=postgresql://...  # optional — uses SQLite if not set
```

### Frontend (Vercel dashboard or `.env.production`)
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

---

## Project Structure

```
sciphyr/
├── backend/
│   ├── app.py          # Flask routes (auth + analyze + history)
│   ├── analyzer.py     # PDF extraction + Gemini prompt engineering
│   ├── auth.py         # bcrypt hashing + JWT generation/verification
│   ├── db.py           # Auto-switching PostgreSQL/SQLite connector
│   ├── requirements.txt
│   ├── vercel.json
│   └── .env.example
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Global auth state + token management
        ├── components/
        │   └── Navbar.jsx        # Persistent nav with auth state
        └── pages/
            ├── Landing.jsx       # About/home page
            ├── AuthPage.jsx      # Login + Register (single page)
            ├── Home.jsx          # Upload + lens selector
            └── Results.jsx       # Visual output renderers per lens
```

---

## Security

- Passwords hashed with **bcrypt** (never stored in plain text)
- Authentication via **JWT tokens** (7-day expiry)
- `/analyze` route protected — unauthenticated requests return 401
- API keys stored in environment variables only — never in code
- `.gitignore` excludes `.env`, `venv/`, and `node_modules/`

---

## Roadmap

- [ ] Export analysis as PDF/Markdown report
- [ ] Analysis history dashboard
- [ ] Batch upload and cross-paper synthesis
- [ ] Browser extension for one-click paper analysis

---

*Built to solve a real problem — extensive literature surveys during ML research internships.*
