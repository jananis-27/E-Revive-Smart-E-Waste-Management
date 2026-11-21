import axios from "axios";

export const API_ENDPOINTS = {
  health: "/health",
  register: "/auth/register",
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  dashboard: "/dashboard",
  survey: "/survey",
  analyses: "/analyses",
  pickups: "/pickups",
};

// Set VITE_API_URL at build time (e.g. https://erevive-api.onrender.com/api).
// Falls back to the local Spring Boot server for development.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

// The backend returns image paths like "/api/analyses/{id}/image".
// Turn them into absolute URLs on the backend host so they also work when the
// frontend is hosted elsewhere (e.g. GitHub Pages).
export const resolveBackendUrl = (path) => {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

const CONNECTION_ERROR =
  "Cannot connect to the E:Revive server. If the site has been idle, the server may be waking up — please wait a minute and try again.";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erevive_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/")) {
      localStorage.removeItem("erevive_token");
      localStorage.removeItem("erevive_user");
      // The app uses hash-based routing so it works on static hosts like GitHub Pages.
      window.location.hash = "#/login";
    }
    if (!err.response && (!err.message || err.code === "ERR_NETWORK")) {
      err.message = CONNECTION_ERROR;
    }
    return Promise.reject(err);
  }
);

export default api;
