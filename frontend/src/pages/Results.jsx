import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Results.css";

// ── Accordion Section ─────────────────────────────────────────────────────────
function Section({ label, color, children, defaultOpen = false, count }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`acc-section ${color || ""} ${open ? "open" : ""}`}>
      <button className="acc-header" onClick={() => setOpen(!open)}>
        <div className="acc-header-left">
          <span className={`acc-dot ${color || ""}`} />
          <span className="acc-label">{label}</span>
          {count != null && <span className="acc-count">{count}</span>}
        </div>
        <span className="acc-chevron">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

// ── Pill list (short items) ───────────────────────────────────────────────────
function PillList({ items }) {
  if (!items?.length) return <p className="empty-msg">None identified</p>;
  return (
    <ul className="pill-list">
      {items.map((item, i) => <li key={i} className="pill-item">{item}</li>)}
    </ul>
  );
}

// ── Numbered list (long items) ────────────────────────────────────────────────
function NumberedList({ items, highlight }) {
  if (!items?.length) return <p className="empty-msg">None identified</p>;
  return (
    <ol className="num-list">
      {items.map((item, i) => (
        <li key={i} className={`num-item ${highlight ? "highlight" : ""}`}>
          <span className="num-bullet">{String(i + 1).padStart(2, "0")}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

// ── Single text field ─────────────────────────────────────────────────────────
function TextField({ value }) {
  if (!value) return <p className="empty-msg">Not specified</p>;
  return <p className="text-field">{value}</p>;
}

// ── Cards per lens ────────────────────────────────────────────────────────────
function SummaryCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Deep Summary</span>
        <h2 className="card-title">{data.title || "Research Paper"}</h2>
      </div>

      <Section label="What this paper sets out to do" color="blue" defaultOpen>
        <TextField value={data.objective} />
      </Section>
      <Section label="How they did it" color="blue">
        <TextField value={data.methodology} />
      </Section>
      <Section label="Data used" color="blue">
        <TextField value={data.dataset} />
      </Section>
      <Section label="Key Findings" color="green" count={data.key_findings?.length} defaultOpen>
        <NumberedList items={data.key_findings} />
      </Section>
      <Section label="Limitations" color="amber" count={data.limitations?.length}>
        <PillList items={data.limitations} />
      </Section>
      <Section label="Conclusion" color="blue">
        <TextField value={data.conclusion} />
      </Section>
    </div>
  );
}

function GapsCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Gap Analysis</span>
        <h2 className="card-title">{data.title || "Research Paper"}</h2>
      </div>

      <Section label="Unexplored Areas" color="amber" count={data.unexplored_areas?.length} defaultOpen>
        <NumberedList items={data.unexplored_areas} />
      </Section>
      <Section label="Methodological Weaknesses" color="red" count={data.methodological_weaknesses?.length}>
        <PillList items={data.methodological_weaknesses} />
      </Section>
      <Section label="Dataset Limitations" color="red" count={data.dataset_limitations?.length}>
        <PillList items={data.dataset_limitations} />
      </Section>
      <Section label="Exploitable Constraints — your entry points" color="green" count={data.exploitable_constraints?.length} defaultOpen>
        <NumberedList items={data.exploitable_constraints} highlight />
      </Section>
      <Section label="Future Work Suggestions" color="green" count={data.future_work_suggestions?.length}>
        <NumberedList items={data.future_work_suggestions} />
      </Section>
    </div>
  );
}

function ComparisonCard({ data }) {
  const papers = data.papers || [];
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Comparison</span>
        <h2 className="card-title">Multi-Paper Analysis</h2>
      </div>

      <div className="comparison-grid">
        {papers.map((p, i) => (
          <div key={i} className="paper-col">
            <div className="paper-col-header">
              <span className="paper-num mono">P{i + 1}</span>
              <h3 className="paper-col-title">{p.title}</h3>
            </div>
            <div className="paper-field"><span className="paper-field-label">Approach</span><p>{p.approach}</p></div>
            <div className="paper-field"><span className="paper-field-label">Dataset</span><p>{p.dataset}</p></div>
            <div className="paper-field"><span className="paper-field-label">Metrics</span><p>{p.performance_metrics}</p></div>
            <div className="paper-field">
              <span className="paper-field-label">Strengths</span>
              <ul className="inline-list green">{p.strengths?.map((s, j) => <li key={j}>{s}</li>)}</ul>
            </div>
            <div className="paper-field">
              <span className="paper-field-label">Weaknesses</span>
              <ul className="inline-list red">{p.weaknesses?.map((s, j) => <li key={j}>{s}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>

      <Section label="Common Themes" color="blue" defaultOpen count={data.common_themes?.length}>
        <PillList items={data.common_themes} />
      </Section>
      <Section label="Key Differences" color="amber" count={data.key_differences?.length}>
        <NumberedList items={data.key_differences} />
      </Section>
      <Section label="Best Approach & Rationale" color="green" defaultOpen>
        <TextField value={data.best_approach_rationale} />
      </Section>
    </div>
  );
}

function CustomCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Custom Query</span>
        <h2 className="card-title">{data.title || "Research Paper"}</h2>
      </div>
      <div className="query-pill">
        <span className="mono query-q">Q</span>
        <span>{data.question}</span>
      </div>
      <Section label="Answer" color="blue" defaultOpen>
        <TextField value={data.answer} />
      </Section>
      <Section label="Key Points" color="green" count={data.key_points?.length} defaultOpen>
        <NumberedList items={data.key_points} />
      </Section>
      <Section label="Caveats" color="amber" count={data.caveats?.length}>
        <PillList items={data.caveats} />
      </Section>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.data) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>
        No results. <button onClick={() => navigate("/analyze")} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Go back</button>
      </div>
    );
  }

  const { data, files } = state;
  const { lens, results } = data;

  const renderCard = (result, index) => {
    if (result.parse_error) return <div key={index} className="result-card"><pre style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre></div>;
    if (lens === "summary") return <SummaryCard key={index} data={result} />;
    if (lens === "gaps") return <GapsCard key={index} data={result} />;
    if (lens === "comparison") return <ComparisonCard key={index} data={result} />;
    if (lens === "custom") return <CustomCard key={index} data={result} />;
    return null;
  };

  return (
    <div className="results-page">
      <div className="results-topbar">
        <button className="back-btn" onClick={() => navigate("/analyze")}>← New Analysis</button>
        <div className="file-badges">
          {files?.map((f, i) => <span key={i} className="tag">{f}</span>)}
        </div>
      </div>

      <main className="container results-main">
        {results.map((r, i) => renderCard(r, i))}
      </main>
    </div>
  );
}
