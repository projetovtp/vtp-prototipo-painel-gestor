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
