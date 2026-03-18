// TODO: remover quando gestorReservasApi retornar dados reais com slots populados
//
// ⚠️  ANTES DE DELETAR ESTE ARQUIVO:
//   A lógica abaixo dentro de gerarReservasExemploReservas() NÃO é mock —
//   é lógica real que precisa ser movida para useGestorReservas antes de deletar:
//
//     const reservaReal = reservas.find((r) => { ... })   ← busca reserva real na lista
//     if (reservaReal) { return { status: "RESERVADO", ... } }
//
//   Destino: hooks/api/useGestorReservas.js  (Fase 2.2 do plano)

/**
 * Gera slots de exemplo para quadras do tipo Beach Tennis e Pádel
 * na tela de Reservas (GestorReservasPage).
 *
 * Usa um hash estável do quadraId para distribuir reservas entre as quadras
 * de um mesmo grupo de forma determinística.
 *
 * @param {object} quadra       - objeto de quadra com id, tipo, modalidade
 * @param {string} dataISO      - data no formato YYYY-MM-DD
 * @param {string} horaStr      - hora no formato HH:00
 * @param {Array}  reservas     - lista de reservas reais já carregadas
 * @returns {{ status: string, reserva: object|null, bloqueio: object|null }}
 */
export function gerarReservasExemploReservas(quadra, dataISO, horaStr, reservas = []) {
  if (!quadra) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

  const quadraId = quadra.id;
  const nomeQuadra = quadra.nome
    ? quadra.nome
    : `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
  const hora = parseInt(horaStr.split(":")[0]);
  const hash = quadraId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
    const idx = hash % 6;
    if (hora === 14) {
      if (idx === 0) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,    user_cpf: "123.456.789-00", phone: "(11) 98765-4321", preco_total: 150, pago_via_pix: true,  nome: "João Silva",    quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (idx === 1) return { status: "RESERVADO", reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "987.654.321-00", phone: "(11) 91234-5678", preco_total: 150, pago_via_pix: false, nome: "Maria Santos", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }
    if (idx === 0 && (hora === 9 || hora === 10))   return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bloqueio-${quadraId}-${dataISO}-${horaStr}` }, reserva: null };
    if (idx === 3 && (hora === 18 || hora === 19))  return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "111.222.333-44", phone: "(11) 99876-5432", preco_total: 150, pago_via_pix: true, nome: "Pedro Oliveira", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
  }

  if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
    const idx = hash % 3;
    if (idx === 0 && (hora === 11 || hora === 12)) return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bloqueio-${quadraId}-${dataISO}-${horaStr}` }, reserva: null };
    if (idx === 1 && (hora === 18 || hora === 19)) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,     user_cpf: "555.666.777-88", phone: "(11) 97654-3210", preco_total: 200, pago_via_pix: true,  nome: "Ana Costa",     quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    if (idx === 2 && (hora === 20 || hora === 21)) return { status: "RESERVADO", reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "999.888.777-66", phone: "(11) 96543-2109", preco_total: 200, pago_via_pix: false, nome: "Carlos Mendes", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
  }

  const reservaReal = reservas.find((r) => {
    const reservaData = r.data?.split("T")[0] || r.data;
    const reservaHora = r.hora || r.hora_inicio || "";
    return r.quadra_id === quadraId && reservaData === dataISO && reservaHora.startsWith(horaStr.split(":")[0]);
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
