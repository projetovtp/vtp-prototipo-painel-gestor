import apiClient from "../client";

export const adminDashboardApi = {
  obterOverview: (params) =>
    apiClient.get("/admin/dashboard-overview", { params }),

  obterFinanceiroOverview: (params) =>
    apiClient.get("/admin/financeiro-overview", { params }),
};
