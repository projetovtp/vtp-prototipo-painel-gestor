import apiClient from "../client";

export const gestorFinanceiroApi = {
  obterOverview: (params) =>
    apiClient.get("/gestor/financeiro/overview", { params }),

  listarPagamentos: (params) =>
    apiClient.get("/gestor/financeiro/pagamentos", { params }),

  obterReservasPorDia: (params) =>
    apiClient.get("/gestor/financeiro/reservas-por-dia", { params }),

  listarTransacoes: (params) =>
    apiClient.get("/gestor/financeiro/transacoes", { params }),

  listarRepasses: (params) =>
    apiClient.get("/gestor/repasses", { params }),

  obterDetalheRepasse: (id) =>
    apiClient.get(`/gestor/repasses/${id}`),

  solicitarRepasse: (dados) =>
    apiClient.post("/gestor/repasses/solicitar", dados),

  obterDadosBancarios: () =>
    apiClient.get("/gestor/dados-bancarios"),
};
