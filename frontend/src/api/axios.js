import axios from "axios";

// Uses VITE_API_URL in production; falls back to localhost for local dev
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
