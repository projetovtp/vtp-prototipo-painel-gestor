// src/pages/gestor/mobile/GestorMobileFinanceiroPage.jsx
import React from "react";

export default function GestorMobileFinanceiroPage() {
  function formatBRL(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f0f2f5",
      minHeight: 0
    }}>
      {/* Cards principais */}
      <div style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          borderRadius: 16,
          padding: "24px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)"
        }}>
          <div style={{ fontSize: 14, opacity: 0.95, marginBottom: 8 }}>Total a Receber</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{formatBRL(13500.00)}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Disponível para repasse</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: 16,
          padding: "24px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)"
        }}>
          <div style={{ fontSize: 14, opacity: 0.95, marginBottom: 8 }}>Total Recebido</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{formatBRL(112500.00)}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Total já recebido</div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div style={{
        padding: "0 16px 16px 16px"
      }}>
        <button
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#37648c",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(55, 100, 140, 0.3)"
          }}
        >
          Solicitar Repasse
        </button>
      </div>

      {/* Histórico recente */}
      <div style={{
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: "20px 16px",
        overflowY: "auto"
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 16
        }}>
          Histórico Recente
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: 12,
                border: "1px solid #e5e7eb"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827"
                }}>
                  Repasse #{item}
                </div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#059669"
                }}>
                  {formatBRL(12500.00)}
                </div>
              </div>
              <div style={{
                fontSize: 13,
                color: "#6b7280"
              }}>
                21/02/2024 • Pago
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
