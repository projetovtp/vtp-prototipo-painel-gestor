// src/pages/gestor/mobile/GestorMobileReservasPage.jsx
import React, { useState } from "react";

export default function GestorMobileReservasPage() {
  const [filtro, setFiltro] = useState("todas");

  // Mock de reservas
  const reservas = [
    {
      id: 1,
      cliente: "João Silva",
      quadra: "Quadra 1",
      data: "2024-02-21",
      horario: "15:00 - 16:00",
      valor: 150.00,
      status: "confirmada"
    },
    {
      id: 2,
      cliente: "Maria Santos",
      quadra: "Quadra 2",
      data: "2024-02-21",
      horario: "16:00 - 17:00",
      valor: 150.00,
      status: "pendente"
    },
    {
      id: 3,
      cliente: "Pedro Costa",
      quadra: "Quadra 1",
      data: "2024-02-22",
      horario: "14:00 - 15:00",
      valor: 150.00,
      status: "confirmada"
    }
  ];

  const reservasFiltradas = filtro === "todas" 
    ? reservas 
    : reservas.filter(r => r.status === filtro);

  function formatBRL(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }

  function formatDateBR(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f0f2f5",
      overflow: "hidden"
    }}>
      {/* Filtros */}
      <div style={{
        backgroundColor: "#fff",
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        gap: 8,
        overflowX: "auto"
      }}>
        {["todas", "confirmada", "pendente", "cancelada"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
                  backgroundColor: filtro === f ? "#37648c" : "#f0f2f5",
              color: filtro === f ? "#fff" : "#111827",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              textTransform: "capitalize"
            }}
          >
            {f === "todas" ? "Todas" : f}
          </button>
        ))}
      </div>

      {/* Lista de reservas */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px"
      }}>
        {reservasFiltradas.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: "center",
            color: "#6b7280"
          }}>
            <div style={{ fontSize: 16 }}>Nenhuma reserva encontrada</div>
          </div>
        ) : (
          reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: "16px",
                marginBottom: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 4
                  }}>
                    {reserva.cliente}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "#6b7280",
                    marginBottom: 2
                  }}>
                    {reserva.quadra}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#6b7280"
                  }}>
                    {formatDateBR(reserva.data)} • {reserva.horario}
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  backgroundColor: reserva.status === "confirmada" ? "#d1fae5" : reserva.status === "pendente" ? "#fef3c7" : "#fee2e2",
                  color: reserva.status === "confirmada" ? "#065f46" : reserva.status === "pendente" ? "#92400e" : "#991b1b",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize"
                }}>
                  {reserva.status}
                </div>
              </div>
              <div style={{
                paddingTop: 12,
                borderTop: "1px solid #f0f2f5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#059669"
                }}>
                  {formatBRL(reserva.valor)}
                </div>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#37648c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
