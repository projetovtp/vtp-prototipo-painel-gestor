import apiClient from "../client";

export const adminReservasApi = {
  listar: (params) => apiClient.get("/admin/reservas", { params }),

  obterGrade: (params) =>
    apiClient.get("/admin/reservas/grade", { params }),

  criar: (dados) => apiClient.post("/admin/reservas", dados),

  editar: (id, dados) => apiClient.put(`/admin/reservas/${id}`, dados),

  cancelar: (id) => apiClient.delete(`/admin/reservas/${id}`),
};
