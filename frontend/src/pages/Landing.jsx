import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const FEATURES = [
  {
    icon: "◈",
    title: "Deep Summary",
    desc: "Objective, methodology, dataset, key findings and limitations — extracted and structured. No re-reading required.",
    tag: "summary",
  },
  {
    icon: "◇",
    title: "Gap Analysis",
    desc: "Surfaces unexplored areas, methodological weaknesses, and exploitable constraints — your entry points for original contribution.",
    tag: "gaps",
  },
  {
    icon: "⊞",
    title: "Paper Comparison",
    desc: "Upload 2–4 papers and get a side-by-side breakdown of approaches, datasets, strengths and differences.",
    tag: "comparison",
  },
  {
    icon: "⟐",
    title: "Custom Query",
    desc: "Ask anything specific — 'What ML techniques could improve this model?' or 'What constraints should I address?'",
    tag: "custom",
  },
];

const STEPS = [
  { num: "01", text: "Upload one or more research PDFs" },
  { num: "02", text: "Choose your analysis lens" },
  { num: "03", text: "Get structured intelligence in seconds" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-badge">
            <span className="tag success">NLP · Research Intelligence</span>
          </div>
          <h1 className="hero-title">
            Literature surveys<br />
            <em>shouldn't take weeks.</em>
          </h1>
          <p className="hero-sub">
            Sciphyr reads research papers the way a senior researcher would —
            surfacing gaps, constraints, and insights instead of just restating the abstract.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/analyze")}>
              Analyse a paper →
            </button>
            <a className="btn-ghost" href="#how">See how it works</a>
          </div>

        </div>

        {/* Decorative paper stack */}
        <div className="hero-visual">
          <div className="paper-stack">
            <div className="paper p3" />
            <div className="paper p2" />
            <div className="paper p1">
              <div className="paper-line" />
              <div className="paper-line short" />
              <div className="paper-line" />
              <div className="paper-line medium" />
              <div className="paper-line" />
              <div className="paper-line short" />
              <div className="paper-badge">GAP ANALYSIS</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how" id="how">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.num} className="step">
                <span className="step-num mono">{s.num}</span>
                <span className="step-text">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Four lenses, one upload</h2>
          <p className="section-sub">
            Choose what you need. Each lens is purpose-built — not a generic summariser.
          </p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.tag} className="feature-card">
                <div className="feature-top">
                  <span className="feature-icon">{f.icon}</span>
                  <span className="tag">{f.tag}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="cta-strip">
        <div className="container cta-inner">
          <p className="cta-text">
            Stop reading the whole paper to find the one thing you need.
          </p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            Start analysing →
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <span className="mono" style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
            ⬡ Sciphyr · Research Paper Intelligence
          </span>
        </div>
      </footer>
    </div>
  );
}
