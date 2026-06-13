import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Floating science particles ────────────────────────────────────────────────
function Particles() {
  const symbols = ["◈", "◇", "⬡", "⊞", "△", "○", "◉", "⟐"];
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${5 + (i * 5.5) % 92}%`,
            animationDelay: `${(i * 0.37) % 6}s`,
            animationDuration: `${5 + (i * 0.8) % 5}s`,
            fontSize: `${0.6 + (i % 4) * 0.2}rem`,
            opacity: 0.06 + (i % 5) * 0.025,
          }}
        >
          {symbols[i % symbols.length]}
        </span>
      ))}
    </div>
  );
}

// ── Typewriter for hero subtitle ──────────────────────────────────────────────
function Typewriter({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [started, text]);

  return <span>{displayed}<span className="cursor">|</span></span>;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = end / 40;
      const iv = setInterval(() => {
        start += step;
        if (start >= end) { setVal(end); clearInterval(iv); }
        else setVal(Math.floor(start));
      }, 30);
      obs.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const LENSES = [
  { icon: "◈", label: "Deep Summary",      color: "blue",  desc: "Methodology flowchart, dataset cards, structured findings" },
  { icon: "◇", label: "Gap Analysis",      color: "amber", desc: "Unexplored areas, weaknesses, exploitable constraints" },
  { icon: "⊞", label: "Paper Comparison",  color: "green", desc: "Side-by-side matrix across method, dataset, metrics" },
  { icon: "⟐", label: "Custom Query",      color: "ink",   desc: "Ask anything specific about the paper(s)" },
  { icon: "⟳", label: "Research Angles",   color: "gold",  desc: "3 actionable directions with novelty & difficulty ratings", highlight: true },
];

const STEPS = [
  { num: "01", icon: "▤", label: "Upload",   text: "Drop one or more research PDFs" },
  { num: "02", icon: "◈", label: "Choose",   text: "Pick your analysis lens" },
  { num: "03", icon: "⬡", label: "Analyse",  text: "Get structured intelligence in seconds" },
];

const STATS = [
  { val: 5,   suffix: "",  label: "Analysis lenses" },
  { val: 30,  suffix: "k", label: "Chars processed per paper" },
  { val: 100, suffix: "%", label: "Free to use" },
];

export default function Landing() {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="landing">

      {/* ── Hero ── */}
      <section className="hero">
        <Particles />
        <div className="hero-grid container">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="tag success">⬡ NLP · Research Intelligence</span>
            </div>
            <h1 className="hero-title">
              Literature surveys<br />
              <em className="hero-em">shouldn't take weeks.</em>
            </h1>
            <p className="hero-sub">
              <Typewriter
                text="Sciphyr reads papers the way a senior researcher would — surfacing gaps, constraints, and research angles instead of restating the abstract."
                delay={400}
              />
            </p>
            <div className="hero-ctas">
              <button className="cta-primary" onClick={() => navigate("/analyze")}>
                <span>Analyse a paper</span>
                <span className="cta-arrow">→</span>
              </button>
              <a className="cta-secondary" href="#how">See how it works ↓</a>
            </div>
          </div>

          <div className="hero-right">
            <div className="paper-stack">
              <div className="fake-paper p3">
                <div className="fp-line" /><div className="fp-line short" /><div className="fp-line" />
              </div>
              <div className="fake-paper p2">
                <div className="fp-line" /><div className="fp-line medium" /><div className="fp-line short" />
                <div className="fp-chip amber">GAP ANALYSIS</div>
              </div>
              <div className="fake-paper p1">
                <div className="fp-header">
                  <span className="fp-dot blue" /><span className="fp-dot green" /><span className="fp-dot amber" />
                </div>
                <div className="fp-title-line" />
                <div className="fp-line" /><div className="fp-line short" /><div className="fp-line medium" /><div className="fp-line" />
                <div className="fp-chips">
                  <span className="fp-chip green">Exploitable ◈</span>
                  <span className="fp-chip blue">Method ◇</span>
                </div>
                <div className="fp-line short" /><div className="fp-line" />
                <div className="fp-chip gold" style={{ marginTop: "auto" }}>Research Angle ⟳</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="container stats-inner">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-val"><Counter end={s.val} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">How it works</h2>
            <p className="section-sub">Three steps. No setup. No subscriptions.</p>
          </div>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={`step-card reveal reveal-delay-${i + 1}`}>
                  <div className="step-icon-wrap">
                    <span className="step-icon">{s.icon}</span>
                  </div>
                  <span className="step-num mono">{s.num}</span>
                  <h3 className="step-label">{s.label}</h3>
                  <p className="step-text">{s.text}</p>
                </div>
                {i < STEPS.length - 1 && <div className="step-connector"><span>→</span></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lenses ── */}
      <section className="lenses-section">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">Five lenses, one upload</h2>
            <p className="section-sub">Each lens is purpose-built. Not a generic summariser.</p>
          </div>
          <div className="lenses-grid">
            {LENSES.map((l, i) => (
              <div key={l.label} className={`lens-feature-card reveal reveal-delay-${(i % 3) + 1} ${l.highlight ? "highlight" : ""}`}>
                <div className="lfc-top">
                  <span className={`lfc-icon ${l.color}`}>{l.icon}</span>
                  {l.highlight && <span className="new-pill">NEW</span>}
                </div>
                <h3 className="lfc-title">{l.label}</h3>
                <p className="lfc-desc">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div className="cta-left reveal">
            <h2 className="cta-heading">Stop reading the whole paper<br />to find the one thing you need.</h2>
            <p className="cta-sub">Upload. Choose a lens. Get intelligence.</p>
          </div>
          <button className="cta-primary large reveal reveal-delay-2" onClick={() => navigate("/analyze")}>
            <span>Get started</span>
            <span className="cta-arrow">→</span>
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-logo">⬡ Sciphyr</span>
          <span className="mono footer-note">Research Paper Intelligence · NLP-powered</span>
        </div>
      </footer>
    </div>
  );
}
