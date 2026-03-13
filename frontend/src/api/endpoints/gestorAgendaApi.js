import apiClient from "../client";

export const gestorAgendaApi = {
  listarRegras: (params) =>
    apiClient.get("/gestor/agenda/regras", { params }),

  criarRegra: (dados) =>
    apiClient.post("/gestor/agenda/regras", dados),

  editarRegra: (id, dados) =>
    apiClient.put(`/gestor/agenda/regras/${id}`, dados),

  excluirRegra: (id) =>
    apiClient.delete(`/gestor/agenda/regras/${id}`),

  listarBloqueios: (params) =>
    apiClient.get("/gestor/agenda/bloqueios", { params }),

  criarBloqueiosLote: (dados) =>
    apiClient.post("/gestor/agenda/bloqueios/lote", dados),

  editarBloqueio: (id, dados) =>
    apiClient.put(`/gestor/agenda/bloqueios/${id}`, dados),

  excluirBloqueio: (id) =>
    apiClient.delete(`/gestor/agenda/bloqueios/${id}`),

  obterSlots: (params) =>
    apiClient.get("/gestor/agenda/slots", { params }),
};
