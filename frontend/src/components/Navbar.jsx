import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="nav-logo" onClick={() => navigate("/")}>
          <span className="nav-logo-icon">⬡</span>
          <span className="nav-logo-text">Sciphyr</span>
        </button>

        <div className="nav-links">
          <button className={`nav-link ${pathname === "/" ? "active" : ""}`} onClick={() => navigate("/")}>About</button>
          {user && (
            <button className={`nav-link ${pathname === "/analyze" ? "active" : ""}`} onClick={() => navigate("/analyze")}>Analyze</button>
          )}
          {pathname === "/results" && <span className="nav-breadcrumb">→ Results</span>}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-user">
                <span className="nav-user-icon">◉</span>
                {user.name.split(" ")[0]}
              </span>
              <button className="nav-logout" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <button className="nav-cta" onClick={() => navigate("/auth")}>
              Get started →
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
