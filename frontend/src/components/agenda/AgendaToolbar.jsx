// src/components/agenda/AgendaToolbar.jsx
import React from "react";

/**
 * Barra superior da Agenda (título + visão + ações principais).
 *
 * Props esperadas (já compatível com o GestorAgendaPage que montei):
 * - viewMode: "cinema" | "tabela"
 * - onChangeViewMode: (modo) => void
 * - onRefresh: () => void
 */
export function AgendaToolbar({ viewMode, onChangeViewMode, onRefresh }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      {/* Título */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>
          Agenda de reservas
        </span>
        <span style={{ fontSize: 12, color: "#777" }}>
          Visualização estilo cinema / tabela
        </span>
      </div>

      {/* Botões de ações */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            backgroundColor: "#f5f5f5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Atualizar
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode("cinema")}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border:
              viewMode === "cinema"
                ? "2px solid #1976d2"
                : "1px solid #ccc",
            backgroundColor:
              viewMode === "cinema" ? "#e3f2fd" : "#f5f5f5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Visão cinema
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode("tabela")}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border:
              viewMode === "tabela"
                ? "2px solid #1976d2"
                : "1px solid #ccc",
            backgroundColor:
              viewMode === "tabela" ? "#e3f2fd" : "#f5f5f5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Visão tabela
        </button>
      </div>
    </div>
  );
}
