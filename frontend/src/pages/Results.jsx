import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Results.css";

// ── Accordion ─────────────────────────────────────────────────────────────────
function Section({ label, color, children, defaultOpen = false, count }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`acc-section ${open ? "open" : ""}`}>
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

// ── Chip list — short phrases only ───────────────────────────────────────────
function ChipList({ items, color }) {
  if (!items?.length) return <p className="empty-msg">None identified</p>;
  return (
    <div className="chip-list">
      {items.map((item, i) => (
        <span key={i} className={`chip ${color || ""}`}>{item}</span>
      ))}
    </div>
  );
}

// ── Numbered cards — one idea per card ───────────────────────────────────────
function CardList({ items, highlight }) {
  if (!items?.length) return <p className="empty-msg">None identified</p>;
  return (
    <div className="card-list">
      {items.map((item, i) => (
        <div key={i} className={`insight-card ${highlight ? "highlight" : ""}`}>
          <span className="insight-num">{String(i + 1).padStart(2, "0")}</span>
          <span className="insight-text">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ── Methodology Flowchart ─────────────────────────────────────────────────────
function MethodFlow({ methodology }) {
  if (!methodology) return null;
  const { approach, steps } = methodology;
  return (
    <div className="method-flow">
      <div className="method-approach">{approach}</div>
      {steps?.length > 0 && (
        <div className="flow-steps">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flow-step">
                <span className="flow-step-num">{i + 1}</span>
                <span className="flow-step-text">{step}</span>
              </div>
              {i < steps.length - 1 && <div className="flow-arrow">↓</div>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dataset stat cards ────────────────────────────────────────────────────────
function DatasetCards({ dataset }) {
  if (!dataset) return null;
  const stats = [
    { label: "Dataset", value: dataset.name },
    { label: "Size", value: dataset.size },
    { label: "Data Type", value: dataset.type },
  ];
  return (
    <div className="stat-row">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <span className="stat-label">{s.label}</span>
          <span className="stat-value">{s.value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

// ── Exploitable Constraints — special render ──────────────────────────────────
function ConstraintCards({ items }) {
  if (!items?.length) return <p className="empty-msg">None identified</p>;
  // Handle both old string format and new {label, why} format
  return (
    <div className="constraint-grid">
      {items.map((item, i) => {
        const label = typeof item === "string" ? item : item.label;
        const why   = typeof item === "string" ? null : item.why;
        return (
          <div key={i} className="constraint-card">
            <span className="constraint-num">Entry point {i + 1}</span>
            <span className="constraint-label">{label}</span>
            {why && <span className="constraint-why">{why}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Comparison Matrix ─────────────────────────────────────────────────────────
function CompMatrix({ papers }) {
  if (!papers?.length) return null;
  const aspects = ["approach", "dataset", "performance"];
  const labels  = { approach: "Method", dataset: "Dataset", performance: "Best Metric" };

  return (
    <div className="matrix-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="matrix-th aspect-col">Aspect</th>
            {papers.map((p, i) => (
              <th key={i} className="matrix-th">
                <span className="matrix-paper-num">P{i + 1}</span>
                <span className="matrix-paper-title">{p.title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {aspects.map((asp) => (
            <tr key={asp} className="matrix-row">
              <td className="matrix-aspect">{labels[asp]}</td>
              {papers.map((p, i) => (
                <td key={i} className="matrix-cell">{p[asp] || "—"}</td>
              ))}
            </tr>
          ))}
          <tr className="matrix-row strength-row">
            <td className="matrix-aspect">Strengths</td>
            {papers.map((p, i) => (
              <td key={i} className="matrix-cell">
                <div className="mini-chip-list">
                  {p.strengths?.map((s, j) => <span key={j} className="mini-chip green">{s}</span>)}
                </div>
              </td>
            ))}
          </tr>
          <tr className="matrix-row">
            <td className="matrix-aspect">Weaknesses</td>
            {papers.map((p, i) => (
              <td key={i} className="matrix-cell">
                <div className="mini-chip-list">
                  {p.weaknesses?.map((s, j) => <span key={j} className="mini-chip red">{s}</span>)}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Differences visual ────────────────────────────────────────────────────────
function DiffList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="diff-list">
      {items.map((item, i) => {
        const aspect  = typeof item === "string" ? null : item.aspect;
        const summary = typeof item === "string" ? item : item.summary;
        return (
          <div key={i} className="diff-row">
            {aspect && <span className="diff-aspect">{aspect}</span>}
            <span className="diff-summary">{summary}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Research Angles ───────────────────────────────────────────────────────────
function AnglesCard({ data }) {
  const angles = data.angles || [];
  const difficultyColor = { Easy: "green", Medium: "amber", Hard: "red" };
  const noveltyColor    = { Incremental: "", Moderate: "amber", High: "green" };

  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Research Angles</span>
        <h2 className="card-title">{data.title || "Research Paper"}</h2>
        {data.context_summary && <p className="card-subtitle">{data.context_summary}</p>}
      </div>

      {(data.quick_win || data.bold_bet) && (
        <div className="angle-highlights">
          {data.quick_win && (
            <div className="angle-highlight green">
              <span className="ah-icon">⚡</span>
              <div><span className="ah-label">Quick Win</span><span className="ah-value">{data.quick_win}</span></div>
            </div>
          )}
          {data.bold_bet && (
            <div className="angle-highlight amber">
              <span className="ah-icon">🎯</span>
              <div><span className="ah-label">Bold Bet</span><span className="ah-value">{data.bold_bet}</span></div>
            </div>
          )}
        </div>
      )}

      <div className="angles-list">
        {angles.map((a, i) => (
          <div key={i} className="angle-card">
            <div className="angle-header">
              <span className="angle-num">Angle {i + 1}</span>
              <h3 className="angle-title">{a.title}</h3>
              <div className="angle-badges">
                <span className={`badge ${difficultyColor[a.difficulty] || ""}`}>{a.difficulty}</span>
                <span className={`badge ${noveltyColor[a.novelty] || ""}`}>{a.novelty} novelty</span>
              </div>
            </div>
            <p className="angle-idea">{a.idea}</p>
            <div className="angle-meta">
              <div className="angle-meta-item">
                <span className="meta-label">Builds on</span>
                <span className="meta-value">{a.builds_on}</span>
              </div>
              <div className="angle-meta-item">
                <span className="meta-label">Gap filled</span>
                <span className="meta-value">{a.gap_addressed}</span>
              </div>
            </div>
            {a.techniques?.length > 0 && (
              <div className="angle-techniques">
                <span className="meta-label">Techniques</span>
                <div className="chip-list" style={{ marginTop: "0.35rem" }}>
                  {a.techniques.map((t, j) => <span key={j} className="chip">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Lens card renderers ───────────────────────────────────────────────────────
function SummaryCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Deep Summary</span>
        <h2 className="card-title">{data.title || "Research Paper"}</h2>
        {data.objective && <p className="card-subtitle">{data.objective}</p>}
      </div>

      <Section label="Methodology" color="blue" defaultOpen>
        <MethodFlow methodology={data.methodology} />
      </Section>
      <Section label="Dataset" color="blue">
        <DatasetCards dataset={data.dataset} />
      </Section>
      <Section label="Key Findings" color="green" count={data.key_findings?.length} defaultOpen>
        <CardList items={data.key_findings} />
      </Section>
      <Section label="Limitations" color="amber" count={data.limitations?.length}>
        <ChipList items={data.limitations} color="amber" />
      </Section>
      <Section label="Conclusion" color="blue">
        <p className="text-field">{data.conclusion}</p>
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
        <ChipList items={data.unexplored_areas} color="amber" />
      </Section>
      <Section label="Methodological Weaknesses" color="red" count={data.methodological_weaknesses?.length}>
        <ChipList items={data.methodological_weaknesses} color="red" />
      </Section>
      <Section label="Dataset Limitations" color="red" count={data.dataset_limitations?.length}>
        <ChipList items={data.dataset_limitations} color="red" />
      </Section>
      <Section label="Exploitable Constraints — your entry points" color="green" defaultOpen count={data.exploitable_constraints?.length}>
        <ConstraintCards items={data.exploitable_constraints} />
      </Section>
      <Section label="Future Work Suggestions" color="green" count={data.future_work_suggestions?.length}>
        <ChipList items={data.future_work_suggestions} color="green" />
      </Section>
    </div>
  );
}

function ComparisonCard({ data }) {
  return (
    <div className="result-card">
      <div className="card-title-row">
        <span className="tag">Comparison</span>
        <h2 className="card-title">Multi-Paper Analysis</h2>
        {data.shared_gap && (
          <div className="shared-gap-pill">
            <span className="sg-label">Shared gap across all papers</span>
            <span className="sg-text">{data.shared_gap}</span>
          </div>
        )}
      </div>

      <Section label="Paper-by-Paper Matrix" color="blue" defaultOpen>
        <CompMatrix papers={data.papers} />
      </Section>
      <Section label="Common Themes" color="blue" count={data.common_themes?.length}>
        <ChipList items={data.common_themes} />
      </Section>
      <Section label="Key Differences" color="amber" count={data.key_differences?.length} defaultOpen>
        <DiffList items={data.key_differences} />
      </Section>
      {data.winner && (
        <Section label="Strongest Paper" color="green" defaultOpen>
          <div className="winner-card">
            <span className="winner-title">{data.winner.title}</span>
            <span className="winner-reason">{data.winner.reason}</span>
          </div>
        </Section>
      )}
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
        <p className="text-field">{data.answer}</p>
      </Section>
      <Section label="Key Points" color="green" count={data.key_points?.length} defaultOpen>
        <CardList items={data.key_points} />
      </Section>
      <Section label="Caveats" color="amber" count={data.caveats?.length}>
        <ChipList items={data.caveats} color="amber" />
      </Section>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Results() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.data) return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>
      No results.{" "}
      <button onClick={() => navigate("/analyze")} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
        Go back
      </button>
    </div>
  );

  const { data, files } = state;
  const { lens, results } = data;

  const renderCard = (result, index) => {
    if (result.parse_error) return <div key={index} className="result-card"><pre style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "pre-wrap", padding: "1rem" }}>{JSON.stringify(result, null, 2)}</pre></div>;
    if (lens === "summary")    return <SummaryCard    key={index} data={result} />;
    if (lens === "gaps")       return <GapsCard       key={index} data={result} />;
    if (lens === "comparison") return <ComparisonCard key={index} data={result} />;
    if (lens === "custom")     return <CustomCard     key={index} data={result} />;
    if (lens === "angles")     return <AnglesCard     key={index} data={result} />;
    return null;
  };

  return (
    <div className="results-page">
      <div className="results-topbar">
        <button className="back-btn" onClick={() => navigate("/analyze")}>← New Analysis</button>
        <div className="file-badges">{files?.map((f, i) => <span key={i} className="tag">{f}</span>)}</div>
      </div>
      <main className="container results-main">
        {results.map((r, i) => renderCard(r, i))}
      </main>
    </div>
  );
}
