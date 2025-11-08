import React, { createContext, useContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { API_BASE } from "../utils/constants";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(token ? jwt_decode(token) : null);

  // Sync token and user state with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setUser(jwt_decode(token));
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  // Login
  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    setToken(res.data.token);
  };

  // Signup (register)
  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
    // Optionally auto-login after signup
    setToken(res.data.token);
  };

  // Logout
  const logout = () => setToken(null);

  // Automatically attach token to axios requests
  axios.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
