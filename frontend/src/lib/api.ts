import axios from "axios";

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Server-side runtime in Vercel functions with service binding
  if (typeof window === "undefined" && process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL}/api/v1`;
  }
  // Client-side execution under Vercel multi-service rewrites
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return "http://localhost:8000/api/v1";
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aayuraura_token") || localStorage.getItem("ayursetu_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
