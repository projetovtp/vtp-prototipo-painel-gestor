/**
 * Normaliza o status de um slot para um dos valores: "disponivel", "reservado", "bloqueado".
 * @param {object} slot - Objeto slot com propriedade status
 * @returns {string}
 */
export function normalizarStatusSlot(slot) {
  const raw = String(slot?.status || "").toLowerCase().trim();
  if (raw === "reservado" || raw === "reservada") return "reservado";
  if (raw === "bloqueado" || raw === "bloqueada") return "bloqueado";
  if (raw === "disponivel" || raw === "disponível") return "disponivel";

  if (raw.includes("reserv")) return "reservado";
  if (raw.includes("bloq")) return "bloqueado";
  return "disponivel";
}

/**
 * Retorna o nome da classe CSS para o status do slot (para uso com CSS Modules e tokens).
 * @param {object} slot - Objeto slot com propriedade status
 * @returns {string} "slotDisponivel" | "slotReservado" | "slotBloqueado"
 */
export function corSlotPorStatus(slot) {
  const st = normalizarStatusSlot(slot);
  if (st === "disponivel") return "slotDisponivel";
  if (st === "reservado") return "slotReservado";
  return "slotBloqueado";
}

/**
 * Traduz status de quadra para português.
 * @param {string} status - "ativa" | "inativa" | "manutencao"
 * @returns {string}
 */
export function statusLabelQuadra(status) {
  const s = String(status || "").toLowerCase();
  if (s === "ativa") return "Ativa";
  if (s === "inativa") return "Inativa";
  if (s === "manutencao") return "Em manutenção";
  if (s === "excluida") return "Excluída";
  return "Status não informado";
}

/**
 * Traduz status de reserva para português.
 * @param {string} status - "paid" | "pending" | "canceled"
 * @returns {string}
 */
export function statusLabelReserva(status) {
  const v = String(status || "").toLowerCase();
  if (v === "paid") return "Pago";
  if (v === "pending") return "Pendente";
  if (v === "canceled" || v === "cancelado") return "Cancelado";
  return v || "—";
}

export function calcularStatusCliente(cliente) {
  if (cliente.status === "inativo" || cliente.status === "ativo") {
    return cliente.status;
  }
  if (!cliente.ultimaReserva || cliente.totalReservas === 0) {
    return "inativo";
  }
  const hoje = new Date();
  const ultimaReserva = new Date(cliente.ultimaReserva);
  const diasSemReserva = Math.floor((hoje - ultimaReserva) / (1000 * 60 * 60 * 24));
  return diasSemReserva <= 30 ? "ativo" : "inativo";
}

export function statusRepasseLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "Concluído";
  if (v === "pendente") return "Pendente";
  if (v === "recusado" || v === "rejeitado") return "Recusado";
  return v || "Pendente";
}

export function statusRepasseClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "green";
  if (v === "pendente") return "yellow";
  if (v === "recusado" || v === "rejeitado") return "red";
  return "muted";
}

export function statusPaymentClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "green";
  if (v === "pending") return "yellow";
  if (v === "canceled" || v === "cancelled") return "red";
  return "muted";
}