import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const assertApiUrl = () => {
  if (!BASE_URL) {
    console.error("VITE_API_URL is not configured");
    throw new Error("VITE_API_URL is not configured");
  }
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

