import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./gestor-financeiro.css";

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

export default function GestorFinanceiroPage() {
  const def = useMemo(() => defaultPeriodo30(), []);
  const [inicio, setInicio] = useState(def.inicio);
  const [fim, setFim] = useState(def.fim);

  // ⚠️ seu backend de overview não filtra por status via query.
  // Mantive o select por UX, mas ele não altera o resultado agora.
  const [status, setStatus] = useState("paid");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [overview, setOverview] = useState(null);

  // Paginação local (porque o overview retorna só os últimos 20) :contentReference[oaicite:3]{index=3}
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
          "Erro ao carregar financeiro. Verifique se a rota /gestor/financeiro-overview existe no backend."
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
  const inicioIdx = (pagina - 1) * limite;
  const fimIdx = inicioIdx + limite;
  const pagamentos = listaAll.slice(inicioIdx, fimIdx);

  return (
    <div className="gf-container">
      <div className="gf-header">
        <div>
          <h1 className="gf-title">Financeiro</h1>
          <p className="gf-subtitle">
            Acompanhe seus recebimentos (baseado em pagamentos no período).
          </p>
        </div>
      </div>

      <div className="gf-filtros">
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
            <option value="cancelled">Cancelado</option>
          </select>
          <div className="gf-card-hint" style={{ marginTop: 6 }}>
            (por enquanto o backend não filtra por status aqui)
          </div>
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
          <div className="gf-card-label">Total Bruto</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.receita_bruta)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-label">Taxa Plataforma</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.taxa_plataforma)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-label">Líquido do Gestor</div>
          <div className="gf-card-value">
            {loading ? "..." : formatBRL(kpis?.valor_liquido)}
          </div>
        </div>

        <div className="gf-card">
          <div className="gf-card-label">Quantidade de Pagamentos</div>
          <div className="gf-card-value">
            {loading ? "..." : kpis?.qtd_pagamentos ?? 0}
          </div>
          <div className="gf-card-hint">
            (visão baseada em pagamentos registrados no período)
          </div>
        </div>
      </div>

      <div className="gf-table-wrap">
        <div className="gf-table-header">
          <h2 className="gf-table-title">Últimos Pagamentos</h2>

          <div className="gf-table-controls">
            <label>
              Itens:
              <select
                value={limite}
                onChange={(e) => {
                  const l = Number(e.target.value);
                  setLimite(l);
                  setPagina(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>

            <div className="gf-pager">
              <button
                className="gf-btn"
                disabled={pagina <= 1 || loading}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                ◀
              </button>

              <span>
                Página {pagina} / {totalPaginas}
              </span>

              <button
                className="gf-btn"
                disabled={pagina >= totalPaginas || loading}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="gf-table">
          <div className="gf-row gf-head">
            <div>ID</div>
            <div>Data Pgto</div>
            <div>Quadra</div>
            <div>Reserva</div>
            <div>Bruto</div>
            <div>Taxa</div>
            <div>Líquido</div>
          </div>

          {loading ? (
            <div className="gf-row gf-empty">Carregando...</div>
          ) : pagamentos.length === 0 ? (
            <div className="gf-row gf-empty">Nenhum pagamento no período.</div>
          ) : (
            pagamentos.map((p) => (
              <div className="gf-row" key={p.pagamento_id || p.id}>
                <div className="gf-mono" title={p.pagamento_id || p.id}>
                  {String(p.pagamento_id || p.id).slice(0, 8)}…
                </div>

                <div className="gf-mono">
                  {p.created_at ? String(p.created_at).slice(0, 10) : "-"}
                </div>

                <div title={p.quadra_nome || ""}>
                  {p.quadra_nome ? String(p.quadra_nome).slice(0, 22) : "-"}
                  {p.quadra_nome && String(p.quadra_nome).length > 22 ? "…" : ""}
                </div>

                <div className="gf-mono">
                  {p.data_reserva ? `${p.data_reserva} ${p.hora_reserva || ""}` : "-"}
                </div>

                <div>{formatBRL(p.valor_total)}</div>
                <div>{formatBRL(p.taxa_plataforma)}</div>
                <div>{formatBRL(p.valor_liquido_gestor)}</div>
              </div>
            ))
          )}
        </div>

        <div className="gf-card-hint" style={{ marginTop: 10 }}>
          *Observação: esta tela usa a rota <b>/gestor/financeiro-overview</b> e lista até
          os últimos 20 pagamentos (backend).
        </div>
      </div>
    </div>
  );
}
