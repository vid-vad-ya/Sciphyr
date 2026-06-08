import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode,     setMode]     = useState("login"); // "login" | "register"
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/analyze");
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">⬡</span>
          <span className="auth-logo-text">Sciphyr</span>
        </div>

        <h2 className="auth-title">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="auth-sub">
          {mode === "login"
            ? "Log in to access your analyses and history."
            : "Start analysing research papers in seconds."}
        </p>

        <div className="auth-form">
          {mode === "register" && (
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Dhivya S"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
          )}

          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="btn-inner"><span className="spinner" /> Please wait...</span>
              : <span className="btn-inner">{mode === "login" ? "Log in →" : "Create account →"}</span>
            }
          </button>
        </div>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="switch-link"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
