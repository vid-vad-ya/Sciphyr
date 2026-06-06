import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="nav-logo" onClick={() => navigate("/")}>
          <span className="nav-logo-icon">⬡</span>
          <span className="nav-logo-text">Sciphyr</span>
        </button>

        <div className="nav-links">
          <button
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            About
          </button>
          <button
            className={`nav-link ${pathname === "/analyze" ? "active" : ""}`}
            onClick={() => navigate("/analyze")}
          >
            Analyze
          </button>
          {pathname === "/results" && (
            <span className="nav-breadcrumb">→ Results</span>
          )}
        </div>

        <button className="nav-cta" onClick={() => navigate("/analyze")}>
          Try it →
        </button>
      </div>
    </nav>
  );
}
