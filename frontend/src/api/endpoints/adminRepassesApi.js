import apiClient from "../client";

export const adminRepassesApi = {
  listar: (params) => apiClient.get("/admin/repasses", { params }),

  gerar: (dados) => apiClient.post("/admin/repasses/gerar", dados),

  obterDetalhe: (id) => apiClient.get(`/admin/repasses/${id}`),

  marcarPago: (id) =>
    apiClient.put(`/admin/repasses/${id}/marcar-pago`),
};
