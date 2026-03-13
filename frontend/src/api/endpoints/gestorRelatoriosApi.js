import apiClient from "../client";

export const gestorRelatoriosApi = {
  obterReservas: (params) =>
    apiClient.get("/gestor/relatorios/reservas", { params }),

  obterFaturamento: (params) =>
    apiClient.get("/gestor/relatorios/faturamento", { params }),

  exportar: (params) =>
    apiClient.get("/gestor/relatorios/exportar", {
      params,
      responseType: "blob",
    }),
};
