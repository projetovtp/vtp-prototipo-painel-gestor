import apiClient from "../client";

export const gestorMensagensApi = {
  listarConversas: (params) =>
    apiClient.get("/gestor/conversas", { params }),

  obterMensagens: (conversaId) =>
    apiClient.get(`/gestor/conversas/${conversaId}/mensagens`),

  enviarMensagem: (conversaId, dados) =>
    apiClient.post(`/gestor/conversas/${conversaId}/mensagens`, dados),

  obterHistoricoReservas: (clienteId) =>
    apiClient.get(`/gestor/clientes/${clienteId}/historico-reservas`),
};
