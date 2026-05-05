import axios from "axios";

// ==========================================
// AXIOS INSTANCE
// baseURL dari .env — VITE_API_URL
// Di development: http://localhost:5000/api
// Di production: ganti sesuai domain backend
// ==========================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================
// REQUEST INTERCEPTOR
// Otomatis attach JWT token jika ada
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handle 401 → redirect ke login admin
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
