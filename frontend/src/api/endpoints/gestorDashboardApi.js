import apiClient from "../client";

export const gestorDashboardApi = {
  obterKpis: () => apiClient.get("/gestor/dashboard/kpis"),

  obterContatos: () => apiClient.get("/gestor/contatos"),

  obterMensagensPorContato: (params) =>
    apiClient.get("/gestor/mensagens", { params }),
};
