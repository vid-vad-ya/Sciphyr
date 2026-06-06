import fitz  # PyMuPDF
from google import genai
import os
import json
import re

# Configure Gemini
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"

# ── Lens prompts ────────────────────────────────────────────────────────────────
LENS_PROMPTS = {
    "summary": """
You are a research assistant. Analyse the research paper text below and return a JSON object with these exact keys:
{
  "title": "paper title",
  "objective": "1-2 sentence core objective",
  "methodology": "brief description of methods/approach used",
  "dataset": "dataset(s) used (say 'Not specified' if unclear)",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "limitations": ["limitation 1", "limitation 2"],
  "conclusion": "1-2 sentence conclusion"
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "gaps": """
You are a critical research analyst. Read this paper and identify research gaps and open problems.
Return a JSON object with these exact keys:
{
  "title": "paper title",
  "unexplored_areas": ["gap 1", "gap 2", "gap 3"],
  "methodological_weaknesses": ["weakness 1", "weakness 2"],
  "dataset_limitations": ["limitation 1", "limitation 2"],
  "future_work_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "exploitable_constraints": ["constraint that could be addressed 1", "constraint 2"]
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "comparison": """
You are a research analyst. Given the following papers, produce a structured comparison.
Return a JSON object with these exact keys:
{
  "papers": [
    {
      "title": "paper title",
      "approach": "core method/approach",
      "dataset": "dataset used",
      "performance_metrics": "reported metrics or 'Not reported'",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"]
    }
  ],
  "common_themes": ["theme 1", "theme 2"],
  "key_differences": ["difference 1", "difference 2"],
  "best_approach_rationale": "which approach seems strongest and why"
}
Return ONLY the JSON. No preamble, no backticks.
""",

    "custom": """
You are a research assistant. Answer the following question about the research paper(s) provided.
Be structured. Return a JSON object with:
{
  "title": "paper title(s)",
  "question": "the question asked",
  "answer": "your detailed answer",
  "key_points": ["point 1", "point 2", "point 3"],
  "caveats": ["caveat or limitation of your answer 1"]
}
Return ONLY the JSON. No preamble, no backticks.
"""
}

# ── PDF Extraction ───────────────────────────────────────────────────────────────
def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    # Trim to ~30000 chars to stay well within Gemini's context
    return text[:30000]

# ── Main Analyzer ────────────────────────────────────────────────────────────────
def analyze_papers(paths: list, lens: str, custom_query: str = "") -> dict:
    texts = []
    for path in paths:
        text = extract_text_from_pdf(path)
        texts.append(text)

    # Build prompt
    if lens == "comparison" and len(texts) > 1:
        combined = "\n\n---NEXT PAPER---\n\n".join(
            [f"PAPER {i+1}:\n{t}" for i, t in enumerate(texts)]
        )
        prompt = LENS_PROMPTS["comparison"] + "\n\nPAPERS:\n" + combined
    elif lens == "custom":
        combined = "\n\n---NEXT PAPER---\n\n".join(texts)
        prompt = LENS_PROMPTS["custom"].replace("the question asked", custom_query)
        prompt += f"\n\nQuestion: {custom_query}\n\nPAPER(S):\n{combined}"
    else:
        # For single-paper lenses, analyse each and return list
        results = []
        for i, text in enumerate(texts):
            prompt = LENS_PROMPTS.get(lens, LENS_PROMPTS["summary"])
            prompt += f"\n\nPAPER TEXT:\n{text}"
            response = client.models.generate_content(model=MODEL, contents=prompt)
            raw = response.text.strip()
            raw = re.sub(r"```json|```", "", raw).strip()
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                parsed = {"raw_response": raw, "parse_error": True}
            results.append(parsed)

        return {
            "lens": lens,
            "count": len(results),
            "results": results
        }

    # Single call for comparison / custom
    response = client.models.generate_content(model=MODEL, contents=prompt)
    raw = response.text.strip()
    raw = re.sub(r"```json|```", "", raw).strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"raw_response": raw, "parse_error": True}

    return {
        "lens": lens,
        "count": len(paths),
        "results": [parsed]
    }
