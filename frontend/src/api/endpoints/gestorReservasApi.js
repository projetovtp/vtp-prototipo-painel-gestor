import apiClient from "../client";

export const gestorReservasApi = {
  listar: (params) => apiClient.get("/gestor/reservas", { params }),

  obterGrade: (params) =>
    apiClient.get("/gestor/reservas/grade", { params }),

  criar: (dados) => apiClient.post("/gestor/reservas", dados),

  cancelar: (id) => apiClient.delete(`/gestor/reservas/${id}`),
};
