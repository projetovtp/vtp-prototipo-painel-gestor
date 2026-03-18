// TODO: remover quando gestorNotificacoesApi estiver disponível
//
// ⚠️  ANTES DE DELETAR ESTE ARQUIVO:
//   As funções abaixo NÃO são mock — são lógica real de negócio que precisa
//   ser movida para useNotificacoes antes de deletar:
//
//     gerarNotificacoes()          ← monta a lista de notificações a partir dos contatos
//     contarNotificacoesPendentes() ← conta mensagens não lidas + novas reservas
//
//   Destino: hooks/api/useNotificacoes.js  (Fase 3.5 do plano)

export const mockContatos = [
  {
    id: 0,
    nome: "VaiTerPlay - Suporte",
    telefone: "(11) 99999-9999",
    ultimaMensagem: "Olá! Como posso ajudar você hoje?",
    hora: "15:00",
    naoLidas: 0,
    avatar: "VS",
    fixo: true,
  },
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    ultimaMensagem: "Tenho uma dúvida: qual o valor por hora?",
    hora: "14:30",
    naoLidas: 0,
    avatar: "JS",
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 91234-5678",
    ultimaMensagem: "Confirmado! Obrigada",
    hora: "13:15",
    naoLidas: 0,
    avatar: "MS",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    telefone: "(11) 99876-5432",
    ultimaMensagem: "Qual o valor da quadra?",
    hora: "12:45",
    naoLidas: 1,
    avatar: "PC",
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    telefone: "(11) 97654-3210",
    ultimaMensagem: "Posso cancelar minha reserva?",
    hora: "11:20",
    naoLidas: 1,
    avatar: "AO",
  },
];

export const mockNovaReserva = {
  id: 1,
  mensagem: "Nova reserva criada para hoje às 18h - Quadra 1",
  hora: "14:25",
};

export const mockMensagensPorContato = {
  0: [{ id: 1, texto: "Olá! Como posso ajudar você hoje?", enviada: true, hora: "15:00" }],
  1: [
    { id: 1, texto: "Tenho uma dúvida: qual o valor por hora?", enviada: false, hora: "14:30" },
    { id: 2, texto: "Olá! O valor varia conforme o horário, vou te enviar o menu para fazer a reserva.", enviada: true, hora: "14:32" },
    { id: 3, tipo: "menu", enviada: true, hora: "14:33" },
  ],
  2: [
    { id: 1, texto: "Olá, quero confirmar minha reserva", enviada: false, hora: "13:10" },
    { id: 2, texto: "Claro! Qual o número da sua reserva?", enviada: true, hora: "13:12" },
    { id: 3, texto: "É a reserva #12345", enviada: false, hora: "13:13" },
    { id: 4, texto: "Confirmado! Obrigada", enviada: false, hora: "13:15" },
  ],
  3: [
    { id: 1, texto: "Qual o valor da quadra?", enviada: false, hora: "12:45" },
    { id: 2, texto: "Depende do horário. Qual período você precisa?", enviada: true, hora: "12:47" },
  ],
  4: [
    { id: 1, texto: "Posso cancelar minha reserva?", enviada: false, hora: "11:20" },
    { id: 2, texto: "Sim, qual o número da reserva?", enviada: true, hora: "11:22" },
  ],
};

export function gerarNotificacoes(contatos, novaReserva) {
  const notificacoes = [];

  contatos.forEach((contato) => {
    if (contato.naoLidas > 0 && !contato.fixo) {
      notificacoes.push({
        id: `msg-${contato.id}`,
        titulo: `Nova mensagem de ${contato.nome}`,
        mensagem: contato.ultimaMensagem || "Você tem mensagens não lidas",
        hora: contato.hora || "Agora",
        tipo: "mensagem",
        contatoId: contato.id,
      });
    }
  });

  if (novaReserva) {
    notificacoes.push({
      id: `reserva-${novaReserva.id || Date.now()}`,
      titulo: "Nova reserva",
      mensagem: novaReserva.mensagem || "Uma nova reserva foi criada",
      hora: novaReserva.hora || "Agora",
      tipo: "reserva",
    });
  }

  return notificacoes.sort((a, b) => {
    try {
      const horaA = a.hora.split(":").map(Number);
      const horaB = b.hora.split(":").map(Number);
      if (horaA.length >= 2 && horaB.length >= 2) {
        if (horaA[0] !== horaB[0]) return horaB[0] - horaA[0];
        return horaB[1] - horaA[1];
      }
    } catch {
      /* manter ordem original */
    }
    return 0;
  });
}

export function contarNotificacoesPendentes(contatos, novaReserva) {
  const contatosComNaoLidas = contatos.filter(
    (c) => (c.naoLidas || 0) > 0 && !c.fixo,
  ).length;
  return contatosComNaoLidas + (novaReserva ? 1 : 0);
}
