import apiClient from "../client";

export const gestorQuadrasApi = {
  listar: (params) => apiClient.get("/gestor/quadras", { params }),

  criar: (dados) => apiClient.post("/gestor/quadras", dados),

  editar: (id, dados) => apiClient.put(`/gestor/quadras/${id}`, dados),

  atualizarFotos: (id, formData) =>
    apiClient.put(`/gestor/quadras/${id}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  removerFoto: (id, slot) =>
    apiClient.delete(`/gestor/quadras/${id}/foto/${slot}`),

  desativar: (id) => apiClient.patch(`/gestor/quadras/${id}/desativar`),

  reativar: (id) => apiClient.patch(`/gestor/quadras/${id}/reativar`),
};
