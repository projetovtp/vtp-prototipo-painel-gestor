// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function formatBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatInt(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR");
}

function KPI({ title, value, hint }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "#666", fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>{value}</div>
      {hint ? <div style={{ marginTop: 6, fontSize: 12, color: "#777" }}>{hint}</div> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [overview, setOverview] = useState(null);
  const [finance, setFinance] = useState(null);

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const [o, f] = await Promise.all([
        api.get("/admin/dashboard-overview"),
        api.get("/admin/financeiro-overview"),
      ]);

      setOverview(o.data || null);
      setFinance(f.data || null);
    } catch (e) {
      console.error("[ADMIN/DASH] erro ao carregar:", e);
      setErro(e.response?.data?.error || "Erro ao carregar o dashboard do Admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = overview?.kpis || {};
  const fin = finance || {};

  const ultimasReservas = overview?.ultimas_reservas || [];
  const vendasPorQuadra = overview?.vendas_por_quadra || [];

  const reservasPorQuadraStatus = overview?.reservas_por_quadra_status || [];
  const quadrasSemRegras = overview?.quadras_sem_regras || [];

  const utilizacao = overview?.utilizacao_canal || {};

  const canalItems = useMemo(() => {
    const entries = Object.entries(utilizacao || {});
    return entries
      .map(([k, v]) => ({ canal: k, total: Number(v || 0) }))
      .sort((a, b) => b.total - a.total);
  }, [utilizacao]);

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="page-title">Dashboard (Admin)</h1>
          <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
            Visão geral do sistema: reservas, faturamento, repasses e diagnósticos.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={carregar} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {erro ? (
        <div
          style={{
            marginTop: 12,
            marginBottom: 12,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #fca5a5",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⚠️ {erro}
        </div>
      ) : null}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        <KPI
          title="Faturamento bruto (mês)"
          value={formatBRL(kpis?.receita_bruta_mes)}
          hint="Total recebido + pendente no mês (baseado nas reservas)."
        />
        <KPI
          title="Reservas pagas (mês)"
          value={formatInt(kpis?.reservas_pagas_mes)}
          hint="Pagas no mês."
        />
        <KPI
          title="Reservas pendentes (mês)"
          value={formatInt(kpis?.reservas_pendentes_mes)}
          hint="Aguardando pagamento."
        />
        <KPI
          title="Reservas canceladas (mês)"
          value={formatInt(kpis?.reservas_canceladas_mes)}
          hint="Canceladas no mês."
        />
      </div>

      {/* Financeiro / Repasses */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <KPI
          title="Taxa da plataforma (mês)"
          value={formatBRL(fin?.kpis?.taxa_plataforma_mes)}
          hint="Quanto o sistema reteve (Admin)."
        />
        <KPI
          title="Repasses aos gestores (mês)"
          value={formatBRL(fin?.kpis?.repasses_mes)}
          hint="Quanto deve/foi repassado aos complexos."
        />
        <KPI
          title="PIX pendentes (mês)"
          value={formatInt(fin?.kpis?.pix_pendentes_mes)}
          hint="Reservas que ainda não confirmaram pagamento."
        />
      </div>

      {/* Canal de origem */}
      <div style={{ marginTop: 12 }} className="card">
        <h3>Origem das reservas</h3>
        <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
          Ajuda a entender o que mais vende: WhatsApp ou Painel.
        </p>

        {canalItems.length === 0 ? (
          <p style={{ marginTop: 10 }}>Sem dados de origem no período.</p>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {canalItems.map((c) => (
              <div key={c.canal} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>{c.canal}</div>
                <div style={{ color: "#333" }}>{formatInt(c.total)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top quadras por venda */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <div className="card">
          <h3>Top quadras por faturamento</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
            Mostra onde o dinheiro está concentrado.
          </p>

          {vendasPorQuadra.length === 0 ? (
            <p style={{ marginTop: 10 }}>Sem dados.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table className="tabela-simples" style={{ width: "100%", minWidth: 650 }}>
                <thead>
                  <tr>
                    <th>Quadra</th>
                    <th>Reservas pagas</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasPorQuadra.slice(0, 12).map((q) => (
                    <tr key={q.quadra_id}>
                      <td style={{ fontWeight: 700 }}>{q.quadra_nome}</td>
                      <td>{formatInt(q.reservas_pagas)}</td>
                      <td>{formatBRL(q.receita_bruta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Diagnósticos rápidos */}
        <div className="card">
          <h3>Diagnósticos do sistema</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
            O que costuma “travar venda” ou gerar agenda vazia.
          </p>

          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Quadras sem regras de horário</div>
              <div>{formatInt(quadrasSemRegras.length)}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Pendências por quadra (Top)</div>
              <div>{formatInt(reservasPorQuadraStatus.length)}</div>
            </div>
          </div>

          {quadrasSemRegras.length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Exemplos (sem regra)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                {quadrasSemRegras.slice(0, 6).map((q) => (
                  <div key={q.quadra_id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                    <div style={{ fontWeight: 800 }}>{q.quadra_nome}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      status: {String(q.status ?? "—")} | ativo: {String(q.ativo ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Reservas por quadra (pendentes/pagas/canceladas) */}
      <div style={{ marginTop: 12 }} className="card">
        <h3>Reservas por quadra (status)</h3>
        <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
          Top 30 quadras com mais pendências (para atacar rápido).
        </p>

        {reservasPorQuadraStatus.length === 0 ? (
          <p style={{ marginTop: 10 }}>Sem dados (ou backend ainda não enviou esse campo).</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="tabela-simples" style={{ width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Quadra</th>
                  <th>Total</th>
                  <th>Pagas</th>
                  <th>Pendentes</th>
                  <th>Canceladas</th>
                  <th>Receita paga</th>
                </tr>
              </thead>
              <tbody>
                {reservasPorQuadraStatus.map((q) => (
                  <tr key={q.quadra_id}>
                    <td style={{ fontWeight: 800 }}>{q.quadra_nome}</td>
                    <td>{formatInt(q.total)}</td>
                    <td>{formatInt(q.paid)}</td>
                    <td style={{ fontWeight: 900 }}>{formatInt(q.pending)}</td>
                    <td>{formatInt(q.canceled)}</td>
                    <td>{formatBRL(q.receita_paga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimas reservas */}
      <div style={{ marginTop: 12 }} className="card">
        <h3>Últimas reservas</h3>
        {ultimasReservas.length === 0 ? (
          <p style={{ marginTop: 10 }}>Sem reservas recentes.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="tabela-simples" style={{ width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Status</th>
                  <th>Origem</th>
                  <th>Quadra</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimasReservas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.data || "—"}</td>
                    <td>{r.hora || "—"}</td>
                    <td style={{ fontWeight: 800 }}>{r.status || "—"}</td>
                    <td>{r.origem || "—"}</td>
                    <td>{r.quadra_nome || r.quadra_id || "—"}</td>
                    <td>{formatBRL(r.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
