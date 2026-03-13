import apiClient from "../client";

export const gestorClientesApi = {
  listar: (params) => apiClient.get("/gestor/clientes", { params }),

  obterHistorico: (clienteId) =>
    apiClient.get(`/gestor/clientes/${clienteId}/historico`),
};
