// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.vaiterplay.com.br",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vaiterplay_token");
    

    // Não envia Authorization para a rota de login
    const isLoginRoute =
      config.url?.startsWith("/auth/login") ||
      config.url === "/auth/login" ||
      config.url === "auth/login";

    if (token && !isLoginRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), limpa o token e redireciona para login
    if (error.response?.status === 401) {
      // Só limpa se não for a rota de login
      const isLoginRoute = error.config?.url?.includes("/auth/login");
      if (!isLoginRoute) {
        localStorage.removeItem("vaiterplay_token");
        localStorage.removeItem("vaiterplay_usuario");
        // Redireciona apenas se não estiver já na página de login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// =========================
// EMPRESAS - GESTOR
// =========================

export async function listarEmpresasGestor() {
  try {
    const response = await api.get("/gestor/empresas");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("[GESTOR/EMPRESAS] Erro ao buscar empresas:", error);
    const msgBackend = error.response?.data?.error;
    throw new Error(msgBackend || "Erro ao carregar empresas do gestor.");
  }
}
