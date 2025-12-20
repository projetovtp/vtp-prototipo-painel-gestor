import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function statusPT(statusRaw) {
  const s = String(statusRaw || "").toLowerCase().trim();
  if (s === "paid") return "Paga";
  if (s === "pending") return "Pendente";
  if (s === "canceled" || s === "cancelled") return "Cancelada";
  return statusRaw || "—";
}

export default function GestorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErro("");

        // período padrão vem do backend (mês atual)
        const resp = await api.get("/gestor/dashboard-overview");
        if (!mounted) return;

        setData(resp.data || null);
      } catch (e) {
        console.error("[GESTOR/DASHBOARD] erro:", e);
        const msg =
          e?.response?.data?.error ||
          "Erro ao carregar dashboard do gestor.";
        setErro(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const k = data?.kpis || {};
  const period = data?.period || {};
  const vendasPorQuadra = Array.isArray(data?.vendas_por_quadra) ? data.vendas_por_quadra : [];
  const reservasPorQuadra = Array.isArray(data?.reservas_por_quadra) ? data.reservas_por_quadra : [];
  const ultimasReservas = Array.isArray(data?.ultimas_reservas) ? data.ultimas_reservas : [];

  const periodoLabel = useMemo(() => {
    const f = period?.from ? formatDateBR(period.from) : "—";
    const t = period?.to ? formatDateBR(period.to) : "—";
    return `${f} até ${t}`;
  }, [period?.from, period?.to]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard (Gestor)</h1>
      </div>

      <p style={{ marginBottom: 16, color: "#666", fontSize: 13 }}>
        Visão geral do seu complexo/quadras. Período: <strong>{periodoLabel}</strong>
      </p>

      {erro && (
        <div
          style={{
            marginTop: 10,
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #fca5a5",
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 600
          }}
        >
          {erro}
        </div>
      )}

      {loading && <p>Carregando dashboard...</p>}

      {!loading && data && (
        <>
          {/* KPIs (mesmo estilo do admin) */}
          <div
            className="page-grid"
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              marginBottom: 14
            }}
          >
            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>PIX recebidos (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {formatBRL(k.pix_recebidos_valor)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                {Number(k.pix_recebidos_qtd || 0)} pagamento(s) confirmado(s).
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>PIX pendentes (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {Number(k.pix_pendentes_qtd || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Aguardando confirmação.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Repasses pendentes (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {formatBRL(k.repasses_pendentes_valor)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Valor previsto para você receber.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Repasses pagos (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {formatBRL(k.repasses_pagos_valor)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Já repassado no mês.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Reservas pagas (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {Number(k.reservas_pagas || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Pagas no período.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Reservas pendentes (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {Number(k.reservas_pendentes || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Aguardando pagamento.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Reservas canceladas (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {Number(k.reservas_canceladas || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Canceladas no período.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, color: "#666" }}>Total de reservas (mês)</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {Number(k.total_reservas || 0)}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Todas as reservas do período.
              </div>
            </div>
          </div>

          {/* TOP QUADRAS (PIX real) + RESERVAS POR QUADRA */}
          <div
            className="page-grid"
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr 1fr",
              marginBottom: 12
            }}
          >
            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Top quadras por faturamento (PIX)</h3>

              {vendasPorQuadra.length === 0 ? (
                <p style={{ fontSize: 13, color: "#666" }}>Sem pagamentos PIX confirmados no período.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tabela-simples" style={{ width: "100%", minWidth: 520 }}>
                    <thead>
                      <tr>
                        <th>Quadra</th>
                        <th style={{ textAlign: "center" }}>Pagamentos</th>
                        <th style={{ textAlign: "right" }}>Faturamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasPorQuadra.slice(0, 10).map((q) => (
                        <tr key={q.quadra_id}>
                          <td>{q.quadra_nome}</td>
                          <td style={{ textAlign: "center" }}>{Number(q.reservas_pagas || 0)}</td>
                          <td style={{ textAlign: "right" }}>{formatBRL(q.faturamento)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Reservas por quadra</h3>

              {reservasPorQuadra.length === 0 ? (
                <p style={{ fontSize: 13, color: "#666" }}>Sem reservas no período.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="tabela-simples" style={{ width: "100%", minWidth: 620 }}>
                    <thead>
                      <tr>
                        <th>Quadra</th>
                        <th style={{ textAlign: "center" }}>Total</th>
                        <th style={{ textAlign: "center" }}>Pagas</th>
                        <th style={{ textAlign: "center" }}>Pendentes</th>
                        <th style={{ textAlign: "center" }}>Canceladas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasPorQuadra.slice(0, 12).map((q) => (
                        <tr key={q.quadra_id}>
                          <td>{q.quadra_nome}</td>
                          <td style={{ textAlign: "center" }}>{Number(q.total_reservas || 0)}</td>
                          <td style={{ textAlign: "center" }}>{Number(q.pagas || 0)}</td>
                          <td style={{ textAlign: "center" }}>{Number(q.pendentes || 0)}</td>
                          <td style={{ textAlign: "center" }}>{Number(q.canceladas || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ÚLTIMAS RESERVAS */}
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Últimas reservas</h3>

            {ultimasReservas.length === 0 ? (
              <p style={{ fontSize: 13, color: "#666" }}>Nenhuma reserva encontrada.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tabela-simples" style={{ width: "100%", minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Status</th>
                      <th>Quadra</th>
                      <th style={{ textAlign: "right" }}>Valor</th>
                      <th>Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasReservas.map((r) => (
                      <tr key={r.id}>
                        <td>{formatDateBR(r.data)}</td>
                        <td>{r.hora || "—"}</td>
                        <td>{statusPT(r.status)}</td>
                        <td>{r.quadra_nome || "—"}</td>
                        <td style={{ textAlign: "right" }}>{formatBRL(r.preco_total)}</td>
                        <td>{r.origem || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
              * O faturamento exibido no topo considera somente <strong>pagamentos PIX confirmados</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
