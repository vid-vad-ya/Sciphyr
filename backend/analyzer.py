import fitz  # PyMuPDF
from google import genai
import os
import json
import re

# Configure Gemini
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"

# ── Lens prompts ─────────────────────────────────────────────────────────────
# IMPORTANT: All list items must be SHORT phrases (max 10 words), not sentences.
# The UI renders these as visual chips/cards — long sentences break the layout.

LENS_PROMPTS = {
    "summary": """
You are a research assistant. Analyse the paper and return JSON with these exact keys.
CRITICAL: All list items must be SHORT PHRASES of max 8-10 words. No full sentences. No copying from the paper.
Rewrite everything in your own words, simply and clearly.

{
  "title": "paper title (short version if long)",
  "objective": "One plain-English sentence: what problem this paper solves",
  "methodology": {
    "approach": "Name of the main method/model used (e.g. Logistic Regression, CNN, RCT)",
    "steps": ["step 1 short phrase", "step 2 short phrase", "step 3 short phrase", "step 4 short phrase"]
  },
  "dataset": {
    "name": "dataset name or 'Not specified'",
    "size": "number of samples/participants or 'Not reported'",
    "type": "type of data (e.g. survey, imaging, clinical records)"
  },
  "key_findings": ["short finding phrase", "short finding phrase", "short finding phrase"],
  "limitations": ["short limitation phrase", "short limitation phrase"],
  "conclusion": "One plain-English sentence: the main takeaway"
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "gaps": """
You are a critical research analyst. Identify research gaps and opportunities.
CRITICAL: All list items must be SHORT PHRASES of max 8-10 words. No full sentences. No copying from the paper.

{
  "title": "paper title",
  "unexplored_areas": ["short gap phrase", "short gap phrase", "short gap phrase"],
  "methodological_weaknesses": ["short weakness phrase", "short weakness phrase"],
  "dataset_limitations": ["short limitation phrase", "short limitation phrase"],
  "exploitable_constraints": [
    {"label": "very short label (3-4 words)", "why": "one short sentence on how to exploit this"},
    {"label": "very short label", "why": "one short sentence"}
  ],
  "future_work_suggestions": ["short suggestion phrase", "short suggestion phrase", "short suggestion phrase"]
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "comparison": """
You are a research analyst comparing multiple papers.
CRITICAL: All list items must be SHORT PHRASES of max 8-10 words. No full sentences. No paragraphs.

{
  "papers": [
    {
      "title": "short paper title",
      "approach": "method name only (e.g. SVM, LSTM, Survey)",
      "dataset": "dataset name and size only",
      "performance": "best metric result only (e.g. AUC 0.87)",
      "strengths": ["short phrase", "short phrase"],
      "weaknesses": ["short phrase", "short phrase"]
    }
  ],
  "shared_gap": "One sentence: the gap ALL papers share",
  "common_themes": ["short theme phrase", "short theme phrase"],
  "key_differences": [
    {"aspect": "what differs (e.g. Dataset size)", "summary": "short contrast phrase"}
  ],
  "winner": {
    "title": "title of strongest paper",
    "reason": "one short sentence why"
  }
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "custom": """
You are a research assistant. Answer the question about the paper(s) clearly and simply.
CRITICAL: key_points must be SHORT PHRASES of max 8-10 words. No copying from the paper. Plain English only.

{
  "title": "paper title(s)",
  "question": "the question asked",
  "answer": "2-3 plain English sentences answering the question directly",
  "key_points": ["short phrase", "short phrase", "short phrase"],
  "caveats": ["short caveat phrase"]
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "angles": """
You are a research strategist helping a student find original research directions.
Read the paper(s) and generate 3 concrete, actionable research angles they could pursue.
CRITICAL: Be specific to this paper. No generic suggestions. Plain English. Short phrases for lists.

{
  "title": "paper title(s)",
  "context_summary": "One sentence: what this paper does and its biggest gap",
  "angles": [
    {
      "title": "Short catchy angle title (5-7 words)",
      "idea": "2 plain-English sentences describing the research idea",
      "builds_on": "short phrase — what from the paper you're extending",
      "gap_addressed": "short phrase — what gap this fills",
      "techniques": ["technique 1", "technique 2"],
      "difficulty": "Easy / Medium / Hard",
      "novelty": "Incremental / Moderate / High"
    }
  ],
  "quick_win": "title of the easiest angle to start with",
  "bold_bet": "title of the highest novelty angle"
}
Return ONLY the JSON. No preamble, no backticks.
"""
}

# ── PDF Extraction ────────────────────────────────────────────────────────────
def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text[:30000]

# ── Main Analyzer ─────────────────────────────────────────────────────────────
def analyze_papers(paths: list, lens: str, custom_query: str = "") -> dict:
    texts = []
    for path in paths:
        texts.append(extract_text_from_pdf(path))

    multi_lens = lens in ("comparison", "custom", "angles")

    if multi_lens:
        combined = "\n\n---NEXT PAPER---\n\n".join(
            [f"PAPER {i+1}:\n{t}" for i, t in enumerate(texts)]
        )
        prompt = LENS_PROMPTS.get(lens, LENS_PROMPTS["custom"])
        if lens == "custom":
            prompt = prompt.replace("the question asked", custom_query)
            prompt += f"\n\nQuestion: {custom_query}"
        prompt += f"\n\nPAPER(S):\n{combined}"

        response = client.models.generate_content(model=MODEL, contents=prompt)
        raw = re.sub(r"```json|```", "", response.text.strip()).strip()
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = {"raw_response": raw, "parse_error": True}

        return {"lens": lens, "count": len(paths), "results": [parsed]}

    else:
        results = []
        for text in texts:
            prompt = LENS_PROMPTS.get(lens, LENS_PROMPTS["summary"])
            prompt += f"\n\nPAPER TEXT:\n{text}"
            response = client.models.generate_content(model=MODEL, contents=prompt)
            raw = re.sub(r"```json|```", "", response.text.strip()).strip()
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                parsed = {"raw_response": raw, "parse_error": True}
            results.append(parsed)

        return {"lens": lens, "count": len(results), "results": results}
