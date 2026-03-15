export const mockContatos = [
  {
    id: 0,
    nome: "VaiTerPlay - Suporte",
    telefone: "(11) 99999-9999",
    ultimaMensagem: "Olá! Como posso ajudar você hoje?",
    hora: "15:00",
    naoLidas: 0,
    avatar: "VS",
    fixo: true
  },
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    ultimaMensagem: "Tenho uma dúvida: qual o valor por hora?",
    hora: "14:30",
    naoLidas: 0,
    avatar: "JS"
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 91234-5678",
    ultimaMensagem: "Confirmado! Obrigada",
    hora: "13:15",
    naoLidas: 0,
    avatar: "MS"
  },
  {
    id: 3,
    nome: "Pedro Costa",
    telefone: "(11) 99876-5432",
    ultimaMensagem: "Qual o valor da quadra?",
    hora: "12:45",
    naoLidas: 1,
    avatar: "PC"
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    telefone: "(11) 97654-3210",
    ultimaMensagem: "Posso cancelar minha reserva?",
    hora: "11:20",
    naoLidas: 1,
    avatar: "AO"
  }
];

export const mockNovaReserva = {
  id: 1,
  mensagem: "Nova reserva criada para hoje às 18h - Quadra 1",
  hora: "14:25"
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
        contatoId: contato.id
      });
    }
  });

  if (novaReserva) {
    notificacoes.push({
      id: `reserva-${novaReserva.id || Date.now()}`,
      titulo: "Nova reserva",
      mensagem: novaReserva.mensagem || "Uma nova reserva foi criada",
      hora: novaReserva.hora || "Agora",
      tipo: "reserva"
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
    (c) => (c.naoLidas || 0) > 0 && !c.fixo
  ).length;
  return contatosComNaoLidas + (novaReserva ? 1 : 0);
}
