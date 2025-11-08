import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// attach token automatically
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;

// convenience exports:
export const fetchEvents = (params) => api.get("/api/events", { params });
export const fetchEvent = (id) => api.get(`/api/events/${id}`);
export const createEvent = (data) => api.post("/api/events", data);
export const fetchNotifications = () => api.get("/api/notifications");
export const uploadFile = (formData) => api.post("/api/uploads", formData);
export const announceSlack = (eventId) => api.post("/api/integrations/slack", { eventId });
export const createGoogleEvent = (payload) => api.post("/api/integrations/google-event", payload); // optional server-side helper
