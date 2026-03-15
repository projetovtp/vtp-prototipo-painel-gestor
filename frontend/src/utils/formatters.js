/**
 * Formata número como moeda brasileira (R$).
 * @param {number|string} valor
 * @returns {string} ex: "R$ 1.234,56"
 */
export function formatarMoeda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Formata número com separadores de milhar pt-BR.
 * @param {number|string} valor
 * @returns {string} ex: "1.234"
 */
export function formatarNumero(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR");
}

/**
 * Formata data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/AAAA).
 * @param {string} iso
 * @returns {string} ex: "25/03/2026"
 */
export function formatarDataBR(iso) {
  if (!iso) return "—";
  const s = String(iso).slice(0, 10);
  const partes = s.split("-");
  if (partes.length !== 3) return iso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Converte um Date para string ISO (YYYY-MM-DD).
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Formata hora inteira para string "HH:00".
 * @param {number} hora
 * @returns {string} ex: "08:00"
 */
export function formatarHora(hora) {
  return `${String(hora).padStart(2, "0")}:00`;
}

/**
 * Arredonda valor para 2 casas decimais evitando erros de floating point.
 * @param {number|string} valor
 * @returns {number}
 */
export function arredondar2(valor) {
  return Math.round((Number(valor || 0) + Number.EPSILON) * 100) / 100;
}

/**
 * Formata string de hora (ex: "18:00:00") para exibição curta ("18:00").
 * @param {string} hora
 * @returns {string}
 */
export function formatarHoraStr(hora) {
  if (!hora) return "—";
  return String(hora).slice(0, 5);
}

/**
 * Traduz status de reserva do backend para português.
 * @param {string} status - "paid" | "pending" | "canceled"
 * @returns {string}
 */
export function formatarStatus(status) {
  const map = { paid: "Pago", pending: "Pendente", canceled: "Cancelado" };
  return map[status] || status;
}
