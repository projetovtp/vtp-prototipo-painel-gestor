// src/components/agenda/AgendaLegend.jsx
import React from "react";

export function AgendaLegend() {
  const boxStyle = {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        fontSize: 12,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#c8e6c9",
            border: "2px solid #2e7d32",
          }}
        />
        <span>Disponível</span>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#ffcdd2",
            border: "2px solid #c62828",
          }}
        />
        <span>Reservada</span>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            ...boxStyle,
            backgroundColor: "#eeeeee",
            border: "2px solid #616161",
          }}
        />
        <span>Bloqueada</span>
      </div>
    </div>
  );
}
