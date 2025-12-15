// src/components/PainelHeader.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

function PainelHeader({ titulo }) {
  const { usuario, logout } = useAuth();

  return (
    <header
      className="layout-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #1f2937",
        backgroundColor: "#020617",
        color: "#f9fafb",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div>
        <div style={{ fontSize: 14, color: "#9ca3af" }}>{titulo}</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          {usuario?.nome || "Usuário"}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {usuario?.email}
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        style={{
          padding: "8px 16px",
          borderRadius: 999,
          border: "1px solid #ef4444",
          backgroundColor: "transparent",
          color: "#fca5a5",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Sair
      </button>
    </header>
  );
}

export default PainelHeader;
