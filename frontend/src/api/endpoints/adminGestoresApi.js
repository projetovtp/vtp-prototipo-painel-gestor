import apiClient from "../client";

export const adminGestoresApi = {
  listar: () => apiClient.get("/admin/gestores-resumo"),

  criar: (dados) => apiClient.post("/admin/usuarios", dados),

  editar: (id, dados) => apiClient.put(`/admin/gestores/${id}`, dados),

  promover: (id) => apiClient.put(`/admin/usuarios/${id}/promover`),

  reenviarAtivacao: (id) =>
    apiClient.post(`/admin/gestores/${id}/reenviar-ativacao`),
};
