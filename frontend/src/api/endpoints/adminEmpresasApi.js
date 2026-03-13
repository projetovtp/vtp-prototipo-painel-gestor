import apiClient from "../client";

export const adminEmpresasApi = {
  listar: () => apiClient.get("/admin/empresas"),

  criar: (dados) => apiClient.post("/admin/empresas", dados),

  editar: (id, dados) => apiClient.put(`/admin/empresas/${id}`, dados),

  excluir: (id) =>
    apiClient.delete(`/admin/empresas/${id}`, {
      params: { confirm: "DELETE" },
    }),

  consultar: (q) => apiClient.get("/admin/consulta", { params: { q } }),

  obterDetalheGestor: (id) =>
    apiClient.get(`/admin/gestores/${id}/detalhe`),

  obterDetalheEmpresa: (id) =>
    apiClient.get(`/admin/empresas/${id}/detalhe`),

  obterAuditLog: (params) => apiClient.get("/admin/audit-log", { params }),
};
