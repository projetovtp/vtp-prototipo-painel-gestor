// TODO: remover quando gestorNotificacoesApi estiver disponível
// Este arquivo re-exporta as funções de notificação de mockContatos.js
// para que GestorLayout e MobileLayout possam importar diretamente daqui,
// sem depender de data/mockContatos.js.

export {
  mockContatos,
  mockNovaReserva,
  gerarNotificacoes,
  contarNotificacoesPendentes,
} from "./mockContatos";
