import apiClient from "../client";

export const adminFinanceiroApi = {
  obterOverview: (params) =>
    apiClient.get("/admin/financeiro-overview", { params }),

  obterResumo: (params) =>
    apiClient.get("/admin/financeiro/resumo", { params }),
};
