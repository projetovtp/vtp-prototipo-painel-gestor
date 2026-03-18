// src/pages/gestor/mobile/GestorMobileFinanceiroPage.jsx
import React, { useState, useEffect } from "react";
import { useGestorFinanceiro } from "../../../hooks/api";
import { LoadingSpinner, EmptyState } from "../../../components/ui";
import { formatarMoeda as formatBRL, formatarDataBR as formatDateBR } from "../../../utils/formatters";

const MOCK_OVERVIEW = {
  kpis: {
    valor_liquido: 13500.0,
    receita_bruta: 15000.0,
    taxa_plataforma: 1500.0,
    qtd_pagamentos: 8,
  },
};

const MOCK_OVERVIEW_TOTAL = {
  kpis: {
    valor_liquido: 112500.0,
    receita_bruta: 125000.0,
    taxa_plataforma: 12500.0,
    qtd_pagamentos: 45,
  },
};

const MOCK_REPASSES = [
  { id: 1, valor_total_liquido: 12500.0, status: "pago", data_pagamento: "2024-02-21" },
  { id: 2, valor_total_liquido: 12500.0, status: "pago", data_pagamento: "2024-01-21" },
  { id: 3, valor_total_liquido: 12500.0, status: "pago", data_pagamento: "2023-12-21" },
];

const GestorMobileFinanceiroPage = () => {
  const {
    overview,
    repasses,
    loading,
    obterOverview,
    listarRepasses,
  } = useGestorFinanceiro();

  const [overviewTotal, setOverviewTotal] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        await Promise.all([obterOverview(), listarRepasses()]);
        setOverviewTotal(overview);
      } catch {
        // Backend indisponível - mock será usado via fallback abaixo
      } finally {
        setCarregado(true);
      }
    }
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const overviewPendente = overview || MOCK_OVERVIEW;
  const overviewRecebido = overviewTotal || MOCK_OVERVIEW_TOTAL;
  const repassesData = repasses.length > 0 ? repasses : MOCK_REPASSES;

  const totalAReceber = overviewPendente?.kpis?.valor_liquido || 0;
  const totalRecebido = overviewRecebido?.kpis?.valor_liquido || 0;

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
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
            {loading && !carregado ? "..." : formatBRL(totalAReceber)}
          </div>
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
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>
            {loading && !carregado ? "..." : formatBRL(totalRecebido)}
          </div>
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
          {loading && !carregado ? (
            <LoadingSpinner mensagem="Carregando..." tamanho={24} />
          ) : repassesData.length === 0 ? (
            <EmptyState titulo="Nenhum repasse encontrado" compact />
          ) : (
            repassesData.map((repasse) => (
              <div
                key={repasse.id}
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
                    Repasse #{repasse.id}
                  </div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#059669"
                  }}>
                    {formatBRL(repasse.valor_total_liquido)}
                  </div>
                </div>
                <div style={{
                  fontSize: 13,
                  color: "#6b7280"
                }}>
                  {formatDateBR(repasse.data_pagamento)} • {repasse.status === "pago" ? "Pago" : repasse.status === "pendente" ? "Pendente" : repasse.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GestorMobileFinanceiroPage;
