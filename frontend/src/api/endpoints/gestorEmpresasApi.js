import apiClient from "../client";

export const gestorEmpresasApi = {
  listar: () => apiClient.get("/gestor/empresas"),

  obter: (id) => apiClient.get(`/gestor/empresas/${id}`),

  criar: (dados) => apiClient.post("/gestor/empresas", dados),

  editar: (id, dados) => apiClient.put(`/gestor/empresas/${id}`, dados),

  desativar: (id) =>
    apiClient.patch(`/gestor/empresas/${id}/desativar`),

  reativar: (id) => apiClient.patch(`/gestor/empresas/${id}/reativar`),
};
