import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const LENSES = [
  { id: "summary", label: "Deep Summary", icon: "◈", desc: "Objective, methodology, findings, limitations — structured and clear." },
  { id: "gaps", label: "Gap Analysis", icon: "◇", desc: "Unexplored areas, weaknesses, and exploitable constraints for original contribution." },
  { id: "comparison", label: "Paper Comparison", icon: "⊞", desc: "Upload 2–4 papers. Side-by-side methodology and findings comparison." },
  { id: "custom", label: "Custom Query", icon: "⟐", desc: "Ask anything specific about the paper(s)." },
];

export default function Home() {
  const [files, setFiles] = useState([]);
  const [lens, setLens] = useState("summary");
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    const pdfs = accepted.filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs].slice(0, 4));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: true,
  });

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleAnalyze = async () => {
    if (files.length === 0) return setError("Upload at least one PDF.");
    if (lens === "custom" && !customQuery.trim()) return setError("Enter your custom query.");
    setError("");
    setLoading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("papers", f));
    formData.append("lens", lens);
    formData.append("custom_query", customQuery);
    try {
      const res = await axios.post("http://localhost:5000/analyze", formData);
      navigate("/results", { state: { data: res.data, files: files.map((f) => f.name) } });
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home-header">
        <h2>Analyse a Research Paper</h2>
        <p>Upload your PDF and choose how you want to examine it.</p>
      </div>

      <main className="home-main container">
        <section className="section">
          <label className="section-label"><span className="mono">01</span> Upload Papers</label>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
            <input {...getInputProps()} />
            {files.length === 0 ? (
              <div className="drop-prompt">
                <span className="drop-icon">▤</span>
                <p>Drag & drop PDFs here, or click to browse</p>
                <span className="drop-hint">Up to 4 papers · PDF only</span>
              </div>
            ) : (
              <div className="file-list">
                {files.map((f, i) => (
                  <div key={i} className="file-chip">
                    <span className="file-icon">▤</span>
                    <span className="file-name">{f.name}</span>
                    <button className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>×</button>
                  </div>
                ))}
                <span className="drop-hint" style={{ marginTop: "0.4rem" }}>Drop more papers here</span>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <label className="section-label"><span className="mono">02</span> Choose Your Lens</label>
          <div className="lens-grid">
            {LENSES.map((l) => (
              <button key={l.id} className={`lens-card ${lens === l.id ? "selected" : ""}`} onClick={() => setLens(l.id)}>
                <span className="lens-icon">{l.icon}</span>
                <span className="lens-label">{l.label}</span>
                <span className="lens-desc">{l.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {lens === "custom" && (
          <section className="section">
            <label className="section-label"><span className="mono">03</span> Your Query</label>
            <textarea
              className="query-input"
              placeholder="e.g. What constraints does the dataset impose? What techniques could I combine with this approach?"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={3}
            />
          </section>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button className={`analyze-btn ${loading ? "loading" : ""}`} onClick={handleAnalyze} disabled={loading}>
          {loading
            ? <span className="btn-inner"><span className="spinner" /> Analysing paper...</span>
            : <span className="btn-inner">Run Analysis →</span>
          }
        </button>
      </main>
    </div>
  );
}
