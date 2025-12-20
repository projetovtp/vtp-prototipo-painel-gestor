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

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd || typeof yyyyMmDd !== "string") return "—";
  // esperado: "YYYY-MM-DD"
  const p = yyyyMmDd.slice(0, 10).split("-");
  if (p.length !== 3) return yyyyMmDd;
  const [y, m, d] = p;
  return `${d}/${m}/${y}`;
}

function statusPT(status) {
  const s = String(status || "").toLowerCase().trim();
  if (s === "paid") return "Pago";
  if (s === "pending") return "Pendente";
  if (s === "canceled" || s === "cancelled") return "Cancelada";
  return status || "—";
}

// Mês atual (do 1º dia até hoje)
function getMesAtualRange() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const pad = (n) => String(n).padStart(2, "0");
  const toISODate = (dt) =>
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

  return { from: toISODate(inicio), to: toISODate(hoje) };
}

function KPI({ title, value, hint }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 12, color: "#666", fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>
        {value}
      </div>
      {hint ? (
        <div style={{ marginTop: 6, fontSize: 12, color: "#777" }}>{hint}</div>
      ) : null}
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

      const { from, to } = getMesAtualRange();

      const [o, f] = await Promise.all([
        api.get("/admin/dashboard-overview", { params: { from, to } }),
        api.get("/admin/financeiro-overview", { params: { from, to } }),
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
  const finKpis = finance?.kpis || {};

  const ultimasReservas = overview?.ultimas_reservas || [];
  const vendasPorQuadra = overview?.vendas_por_quadra || [];

  // Esses dois dependem do backend enviar (se vier, a gente mostra bonito)
  const reservasPorQuadraStatus = overview?.reservas_por_quadra_status || [];
  const quadrasSemRegras = overview?.quadras_sem_regras || [];

  // No seu backend atual, utilizacao_canal é série temporal:
  // { labels: [...], reservas_criadas: [...], reservas_pagas: [...] }
  const utilizacao = overview?.utilizacao_canal || {};
  const origemResumo = useMemo(() => {
    const criadas = Array.isArray(utilizacao?.reservas_criadas)
      ? utilizacao.reservas_criadas.reduce((a, b) => a + Number(b || 0), 0)
      : 0;
    const pagas = Array.isArray(utilizacao?.reservas_pagas)
      ? utilizacao.reservas_pagas.reduce((a, b) => a + Number(b || 0), 0)
      : 0;
    const dias = Array.isArray(utilizacao?.labels) ? utilizacao.labels.length : 0;
    return { criadas, pagas, dias };
  }, [utilizacao]);

  const colNum = { textAlign: "center", whiteSpace: "nowrap" };

  return (
    <div className="page">
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <h1 className="page-title">Dashboard (Admin)</h1>
          <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
            Visão geral do sistema: reservas, faturamento, repasses e diagnósticos.
          </p>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={carregar}
          disabled={loading}
        >
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

      {/* KPIs (mês atual) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <KPI
          title="Faturamento bruto (mês)"
          value={formatBRL(kpis?.receita_bruta)}
          hint="Somente reservas pagas no período."
        />
        <KPI
          title="Reservas pagas (mês)"
          value={formatInt(kpis?.reservas_pagas)}
          hint="Pagas no mês."
        />
        <KPI
          title="Reservas pendentes (mês)"
          value={formatInt(kpis?.reservas_pendentes)}
          hint="Aguardando pagamento."
        />
        <KPI
          title="Reservas canceladas (mês)"
          value={formatInt(kpis?.reservas_canceladas)}
          hint="Canceladas no mês."
        />
      </div>

      {/* Financeiro / Repasses (mês atual) */}
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <KPI
          title="Taxa da plataforma (mês)"
          value={formatBRL(finKpis?.taxa_plataforma)}
          hint="Quanto o sistema reteve (Admin)."
        />
        <KPI
          title="Repasses aos gestores (mês)"
          value={formatBRL(finKpis?.valor_liquido)}
          hint="Valor líquido estimado aos complexos (receita - taxa)."
        />
        <KPI
          title="PIX pendentes (mês)"
          value={formatInt(kpis?.reservas_pendentes)}
          hint="Reservas pendentes no período."
        />
      </div>

      {/* Série de reservas (resumo simples) */}
      <div style={{ marginTop: 12 }} className="card">
        <h3>Reservas no período</h3>
        <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
          Resumo do mês atual (criações vs. pagas).
        </p>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 800 }}>Dias analisados</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>{formatInt(origemResumo.dias)}</div>
          </div>
          <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 800 }}>Reservas criadas</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>{formatInt(origemResumo.criadas)}</div>
          </div>
          <div style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "#666", fontWeight: 800 }}>Reservas pagas</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>{formatInt(origemResumo.pagas)}</div>
          </div>
        </div>
      </div>

      {/* Top quadras */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <div className="card">
          <h3>Top quadras por faturamento</h3>
          <p style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
            Mostra onde o dinheiro está concentrado (somente pagas).
          </p>

          {vendasPorQuadra.length === 0 ? (
            <p style={{ marginTop: 10 }}>Sem dados.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table className="tabela-simples" style={{ width: "100%", minWidth: 650 }}>
                <thead>
                  <tr>
                    <th>Quadra</th>
                    <th style={colNum}>Reservas pagas</th>
                    <th style={colNum}>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasPorQuadra.slice(0, 12).map((q) => (
                    <tr key={q.quadra_id}>
                      <td style={{ fontWeight: 700 }}>{q.quadra_nome}</td>
                      <td style={colNum}>{formatInt(q.reservas_pagas)}</td>
                      <td style={colNum}>{formatBRL(q.receita_bruta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Diagnósticos */}
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

          {reservasPorQuadraStatus.length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Top pendências</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                {reservasPorQuadraStatus.slice(0, 6).map((q) => (
                  <div key={q.quadra_id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                    <div style={{ fontWeight: 900 }}>{q.quadra_nome}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
                      Pendentes: <strong>{formatInt(q.pending)}</strong> | Pagas: {formatInt(q.paid)} | Canceladas: {formatInt(q.canceled)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {quadrasSemRegras.length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Exemplos (sem regra)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                {quadrasSemRegras.slice(0, 6).map((q) => (
                  <div key={q.quadra_id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                    <div style={{ fontWeight: 900 }}>{q.quadra_nome}</div>
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

      {/* Reservas por quadra */}
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
                  <th style={colNum}>Total</th>
                  <th style={colNum}>Pagas</th>
                  <th style={colNum}>Pendentes</th>
                  <th style={colNum}>Canceladas</th>
                  <th style={colNum}>Receita paga</th>
                </tr>
              </thead>
              <tbody>
                {reservasPorQuadraStatus.map((q) => (
                  <tr key={q.quadra_id}>
                    <td style={{ fontWeight: 800 }}>{q.quadra_nome}</td>
                    <td style={colNum}>{formatInt(q.total)}</td>
                    <td style={colNum}>{formatInt(q.paid)}</td>
                    <td style={{ ...colNum, fontWeight: 900 }}>{formatInt(q.pending)}</td>
                    <td style={colNum}>{formatInt(q.canceled)}</td>
                    <td style={colNum}>{formatBRL(q.receita_paga)}</td>
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
                  <th style={colNum}>Data</th>
                  <th style={colNum}>Hora</th>
                  <th style={colNum}>Status</th>
                  <th style={colNum}>Origem</th>
                  <th>Quadra</th>
                  <th style={colNum}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimasReservas.map((r) => (
                  <tr key={r.id}>
                    <td style={colNum}>{formatDateBR(r.data)}</td>
                    <td style={colNum}>{r.hora || "—"}</td>
                    <td style={{ ...colNum, fontWeight: 900 }}>{statusPT(r.status)}</td>
                    <td style={colNum}>{r.origem || "—"}</td>
                    <td>{r.quadra_nome || r.quadra_id || "—"}</td>
                    <td style={colNum}>{formatBRL(r.preco_total)}</td>
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
