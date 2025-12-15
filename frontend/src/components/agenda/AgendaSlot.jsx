// src/components/agenda/AgendaSlot.jsx
import React from "react";

/**
 * Representa um bloco de horário (slot) na grade estilo cinema.
 *
 * Props sugeridas:
 * - status: "disponivel" | "reservada" | "bloqueada"
 * - label: texto para exibir (ex: "18:00")
 * - onClick: função quando clicar no slot
 */
export function AgendaSlot({ status, label, onClick }) {
  // Define cores básicas por status (simples por enquanto)
  let bg = "#e0e0e0";
  let border = "#bdbdbd";

  if (status === "disponivel") {
    bg = "#c8e6c9"; // verde claro
    border = "#2e7d32";
  } else if (status === "reservada") {
    bg = "#ffcdd2"; // vermelho claro
    border = "#c62828";
  } else if (status === "bloqueada") {
    bg = "#eeeeee"; // cinza
    border = "#616161";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: 60,
        minHeight: 40,
        borderRadius: 6,
        border: `2px solid ${border}`,
        backgroundColor: bg,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 6px",
      }}
    >
      {label}
    </button>
  );
}
