// src/api/agendaApi.js
import api from "../services/api";

/**
 * Busca slots da agenda (visão cinema)
 *
 * - mode: "GESTOR" | "ADMIN" (default: "GESTOR")
 * Parâmetros:
 *   - quadraId (obrigatório)
 *   - periodo  (opcional) "semana" | "mes" | "intervalo"
 *   - dataInicio (opcional)
 *   - dataFim    (opcional)
 *   - filtro     (opcional) "disponivel" | "reservada" | "bloqueada" | "todas"
 */
export async function fetchAgendaSlots({
  mode = "GESTOR",
  quadraId,
  periodo = "semana",
  dataInicio,
  dataFim,
  filtro = "todas",
} = {}) {
  if (!quadraId) {
    throw new Error("Parâmetro quadraId é obrigatório em fetchAgendaSlots.");
  }

  const modeUpper = String(mode || "GESTOR").toUpperCase();
  const prefix = modeUpper === "ADMIN" ? "admin" : "gestor";

  try {
    const resp = await api.get(`/${prefix}/agenda/slots`, {
      params: {
        quadraId,
        periodo,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        filtro,
      },
    });

    return resp.data;
  } catch (err) {
    console.error("[fetchAgendaSlots] erro:", err);
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Erro ao buscar slots da agenda.";
    throw new Error(msg);
  }
}
