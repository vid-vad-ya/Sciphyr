import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sciphyr_token");
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem("sciphyr_token"))
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password) => {
    const r = await axios.post(`${API}/auth/register`, { name, email, password });
    localStorage.setItem("sciphyr_token", r.data.token);
    const payload = JSON.parse(atob(r.data.token.split(".")[1]));
    setUser({ name: payload.name, email: payload.email, id: payload.user_id });
  };

  const login = async (email, password) => {
    const r = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("sciphyr_token", r.data.token);
    setUser(r.data.user);
  };

  const logout = () => {
    localStorage.removeItem("sciphyr_token");
    setUser(null);
  };

  const getToken = () => localStorage.getItem("sciphyr_token");

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
