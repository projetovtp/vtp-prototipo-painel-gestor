import apiClient from "../client";

export const adminQuadrasApi = {
  listar: (params) => apiClient.get("/admin/quadras", { params }),

  criar: (dados) => apiClient.post("/admin/quadras", dados),

  editar: (id, dados) => apiClient.put(`/admin/quadras/${id}`, dados),

  atualizarFotos: (id, formData) =>
    apiClient.put(`/admin/quadras/${id}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  desativar: (id, dados) => apiClient.patch(`/admin/quadras/${id}/desativar`, dados),

  reativar: (id) => apiClient.patch(`/admin/quadras/${id}/reativar`),

  excluir: (id) => apiClient.delete(`/admin/quadras/${id}`),
};
