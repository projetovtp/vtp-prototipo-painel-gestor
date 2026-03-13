import apiClient from "../client";

export const authApi = {
  login: (dados) => apiClient.post("/auth/login", dados),

  esqueciSenha: (dados) => apiClient.post("/auth/esqueci-senha", dados),

  resetarSenha: (dados) => apiClient.post("/auth/resetar-senha", dados),

  trocarSenha: (dados) => apiClient.put("/auth/trocar-senha", dados),

  validarToken: () => apiClient.get("/auth/validar-token"),

  refresh: () => apiClient.post("/auth/refresh"),
};
