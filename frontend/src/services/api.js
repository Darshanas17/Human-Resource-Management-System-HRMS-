import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Ensure response data is properly formatted
    if (response.data && typeof response.data === "object") {
      return response;
    }
    // If response data is not an object, normalize it
    return { ...response, data: response.data || {} };
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
