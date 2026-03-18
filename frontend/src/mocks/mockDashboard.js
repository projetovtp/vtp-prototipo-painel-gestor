// TODO: remover quando gestorDashboardApi e gestorReservasApi estiverem disponíveis
//
// ⚠️  ANTES DE DELETAR ESTE ARQUIVO:
//   A lógica das linhas abaixo dentro de gerarReservasExemplo() NÃO é mock —
//   é lógica real que precisa ser movida para useGestorDashboard antes de deletar:
//
//     const reservaReal = reservas.find((r) => { ... })   ← busca reserva real na lista
//     if (reservaReal) { return { status: "RESERVADO", ... } }
//
//   Destino: hooks/api/useGestorDashboard.js  (Fase 2.2 do plano)

/** KPIs fixos exibidos nos cards do topo do Dashboard */
export const mockKpisDashboard = {
  reservasHoje: 5,
  pixHoje: 1250.0,
  taxaOcupacao: 68,
};

/**
 * Configuração de quadras espelhada do módulo de Configurações > Quadras.
 * Usada como fallback para o filtro do painel de reservas enquanto o endpoint
 * /gestor/quadras não retornar esses dados no formato esperado.
 */
export const mockQuadrasConfig = [
  {
    id: "config-1",
    nome: "Quadra Principal",
    estrutura: "Indoor",
    material: "Sintético",
    modalidades: ["Futebol", "Futsal"],
    quantidade_quadras: 2,
    status: "ativa",
  },
  {
    id: "config-2",
    nome: "Quadra Externa",
    estrutura: "Externa",
    material: "Gramado Natural",
    modalidades: ["Futebol", "Society", "Campo"],
    quantidade_quadras: 1,
    status: "ativa",
  },
];

/**
 * Gera slots de exemplo para quadras do tipo Beach Tennis e Pádel
 * quando a API ainda não retorna reservas reais.
 *
 * @param {object} quadra  - objeto de quadra com id, tipo, modalidade, indexInGroup
 * @param {string} dataISO - data no formato YYYY-MM-DD
 * @param {string} horaStr - hora no formato HH:00
 * @param {Array}  reservas - lista de reservas reais já carregadas
 * @returns {{ status: string, reserva: object|null, bloqueio: object|null }}
 */
export function gerarReservasExemplo(quadra, dataISO, horaStr, reservas = []) {
  if (!quadra) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

  const quadraId = quadra.id;
  const nomeQ = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
  const hora = parseInt(horaStr.split(":")[0]);

  if (nomeQ.includes("Beach tennis") || nomeQ.includes("Beach Tennis")) {
    const quadraNoGrupo = quadra.indexInGroup ?? 0;

    if (hora === 10) {
      if (quadraNoGrupo === 0) return { status: "RESERVADO", reserva: { id: `ex-paga-1-${quadraId}-${dataISO}-${horaStr}`,    user_cpf: "111.222.333-44", phone: "(11) 91111-1111", preco_total: 120, pago_via_pix: true,  nome: "Carlos Mendes",   quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (quadraNoGrupo === 1) return { status: "RESERVADO", reserva: { id: `ex-paga-2-${quadraId}-${dataISO}-${horaStr}`,    user_cpf: "222.333.444-55", phone: "(11) 92222-2222", preco_total: 120, pago_via_pix: true,  nome: "Ana Costa",       quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (quadraNoGrupo === 2) return { status: "RESERVADO", reserva: { id: `ex-pendente-${quadraId}-${dataISO}-${horaStr}`,  user_cpf: "333.444.555-66", phone: "(11) 93333-3333", preco_total: 120, pago_via_pix: false, nome: "Pedro Lima",      quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }

    if (hora === 13) {
      if (quadraNoGrupo === 0) return { status: "RESERVADO", reserva: { id: `ex13-paga-1-${quadraId}-${dataISO}-${horaStr}`,  user_cpf: "444.555.666-77", phone: "(11) 94444-4444", preco_total: 130, pago_via_pix: true,  nome: "Lucas Ferreira",  quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (quadraNoGrupo === 1) return { status: "RESERVADO", reserva: { id: `ex13-paga-2-${quadraId}-${dataISO}-${horaStr}`,  user_cpf: "555.666.777-88", phone: "(11) 95555-5555", preco_total: 130, pago_via_pix: true,  nome: "Juliana Rocha",   quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (quadraNoGrupo === 2) return { status: "RESERVADO", reserva: { id: `ex13-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "666.777.888-99", phone: "(11) 96666-6666", preco_total: 130, pago_via_pix: false, nome: "Rafael Souza",    quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }

    if (hora === 14) {
      if (quadraNoGrupo === 0) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,     user_cpf: "123.456.789-00", phone: "(11) 98765-4321", preco_total: 150, pago_via_pix: true,  nome: "João Silva",      quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (quadraNoGrupo === 1) return { status: "RESERVADO", reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`,  user_cpf: "987.654.321-00", phone: "(11) 91234-5678", preco_total: 150, pago_via_pix: false, nome: "Maria Santos",    quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }
  }

  const reservaReal = reservas.find((r) => {
    const rd = r.data?.split("T")[0] || r.data;
    const rh = r.hora || r.hora_inicio || "";
    return r.quadra_id === quadraId && rd === dataISO && rh.startsWith(horaStr.split(":")[0]);
  });

  if (reservaReal) {
    return {
      status: "RESERVADO",
      reserva: {
        id: reservaReal.id,
        user_cpf: reservaReal.user_cpf,
        phone: reservaReal.phone,
        preco_total: reservaReal.preco_total,
        pago_via_pix: reservaReal.pago_via_pix,
        nome: reservaReal.nome || reservaReal.user_name,
      },
      bloqueio: null,
    };
  }

  return { status: "DISPONIVEL", reserva: null, bloqueio: null };
}

/** Histórico de reservas de um contato no inbox (carregamento simulado) */
export function gerarMockHistoricoContato() {
  const agora = new Date();
  const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
  const vinteCincoHorasAtras = new Date(agora.getTime() - 25 * 60 * 60 * 1000);
  return [
    { id: 1, data: agora.toISOString().split("T")[0], hora: "18:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid",    created_at: duasHorasAtras.toISOString() },
    { id: 2, data: agora.toISOString().split("T")[0], hora: "20:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "pending", created_at: duasHorasAtras.toISOString() },
    { id: 3, data: "2024-01-05",                      hora: "19:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid",    created_at: vinteCincoHorasAtras.toISOString() },
  ];
}
