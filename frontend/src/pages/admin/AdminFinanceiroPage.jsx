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
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminFinanceiroPage() {
  const def = useMemo(() => defaultPeriodo30(), []);
  const [from, setFrom] = useState(def.inicio);
  const [to, setTo] = useState(def.fim);

  const [gestores, setGestores] = useState([]);
  const [gestorId, setGestorId] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [overview, setOverview] = useState(null);
  const [resumo, setResumo] = useState(null);

  async function carregarGestores() {
    try {
      const { data } = await api.get("/admin/gestores-resumo");
      setGestores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("[ADMIN/FINANCEIRO] falha ao carregar gestores:", e);
      // não trava a tela por causa disso
    }
  }

  async function carregarTudo() {
    setErro("");
    setLoading(true);
    try {
      // ✅ overview usa from/to e aceita gestorId opcional
      const paramsOverview = {
        from,
        to,
        ...(gestorId ? { gestorId } : {}),
      };

      // ✅ resumo no seu backend às vezes é inicio/fim
      // então mandamos os DOIS pra ficar compatível
      const paramsResumo = {
        inicio: from,
        fim: to,
        from,
        to,
        status: "paid",
      };

      const [rOverview, rResumo] = await Promise.all([
        api.get("/admin/financeiro-overview", { params: paramsOverview }),
        api.get("/admin/financeiro/resumo", { params: paramsResumo }),
      ]);

      setOverview(rOverview?.data || null);
      setResumo(rResumo?.data || null);
    } catch (e) {
      console.error("[ADMIN/FINANCEIRO] erro ao carregar:", e);
      setErro(
        e?.response?.data?.error ||
          e?.message ||
          "Falha ao carregar financeiro."
      );
      setOverview(null);
      setResumo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarGestores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, gestorId]);

  // Normalizações defensivas (evita quebrar UI se o backend mudar nomes)
  const resumoNorm = useMemo(() => {
    if (!resumo) return null;
    return {
      periodo: resumo.periodo || { inicio: from, fim: to },
      status: resumo.status || "paid",
      qtd_pagamentos: safeNum(resumo.qtd_pagamentos),
      total_bruto: safeNum(resumo.total_bruto),
      total_taxa: safeNum(resumo.total_taxa),
      total_liquido: safeNum(resumo.total_liquido),
      pendentes_repasse: safeNum(resumo.pendentes_repasse),
      repasses_pendentes: safeNum(resumo.repasses_pendentes),
      repasses_pagos: safeNum(resumo.repasses_pagos),
    };
  }, [resumo, from, to]);

  return (
    <div className="page">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="page-title">Financeiro (Admin)</h1>
          <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
            Visão global do período + overview (opcional) por gestor.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-outline-secondary"
            onClick={carregarTudo}
            disabled={loading}
            type="button"
          >
            {loading ? "Carregando..." : "Recarregar"}
          </button>
        </div>
      </div>

      {/* filtros */}
      <div className="vt-card" style={{ padding: 14, marginTop: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="admin_fin_from" style={{ fontWeight: 700, fontSize: 13 }}>
              De
            </label>
            <input
              id="admin_fin_from"
              name="admin_fin_from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="form-control"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="admin_fin_to" style={{ fontWeight: 700, fontSize: 13 }}>
              Até
            </label>
            <input
              id="admin_fin_to"
              name="admin_fin_to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="form-control"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="admin_fin_gestor" style={{ fontWeight: 700, fontSize: 13 }}>
              Filtrar por gestor (opcional)
            </label>
            <select
              id="admin_fin_gestor"
              name="admin_fin_gestor"
              value={gestorId}
              onChange={(e) => setGestorId(e.target.value)}
              className="form-control"
            >
              <option value="">(Todos)</option>
              {(gestores || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome || g.email || g.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {erro ? (
          <div style={{ marginTop: 10, color: "#b00020", fontSize: 13 }}>
            {erro}
          </div>
        ) : null}
      </div>

      {/* resumo */}
      <div className="vt-card" style={{ padding: 14, marginTop: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Resumo global</h3>
        <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
          Baseado nos pagamentos do período (status: <b>{resumoNorm?.status || "paid"}</b>).
        </p>

        {!resumoNorm ? (
          <div style={{ marginTop: 10, color: "#666" }}>
            {loading ? "Carregando..." : "Sem dados."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Qtd. pagamentos</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{resumoNorm.qtd_pagamentos}</div>
            </div>

            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Total bruto</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{formatBRL(resumoNorm.total_bruto)}</div>
            </div>

            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Total líquido (gestores)</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{formatBRL(resumoNorm.total_liquido)}</div>
            </div>

            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Total taxa (plataforma)</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{formatBRL(resumoNorm.total_taxa)}</div>
            </div>

            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Pendentes de repasse</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{resumoNorm.pendentes_repasse}</div>
            </div>

            <div className="vt-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Repasses (pendentes / pagos)</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {resumoNorm.repasses_pendentes} / {resumoNorm.repasses_pagos}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* overview (pode variar conforme backend) */}
      <div className="vt-card" style={{ padding: 14, marginTop: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>
          Overview {gestorId ? "(por gestor)" : "(geral)"}
        </h3>

        {!overview ? (
          <div style={{ marginTop: 10, color: "#666" }}>
            {loading ? "Carregando..." : "Sem dados."}
          </div>
        ) : (
          <pre
            style={{
              marginTop: 10,
              background: "#111",
              color: "#eee",
              padding: 12,
              borderRadius: 10,
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {JSON.stringify(overview, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
