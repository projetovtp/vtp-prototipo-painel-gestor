import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultPeriodo30() {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(fim.getDate() - 30);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GestorFinanceiroPage() {
  const def = useMemo(() => defaultPeriodo30(), []);
  const [inicio, setInicio] = useState(def.inicio);
  const [fim, setFim] = useState(def.fim);

  const [status, setStatus] = useState("paid");

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);

  async function carregarOverview() {
    setLoading(true);
    setErro("");

    try {
      const { data } = await api.get("/gestor/financeiro-overview", {
        params: { from: inicio, to: fim, status }
      });

      setOverview(data || null);
      setPagina(1);
    } catch (e) {
      console.error("[GESTOR/FINANCEIRO] erro overview:", e);
      setErro(
        e?.response?.data?.error ||
          "Erro ao carregar financeiro. Verifique sua conexão e tente novamente."
      );
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltro() {
    setPagina(1);
    carregarOverview();
  }

  useEffect(() => {
    aplicarFiltro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparPeriodo() {
    const d = defaultPeriodo30();
    setInicio(d.inicio);
    setFim(d.fim);
    setStatus("paid");
    setPagina(1);
    setLimite(20);
    setTimeout(() => {
      carregarOverview();
    }, 0);
  }

  const kpis = overview?.kpis || {};
  const listaAll = Array.isArray(overview?.ultimos_pagamentos)
    ? overview.ultimos_pagamentos
    : [];

  const totalPaginas = Math.max(1, Math.ceil(listaAll.length / limite));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);

  const lista = listaAll.slice((paginaSegura - 1) * limite, paginaSegura * limite);

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Financeiro (Gestor)</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Indicadores e últimos pagamentos confirmados no período selecionado.
      </p>

      <div className="gf-filtros" style={{ marginTop: 14 }}>
        <div className="gf-filtro-item">
          <label>Início</label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        <div className="gf-filtro-item">
          <label>Fim</label>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>

        <div className="gf-filtro-item">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="paid">Pago</option>
            <option value="canceled">Cancelado</option>
            <option value="cancelled">Cancelado (variação)</option>
          </select>
        </div>

        <div className="gf-actions">
          <button className="gf-btn gf-btn-primary" onClick={aplicarFiltro}>
            Aplicar
          </button>
          <button className="gf-btn" onClick={limparPeriodo}>
            Últimos 30 dias
          </button>
        </div>
      </div>

      {erro ? <div className="gf-error">{erro}</div> : null}

      <div className="gf-cards">
        <div className="gf-card">
          <div className="gf-card-title">Receita bruta</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.receita_bruta)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-title">Taxa plataforma</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.taxa_plataforma)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-title">Valor líquido</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.valor_liquido)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-title">Qtd pagamentos</div>
          <div className="gf-card-value">
            {loading ? "..." : kpis?.qtd_pagamentos ?? 0}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ margin: "10px 0" }}>Últimos pagamentos</h3>

        <div className="gf-table">
          <div className="gf-row gf-head">
            <div>Data</div>
            <div>Valor</div>
            <div>Status</div>
          </div>

          {loading ? (
            <div className="gf-row gf-empty">Carregando...</div>
          ) : lista.length === 0 ? (
            <div className="gf-row gf-empty">Nenhum pagamento no período.</div>
          ) : (
            lista.map((p) => (
              <div className="gf-row" key={p.id}>
                <div>{String(p.created_at || "").slice(0, 10) || "-"}</div>
                <div>{formatBRL(p.valor_total)}</div>
                <div>{String(p.status || "-")}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <button
            className="gf-btn"
            disabled={paginaSegura <= 1}
            onClick={() => setPagina((x) => Math.max(1, x - 1))}
          >
            Anterior
          </button>

          <div style={{ opacity: 0.8 }}>
            Página {paginaSegura} / {totalPaginas}
          </div>

          <button
            className="gf-btn"
            disabled={paginaSegura >= totalPaginas}
            onClick={() => setPagina((x) => Math.min(totalPaginas, x + 1))}
          >
            Próxima
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ opacity: 0.8 }}>Itens/página:</div>
            <select value={limite} onChange={(e) => setLimite(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
