import apiClient from "../client";

export const adminAgendaApi = {
  listarRegras: (params) =>
    apiClient.get("/admin/agenda/regras", { params }),

  listarBloqueios: (params) =>
    apiClient.get("/admin/agenda/bloqueios", { params }),

  criarRegrasLote: (dados) =>
    apiClient.post("/admin/agenda/regras/lote", dados),

  editarRegra: (id, dados) =>
    apiClient.put(`/admin/agenda/regras/${id}`, dados),

  excluirRegra: (id) => apiClient.delete(`/admin/agenda/regras/${id}`),

  criarBloqueiosLote: (dados) =>
    apiClient.post("/admin/agenda/bloqueios/lote", dados),

  excluirBloqueio: (id) =>
    apiClient.delete(`/admin/agenda/bloqueios/${id}`),

  obterSlots: (params) =>
    apiClient.get("/admin/agenda/slots", { params }),
};
