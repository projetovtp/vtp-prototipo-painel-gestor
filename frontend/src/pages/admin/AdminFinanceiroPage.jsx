import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultPeriodo30() {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminFinanceiroPage() {
  const def = useMemo(() => defaultPeriodo30(), []);
  const [from, setFrom] = useState(def.inicio);
  const [to, setTo] = useState(def.fim);

  const [gestores, setGestores] = useState([]);
  const [gestorId, setGestorId] = useState(""); // opcional

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [overview, setOverview] = useState(null);

  async function carregarGestores() {
    try {
      const { data } = await api.get("/admin/gestores-resumo");
      setGestores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("[ADMIN/FINANCEIRO] falha ao carregar gestores:", e);
      setGestores([]);
    }
  }

  async function carregarOverview() {
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.get("/admin/financeiro-overview", {
        params: {
          from,
          to,
          gestorId: gestorId || undefined
        }
      });
      setOverview(data || null);
    } catch (e) {
      console.error("[ADMIN/FINANCEIRO] erro overview:", e);
      setErro(
        e?.response?.data?.error ||
          "Erro ao carregar financeiro do admin. Verifique o backend."
      );
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarGestores();
    carregarOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = overview?.kpis || {};
  const ultimos = Array.isArray(overview?.ultimos_pagamentos)
    ? overview.ultimos_pagamentos
    : [];

  const porQuadra = Array.isArray(overview?.por_quadra) ? overview.por_quadra : [];

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Financeiro (Admin)</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Visão geral por período. Você pode filtrar por Gestor.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 160px 260px 1fr",
          gap: 12,
          alignItems: "end",
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          marginBottom: 12
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Início</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Fim</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Gestor (opcional)</label>
          <select value={gestorId} onChange={(e) => setGestorId(e.target.value)} style={inputStyle}>
            <option value="">Todos</option>
            {gestores.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome} ({g.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={btnPrimary} onClick={carregarOverview}>
            {loading ? "Carregando..." : "Aplicar"}
          </button>
          <button
            style={btn}
            onClick={() => {
              const d = defaultPeriodo30();
              setFrom(d.inicio);
              setTo(d.fim);
              setGestorId("");
              setTimeout(() => carregarOverview(), 0);
            }}
          >
            Últimos 30 dias
          </button>
        </div>
      </div>

      {erro ? (
        <div style={errorBox}>
          {erro}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <Card label="Qtd. Pagamentos" value={loading ? "..." : (kpis.qtd_pagamentos ?? 0)} />
        <Card label="Receita Bruta" value={loading ? "..." : formatBRL(kpis.receita_bruta)} />
        <Card label="Taxa Plataforma" value={loading ? "..." : formatBRL(kpis.taxa_plataforma)} />
        <Card label="Líquido (Gestores)" value={loading ? "..." : formatBRL(kpis.valor_liquido)} />
      </div>

      <div style={panel}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Por Quadra (Top)</h2>
        <div style={{ marginTop: 10 }}>
          {porQuadra.length === 0 ? (
            <div style={{ opacity: 0.75, padding: 10 }}>Sem dados no período.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ ...rowHead }}>
                <div>Quadra</div>
                <div>Qtd</div>
                <div>Bruto</div>
                <div>Taxa</div>
                <div>Líquido</div>
              </div>

              {porQuadra.slice(0, 20).map((r, idx) => (
                <div key={idx} style={row}>
                  <div title={r.quadra_nome || ""}>{r.quadra_nome || "-"}</div>
                  <div>{r.qtd_pagamentos ?? 0}</div>
                  <div>{formatBRL(r.receita_bruta)}</div>
                  <div>{formatBRL(r.taxa_plataforma)}</div>
                  <div>{formatBRL(r.valor_liquido)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div style={panel}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Últimos Pagamentos</h2>

        <div style={{ marginTop: 10 }}>
          {ultimos.length === 0 ? (
            <div style={{ opacity: 0.75, padding: 10 }}>Sem pagamentos no período.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={rowHead}>
                <div>ID</div>
                <div>Data</div>
                <div>Quadra</div>
                <div>Reserva</div>
                <div>Bruto</div>
                <div>Taxa</div>
                <div>Líquido</div>
              </div>

              {ultimos.map((p) => (
                <div key={p.pagamento_id || p.id} style={row}>
                  <div style={mono} title={p.pagamento_id || p.id}>{String(p.pagamento_id || p.id).slice(0, 8)}…</div>
                  <div style={mono}>{p.created_at ? String(p.created_at).slice(0, 10) : "-"}</div>
                  <div title={p.quadra_nome || ""}>{p.quadra_nome || "-"}</div>
                  <div style={mono}>{p.data_reserva ? `${p.data_reserva} ${p.hora_reserva || ""}` : "-"}</div>
                  <div>{formatBRL(p.valor_total)}</div>
                  <div>{formatBRL(p.taxa_plataforma)}</div>
                  <div>{formatBRL(p.valor_liquido_gestor)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)"
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  outline: "none"
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  cursor: "pointer"
};

const btnPrimary = {
  ...btn,
  background: "rgba(0, 160, 255, 0.18)",
  borderColor: "rgba(0, 160, 255, 0.35)"
};

const errorBox = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255, 80, 80, 0.35)",
  background: "rgba(255, 80, 80, 0.10)",
  marginBottom: 12
};

const panel = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)"
};

const rowHead = {
  display: "grid",
  gridTemplateColumns: "120px 110px 1fr 140px 110px 110px 110px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  fontWeight: 700,
  opacity: 0.9,
  alignItems: "center"
};

const row = {
  display: "grid",
  gridTemplateColumns: "120px 110px 1fr 140px 110px 110px 110px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.18)",
  alignItems: "center"
};

const mono = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 12
};
