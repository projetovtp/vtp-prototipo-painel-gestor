// src/api/agendaApi.js

// Base URL do seu backend (ajuste se precisar)
const API_BASE_URL = "http://localhost:3000";

/**
 * Busca os slots da agenda do gestor (visualização tipo cinema)
 *
 * Parâmetros esperados pelo backend:
 *   - quadraId      (obrigatório)
 *   - periodo       (opcional) → "semana" | "mes" | "intervalo"
 *   - dataInicio    (opcional)
 *   - dataFim       (opcional)
 *   - filtro        (opcional) → "disponivel" | "reservada" | "bloqueada" | "todas"
 */
export async function fetchAgendaSlots({
  quadraId,
  periodo = "semana",
  dataInicio,
  dataFim,
  filtro = "todas",
  token, // JWT do gestor (se já tiver login feito)
}) {
  if (!quadraId) {
    throw new Error("Parâmetro quadraId é obrigatório em fetchAgendaSlots.");
  }

  const params = new URLSearchParams();

  params.append("quadraId", quadraId);
  if (periodo) params.append("periodo", periodo);
  if (dataInicio) params.append("dataInicio", dataInicio);
  if (dataFim) params.append("dataFim", dataFim);
  if (filtro) params.append("filtro", filtro);

  const url = `${API_BASE_URL}/gestor/agenda/slots?${params.toString()}`;

  const headers = {
    "Content-Type": "application/json",
  };

  // Se você já estiver usando JWT no painel, pode injetar aqui
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    const texto = await response.text();
    console.error("[fetchAgendaSlots] Erro HTTP:", response.status, texto);
    throw new Error("Erro ao buscar slots da agenda do servidor.");
  }

  const data = await response.json();
  return data;
}
