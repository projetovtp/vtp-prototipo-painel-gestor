import axios from "axios";
import { setupInterceptors } from "./interceptors";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.vaiterplay.com.br",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

setupInterceptors(apiClient);

export default apiClient;
