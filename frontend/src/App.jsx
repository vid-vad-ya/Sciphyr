import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar    from "./components/Navbar";
import Landing   from "./pages/Landing";
import AuthPage  from "./pages/AuthPage";
import Home      from "./pages/Home";
import Results   from "./pages/Results";
import "./index.css";

// Redirects to /auth if not logged in
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">⬡</div>;
  return user ? children : <Navigate to="/auth" replace />;
}

// Redirects to /analyze if already logged in
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">⬡</div>;
  return !user ? children : <Navigate to="/analyze" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/auth"    element={<GuestOnly><AuthPage /></GuestOnly>} />
          <Route path="/analyze" element={<Protected><Home /></Protected>} />
          <Route path="/results" element={<Protected><Results /></Protected>} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
