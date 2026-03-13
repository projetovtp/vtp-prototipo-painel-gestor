import apiClient from "../client";

export const gestorConfiguracoesApi = {
  obterComplexo: () =>
    apiClient.get("/gestor/configuracoes/complexo"),

  salvarComplexo: (dados) =>
    apiClient.put("/gestor/configuracoes/complexo", dados),

  salvarEndereco: (dados) =>
    apiClient.put("/gestor/configuracoes/endereco", dados),

  salvarFinanceiro: (dados) =>
    apiClient.put("/gestor/configuracoes/financeiro", dados),

  uploadLogo: (formData) =>
    apiClient.post("/gestor/configuracoes/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
