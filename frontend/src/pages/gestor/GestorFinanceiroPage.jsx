import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useGestorFinanceiro } from "../../hooks/api";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/ui";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function formatBRL(v) {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR");
}

function statusLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "Pago";
  if (v === "pending") return "Pendente";
  if (v === "canceled" || v === "cancelled") return "Cancelado";
  return v || "-";
}

function statusRepasseLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "Concluído";
  if (v === "pendente") return "Pendente";
  if (v === "recusado" || v === "rejeitado") return "Recusado";
  return v || "Pendente";
}

function statusRepasseClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "green";
  if (v === "pendente") return "yellow";
  if (v === "recusado" || v === "rejeitado") return "red";
  return "muted";
}

function statusPaymentClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "green";
  if (v === "pending") return "yellow";
  if (v === "canceled" || v === "cancelled") return "red";
  return "muted";
}

function gerarMockFinanceiro() {
  const hoje = new Date();
  const dia = (offset) => new Date(hoje.getTime() - offset * 86400000).toISOString();

  const mockPagamentos = [
    { id: 1,  created_at: dia(0),  valor_total: 250.0,  taxa_plataforma: 25.0,  status: "paid" },
    { id: 2,  created_at: dia(1),  valor_total: 180.0,  taxa_plataforma: 18.0,  status: "paid" },
    { id: 3,  created_at: dia(2),  valor_total: 320.0,  taxa_plataforma: 32.0,  status: "paid" },
    { id: 4,  created_at: dia(3),  valor_total: 200.0,  taxa_plataforma: 20.0,  status: "pending" },
    { id: 5,  created_at: dia(4),  valor_total: 150.0,  taxa_plataforma: 15.0,  status: "pending" },
    { id: 6,  created_at: dia(5),  valor_total: 280.0,  taxa_plataforma: 28.0,  status: "canceled" },
    { id: 7,  created_at: dia(6),  valor_total: 220.0,  taxa_plataforma: 22.0,  status: "canceled" },
    { id: 8,  created_at: dia(35), valor_total: 400.0,  taxa_plataforma: 40.0,  status: "paid" },
    { id: 9,  created_at: dia(38), valor_total: 350.0,  taxa_plataforma: 35.0,  status: "paid" },
    { id: 10, created_at: dia(42), valor_total: 290.0,  taxa_plataforma: 29.0,  status: "paid" },
    { id: 11, created_at: dia(50), valor_total: 180.0,  taxa_plataforma: 18.0,  status: "paid" },
    { id: 12, created_at: dia(65), valor_total: 500.0,  taxa_plataforma: 50.0,  status: "paid" },
    { id: 13, created_at: dia(70), valor_total: 420.0,  taxa_plataforma: 42.0,  status: "paid" },
    { id: 14, created_at: dia(75), valor_total: 310.0,  taxa_plataforma: 31.0,  status: "paid" },
  ];

  const allPaid = mockPagamentos.filter((p) => p.status === "paid");
  const totalTaxa = allPaid.reduce((s, p) => s + p.taxa_plataforma, 0);
  const totalBruta = allPaid.reduce((s, p) => s + p.valor_total, 0);

  const ovTotal = {
    kpis: { receita_bruta: totalBruta, taxa_plataforma: totalTaxa, valor_liquido: totalBruta - totalTaxa, qtd_pagamentos: allPaid.length },
    ultimos_pagamentos: allPaid,
  };
  const ovPendente = {
    kpis: { receita_bruta: 15000.0, taxa_plataforma: 1500.0, valor_liquido: 13500.0, qtd_pagamentos: 8 },
    ultimos_pagamentos: mockPagamentos.filter((p) => p.status === "pending"),
  };
  const ovCancelado = {
    kpis: { receita_bruta: 5000.0, taxa_plataforma: 500.0, valor_liquido: 4500.0, qtd_pagamentos: 3 },
    ultimos_pagamentos: mockPagamentos.filter((p) => p.status === "canceled"),
  };

  const reservasPorDia = [
    { data: new Date(hoje.getTime() - 5 * 86400000), valor: 1000.0 },
    { data: new Date(hoje.getTime() - 4 * 86400000), valor: 3000.0 },
    { data: new Date(hoje.getTime() - 3 * 86400000), valor: 2000.0 },
    { data: new Date(hoje.getTime() - 2 * 86400000), valor: 2500.0 },
    { data: new Date(hoje.getTime() - 1 * 86400000), valor: 3500.0 },
    { data: hoje, valor: 3000.0 },
  ];

  const transacoesConcluidas = [
    { id: 1, data: new Date(hoje.getTime() - 30 * 86400000), valor: 15000.0, descricao: "Reservas do mês anterior" },
    { id: 2, data: new Date(hoje.getTime() - 25 * 86400000), valor: 12000.0, descricao: "Pacote de reservas semanais" },
    { id: 3, data: new Date(hoje.getTime() - 20 * 86400000), valor: 18000.0, descricao: "Evento corporativo" },
    { id: 4, data: new Date(hoje.getTime() - 15 * 86400000), valor: 22000.0, descricao: "Campeonato de futebol" },
    { id: 5, data: new Date(hoje.getTime() - 10 * 86400000), valor: 25000.0, descricao: "Reservas mensais" },
    { id: 6, data: new Date(hoje.getTime() - 5 * 86400000), valor: 18000.0, descricao: "Eventos diversos" },
    { id: 7, data: new Date(hoje.getTime() - 2 * 86400000), valor: 2500.0, descricao: "Reservas finais de semana" },
  ];

  const umMesAtras = new Date(hoje.getTime() - 30 * 86400000);
  const doisMesesAtras = new Date(hoje.getTime() - 60 * 86400000);
  const tresMesesAtras = new Date(hoje.getTime() - 90 * 86400000);

  const repassesMock = [
    { id: 1, valor_total_liquido: 12500.0, nome_titular: "Lorenzo Formenton", data_pagamento: hoje.toISOString().split("T")[0], status: "pago", created_at: hoje.toISOString() },
    { id: 2, valor_total_liquido: 9800.0, nome_titular: "Lorenzo Formenton", data_pagamento: umMesAtras.toISOString().split("T")[0], status: "pago", created_at: umMesAtras.toISOString() },
    { id: 3, valor_total_liquido: 15200.0, nome_titular: "Lorenzo Formenton", data_pagamento: doisMesesAtras.toISOString().split("T")[0], status: "pago", created_at: doisMesesAtras.toISOString() },
    { id: 4, valor_total_liquido: 7500.0, nome_titular: "Lorenzo Formenton", data_pagamento: null, status: "pendente", created_at: tresMesesAtras.toISOString() },
    { id: 5, valor_total_liquido: 11000.0, nome_titular: "Lorenzo Formenton", data_pagamento: null, status: "recusado", created_at: tresMesesAtras.toISOString() },
  ];

  return { ovTotal, ovPendente, ovCancelado, reservasPorDia, transacoesConcluidas, repassesMock };
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
  </svg>
);

const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#f59e0b"/>
  </svg>
);

const IconCancel = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#ef4444"/>
  </svg>
);

const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="#6366f1"/>
  </svg>
);

const IconCheckStroke = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function PaymentMiniTable({ pagamentos, showTaxa }) {
  if (!pagamentos || pagamentos.length === 0) return null;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="gf-modal-mini-table">
        <thead>
          <tr>
            <th>Data</th>
            {showTaxa && <th>Valor Total</th>}
            <th>{showTaxa ? "Taxa" : "Valor"}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.map((p) => (
            <tr key={p.id}>
              <td>{formatDateBR(p.created_at)}</td>
              {showTaxa && <td className="gf-cell-bold">{formatBRL(p.valor_total)}</td>}
              <td className="gf-cell-bold">{formatBRL(showTaxa ? (p.taxa_plataforma || 0) : p.valor_total)}</td>
              <td>
                <span className={`gf-badge gf-badge--${statusPaymentClass(p.status)}`}>
                  {statusLabel(p.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function GestorFinanceiroPage() {
  const financeiro = useGestorFinanceiro();

  const [overviewTotal, setOverviewTotal] = useState(null);
  const [overviewPendente, setOverviewPendente] = useState(null);
  const [overviewCancelado, setOverviewCancelado] = useState(null);
  const [repasses, setRepasses] = useState([]);
  const [nomeTitular, setNomeTitular] = useState("Lorenzo Formenton");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [, setRepasseSelecionado] = useState(null);
  const [detalhesRepasse, setDetalhesRepasse] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const [modalDetalhesVendasAberto, setModalDetalhesVendasAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("processamento");

  const [modalDetalhesTotalAberto, setModalDetalhesTotalAberto] = useState(false);
  const [tipoDetalhesTotal, setTipoDetalhesTotal] = useState("");
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [transacoesConcluidas, setTransacoesConcluidas] = useState([]);

  const [modalSolicitarRepasseAberto, setModalSolicitarRepasseAberto] = useState(false);
  const [valorRepasse, setValorRepasse] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [solicitandoRepasse, setSolicitandoRepasse] = useState(false);
  const [modalSucessoRepasseAberto, setModalSucessoRepasseAberto] = useState(false);

  const kpisTotal = overviewTotal?.kpis || {};
  const kpisPendente = overviewPendente?.kpis || {};
  const kpisCancelado = overviewCancelado?.kpis || {};

  const totalAReceber = kpisPendente?.valor_liquido || 0;
  const totalRecebido = kpisTotal?.valor_liquido || 0;
  const vendasProcessamento = kpisPendente?.receita_bruta || 0;
  const vendasCanceladas = kpisCancelado?.receita_bruta || 0;

  const pagamentosPagos = useMemo(() => overviewTotal?.ultimos_pagamentos || [], [overviewTotal]);

  const mesAtual = useMemo(() => {
    const now = new Date();
    return { ano: now.getFullYear(), mes: now.getMonth() };
  }, []);

  const { taxaMensal, pagamentosMes } = useMemo(() => {
    const filtered = pagamentosPagos.filter((p) => {
      const d = new Date(p.created_at);
      return d.getFullYear() === mesAtual.ano && d.getMonth() === mesAtual.mes;
    });
    const total = filtered.reduce((s, p) => s + (p.taxa_plataforma || 0), 0);
    return { taxaMensal: total, pagamentosMes: filtered };
  }, [pagamentosPagos, mesAtual]);

  const labelMesAtual = `${MESES[mesAtual.mes]} ${mesAtual.ano}`;

  const totalPaginas = Math.max(1, Math.ceil(repasses.length / itensPorPagina));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const repassesPaginados = repasses.slice(
    (paginaSegura - 1) * itensPorPagina,
    paginaSegura * itensPorPagina
  );

  async function carregarDados() {
    setLoading(true);
    setErro("");
    try {
      const [overviewData, repassesData, reservasDia, transacoesData, bancarios] = await Promise.allSettled([
        financeiro.obterOverview(),
        financeiro.listarRepasses(),
        financeiro.obterReservasPorDia(),
        financeiro.listarTransacoes(),
        financeiro.obterDadosBancarios(),
      ]);

      const apiOk = overviewData.status === "fulfilled" && overviewData.value;
      if (apiOk) {
        const ov = overviewData.value;
        setOverviewTotal(ov.total || ov);
        setOverviewPendente(ov.pendente || null);
        setOverviewCancelado(ov.cancelado || null);
        if (repassesData.status === "fulfilled") setRepasses(repassesData.value || []);
        if (reservasDia.status === "fulfilled") setReservasPorDia(reservasDia.value || []);
        if (transacoesData.status === "fulfilled") setTransacoesConcluidas(transacoesData.value || []);
        if (bancarios.status === "fulfilled" && bancarios.value) {
          setNomeTitular(bancarios.value.nomeTitular || "");
          setChavePix(bancarios.value.chavePix || "");
        }
      } else {
        throw new Error("API indisponível");
      }
    } catch {
      const mock = gerarMockFinanceiro();
      setOverviewTotal(mock.ovTotal);
      setOverviewPendente(mock.ovPendente);
      setOverviewCancelado(mock.ovCancelado);
      setReservasPorDia(mock.reservasPorDia);
      setTransacoesConcluidas(mock.transacoesConcluidas);
      setRepasses(mock.repassesMock);
      setNomeTitular("Lorenzo Formenton");
      setChavePix("lorenzo.formenton@email.com");
    } finally {
      setLoading(false);
    }
  }

  async function abrirDetalhesRepasse(repasse) {
    setRepasseSelecionado(repasse);
    setModalDetalhesAberto(true);
    setCarregandoDetalhes(true);
    try {
      const data = await financeiro.obterDetalheRepasse(repasse.id);
      setDetalhesRepasse(data);
    } catch {
      setDetalhesRepasse(null);
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fecharTodosModais = useCallback(() => {
    setModalDetalhesAberto(false);
    setModalDetalhesVendasAberto(false);
    setModalDetalhesTotalAberto(false);
    if (!solicitandoRepasse) setModalSolicitarRepasseAberto(false);
    setModalSucessoRepasseAberto(false);
  }, [solicitandoRepasse]);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") fecharTodosModais();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [fecharTodosModais]);

  function abrirModalSolicitarRepasse() {
    setValorRepasse(totalAReceber.toString());
    setModalSolicitarRepasseAberto(true);
  }

  function formatarValor(valor) {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (!apenasNumeros) return "";
    const valorNumerico = Number(apenasNumeros) / 100;
    return valorNumerico.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function handleValorChange(e) {
    const valor = e.target.value;
    const apenasNumeros = valor.replace(/\D/g, "");
    if (!apenasNumeros) {
      setValorRepasse("");
      return;
    }
    const valorNumerico = Number(apenasNumeros) / 100;
    if (valorNumerico > totalAReceber) {
      setValorRepasse(formatarValor(totalAReceber.toString()));
    } else {
      setValorRepasse(formatarValor(valor));
    }
  }

  function getValorNumerico(valorFormatado) {
    if (!valorFormatado) return 0;
    const apenasNumeros = valorFormatado.replace(/\D/g, "");
    return Number(apenasNumeros) / 100;
  }

  async function confirmarSolicitacaoRepasse() {
    const valor = getValorNumerico(valorRepasse);
    if (valor <= 0) { alert("Por favor, informe um valor válido."); return; }
    if (valor > totalAReceber) { alert(`O valor não pode ser maior que ${formatBRL(totalAReceber)}.`); return; }
    if (!chavePix) { alert("Por favor, configure a chave PIX nas configurações antes de solicitar um repasse."); return; }

    setSolicitandoRepasse(true);
    try {
      await financeiro.solicitarRepasse({ valor, chave_pix: chavePix });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setModalSolicitarRepasseAberto(false);
    setModalSucessoRepasseAberto(true);
    setValorRepasse("");
    setSolicitandoRepasse(false);
    carregarDados();
  }

  return (
    <div className="page">
      <div style={{ marginBottom: "var(--space-sm)" }}>
        <h1 className="page-title">Financeiro</h1>
        <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", marginTop: "var(--space-xs)" }}>Gerencie suas finanças e acompanhe seus repasses</p>
      </div>

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

        {/* Resumo Financeiro */}
        <div>
          <h2 className="gf-stats-title">Resumo Financeiro</h2>
          <div className="gf-summary-grid">
            <div className="gf-summary-card gf-summary-card--blue">
              <div className="gf-summary-circle" />
              <div className="gf-summary-inner">
                <div className="gf-summary-top">
                  <div className="gf-summary-label">Total a Receber</div>
                  <button className="gf-summary-btn" onClick={() => { setTipoDetalhesTotal("receber"); setModalDetalhesTotalAberto(true); }}>
                    Ver Detalhes
                  </button>
                </div>
                <div className="gf-summary-value">{loading ? "..." : formatBRL(totalAReceber)}</div>
                <div className="gf-summary-hint">Valor disponível para solicitar repasse</div>
              </div>
            </div>

            <div className="gf-summary-card gf-summary-card--green">
              <div className="gf-summary-circle" />
              <div className="gf-summary-inner">
                <div className="gf-summary-top">
                  <div className="gf-summary-label">Total Recebido</div>
                  <button className="gf-summary-btn" onClick={() => { setTipoDetalhesTotal("recebido"); setModalDetalhesTotalAberto(true); }}>
                    Ver Detalhes
                  </button>
                </div>
                <div className="gf-summary-value">{loading ? "..." : formatBRL(totalRecebido)}</div>
                <div className="gf-summary-hint">Total já recebido em vendas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Solicitar Repasse */}
        <div className="gf-actions-box">
          <div className="gf-actions-row">
            <div className="gf-actions-text">
              <h3>Solicitar Repasse</h3>
              <p>Solicite o repasse do valor disponível para sua conta</p>
            </div>
            <button className="gf-repasse-btn" onClick={abrirModalSolicitarRepasse} disabled={loading || totalAReceber <= 0} type="button">
              <IconCheck />
              Solicitar Repasse
            </button>
          </div>
        </div>

        {/* Estatísticas de Vendas */}
        <div style={{ marginBottom: 32 }}>
          <div className="gf-stats-header">
            <div>
              <h2 className="gf-stats-title">Estatísticas de Vendas</h2>
              <p className="gf-stats-subtitle">Acompanhe o desempenho das suas vendas</p>
            </div>
            <button className="gf-stats-detail-btn" onClick={() => { setAbaAtiva("processamento"); setModalDetalhesVendasAberto(true); }}>
              Ver Detalhes
            </button>
          </div>

          <div className="gf-stats-grid">
            <div className="gf-stat-card gf-stat-card--yellow">
              <div className="gf-stat-top">
                <div className="gf-stat-label">Vendas em Processamento</div>
                <div className="gf-stat-icon gf-stat-icon--yellow"><IconClock /></div>
              </div>
              <div className="gf-stat-value">{loading ? "..." : formatBRL(vendasProcessamento)}</div>
              <div className="gf-stat-hint">Aguardando confirmação de pagamento</div>
            </div>

            <div className="gf-stat-card gf-stat-card--red">
              <div className="gf-stat-top">
                <div className="gf-stat-label">Vendas Canceladas</div>
                <div className="gf-stat-icon gf-stat-icon--red"><IconCancel /></div>
              </div>
              <div className="gf-stat-value">{loading ? "..." : formatBRL(vendasCanceladas)}</div>
              <div className="gf-stat-hint">Reservas canceladas pelos clientes</div>
            </div>

            <div className="gf-stat-card gf-stat-card--purple">
              <div className="gf-stat-top">
                <div className="gf-stat-label">Taxa da Plataforma</div>
                <div className="gf-stat-icon gf-stat-icon--purple"><IconDollar /></div>
              </div>
              <div className="gf-stat-value">{loading ? "..." : formatBRL(taxaMensal)}</div>
              <div className="gf-stat-hint">{labelMesAtual}</div>
            </div>
          </div>
        </div>

        {/* Histórico de Transações */}
        <div className="gf-table-section">
          <div className="gf-table-box">
            <div className="gf-table-header">
              <div className="gf-table-header-text">
                <h3>Histórico de Transações</h3>
                <p>Acompanhe todos os repasses realizados</p>
              </div>
              <div className="gf-count-badge">
                {repasses.length} {repasses.length === 1 ? "transação" : "transações"}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner mensagem="Carregando..." tamanho={24} />
            ) : repasses.length === 0 ? (
              <EmptyState titulo="Nenhum repasse encontrado." compact />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="gf-table">
                    <thead>
                      <tr>
                        <th>Total Repassado</th>
                        <th>Nome do Titular</th>
                        <th>Data Repassado</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repassesPaginados.map((repasse) => {
                        const cls = statusRepasseClass(repasse.status);
                        return (
                          <tr key={repasse.id}>
                            <td className="gf-cell-bold">{formatBRL(repasse.valor_total_liquido || 0)}</td>
                            <td>{repasse.nome_titular || nomeTitular || "—"}</td>
                            <td>{repasse.data_pagamento ? formatDateBR(repasse.data_pagamento) : repasse.created_at ? formatDateBR(repasse.created_at) : "—"}</td>
                            <td>
                              <span className={`gf-badge gf-badge--${cls}`}>
                                <span className="gf-badge-dot" />
                                {statusRepasseLabel(repasse.status)}
                              </span>
                            </td>
                            <td>
                              <button className="gf-detail-btn" onClick={() => abrirDetalhesRepasse(repasse)}>
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPaginas > 1 && (
                  <div className="gf-pagination">
                    <button className="gf-page-btn" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura <= 1}>
                      Anterior
                    </button>
                    <div className="gf-pagination-info">Página {paginaSegura} de {totalPaginas}</div>
                    <button className="gf-page-btn" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura >= totalPaginas}>
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal: Detalhes do Repasse */}
        {modalDetalhesAberto && (
          <div className="dash-modal-overlay" onClick={() => setModalDetalhesAberto(false)}>
            <div className="dash-modal dash-modal--md" onClick={(e) => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h2 className="dash-modal-title">Detalhes do Repasse</h2>
                <button className="dash-modal-close" onClick={() => setModalDetalhesAberto(false)}>×</button>
              </div>

              {carregandoDetalhes ? (
                <LoadingSpinner mensagem="Carregando detalhes..." tamanho={24} />
              ) : detalhesRepasse ? (
                <div>
                  <div className="gf-repasse-field">
                    <div className="gf-repasse-field-label">Valor Total Repassado</div>
                    <div className="gf-repasse-field-value">{formatBRL(detalhesRepasse.repasse?.valor_total_liquido || 0)}</div>
                  </div>
                  <div className="gf-repasse-field">
                    <div className="gf-repasse-field-label">Data do Repasse</div>
                    <div className="gf-repasse-field-value gf-repasse-field-value--sm">
                      {detalhesRepasse.repasse?.data_pagamento ? formatDateBR(detalhesRepasse.repasse.data_pagamento) : "—"}
                    </div>
                  </div>
                  <div className="gf-repasse-field">
                    <div className="gf-repasse-field-label">Status</div>
                    <div className="gf-repasse-field-value gf-repasse-field-value--sm">
                      {detalhesRepasse.repasse?.status === "pago" ? "Pago" : detalhesRepasse.repasse?.status === "pendente" ? "Pendente" : detalhesRepasse.repasse?.status || "—"}
                    </div>
                  </div>

                  {detalhesRepasse.pagamentos?.length > 0 && (
                    <div>
                      <h3 className="gf-repasse-detail-title">Agendamentos Incluídos</h3>
                      <PaymentMiniTable pagamentos={detalhesRepasse.pagamentos} />
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState titulo="Erro ao carregar detalhes do repasse." compact />
              )}
            </div>
          </div>
        )}

        {/* Modal: Detalhes de Vendas */}
        {modalDetalhesVendasAberto && (
          <div className="dash-modal-overlay" onClick={() => setModalDetalhesVendasAberto(false)}>
            <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h2 className="dash-modal-title">Detalhes de Vendas</h2>
                <button className="dash-modal-close" onClick={() => setModalDetalhesVendasAberto(false)}>×</button>
              </div>

              <div className="gf-tab-bar">
                <button className={`gf-tab-btn ${abaAtiva === "processamento" ? "active" : ""}`} onClick={() => setAbaAtiva("processamento")}>
                  Processamento
                </button>
                <button className={`gf-tab-btn ${abaAtiva === "canceladas" ? "active" : ""}`} onClick={() => setAbaAtiva("canceladas")}>
                  Canceladas
                </button>
                <button className={`gf-tab-btn ${abaAtiva === "taxa" ? "active" : ""}`} onClick={() => setAbaAtiva("taxa")}>
                  Taxa da Plataforma
                </button>
              </div>

              {abaAtiva === "processamento" && (
                <>
                  <div className="gf-modal-total-label">Total</div>
                  <div className="gf-modal-total-value">{formatBRL(vendasProcessamento)}</div>
                  {overviewPendente?.ultimos_pagamentos?.length > 0 ? (
                    <PaymentMiniTable pagamentos={overviewPendente.ultimos_pagamentos} />
                  ) : (
                    <EmptyState titulo="Nenhuma venda em processamento encontrada." compact />
                  )}
                </>
              )}

              {abaAtiva === "canceladas" && (
                <>
                  <div className="gf-modal-total-label">Total</div>
                  <div className="gf-modal-total-value">{formatBRL(vendasCanceladas)}</div>
                  {overviewCancelado?.ultimos_pagamentos?.length > 0 ? (
                    <PaymentMiniTable pagamentos={overviewCancelado.ultimos_pagamentos} />
                  ) : (
                    <EmptyState titulo="Nenhuma venda cancelada encontrada." compact />
                  )}
                </>
              )}

              {abaAtiva === "taxa" && (
                <>
                  <div className="gf-modal-total-label">Taxa em {labelMesAtual}</div>
                  <div className="gf-modal-total-value">{formatBRL(taxaMensal)}</div>
                  {pagamentosMes.length > 0 ? (
                    <PaymentMiniTable pagamentos={pagamentosMes} showTaxa />
                  ) : (
                    <EmptyState titulo={`Nenhuma transação em ${labelMesAtual}.`} compact />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal: Solicitar Repasse */}
        {modalSolicitarRepasseAberto && (
          <div className="dash-modal-overlay" onClick={() => !solicitandoRepasse && setModalSolicitarRepasseAberto(false)}>
            <div className="dash-modal dash-modal--md" onClick={(e) => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h2 className="dash-modal-title">Solicitar Repasse</h2>
                <button className="dash-modal-close" onClick={() => !solicitandoRepasse && setModalSolicitarRepasseAberto(false)} disabled={solicitandoRepasse}>×</button>
              </div>

              <div className="gf-form-col">
                <div>
                  <div className="gf-repasse-field-label">Valor Disponível</div>
                  <div className="gf-repasse-field-value" style={{ color: "var(--color-brand)" }}>{formatBRL(totalAReceber)}</div>
                </div>

                <div>
                  <label className="gf-form-label">Valor do Repasse *</label>
                  <input
                    className="gf-form-input"
                    type="text"
                    value={valorRepasse ? `R$ ${valorRepasse}` : ""}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    disabled={solicitandoRepasse}
                  />
                  <div className="gf-form-hint">Valor máximo: {formatBRL(totalAReceber)}</div>
                </div>

                <div className="gf-pix-box">
                  <div className="gf-pix-box-title">Conta para Recebimento</div>
                  <div className="gf-pix-box-row"><strong>Titular:</strong> {nomeTitular || "—"}</div>
                  <div className="gf-pix-box-row"><strong>Chave PIX:</strong> {chavePix || "Não configurada"}</div>
                  {!chavePix && (
                    <div className="gf-pix-warning">Configure a chave PIX nas configurações antes de solicitar um repasse.</div>
                  )}
                </div>

                <div className="gf-modal-btn-row">
                  <button className="gf-modal-btn gf-modal-btn--cancel" onClick={() => setModalSolicitarRepasseAberto(false)} disabled={solicitandoRepasse}>
                    Cancelar
                  </button>
                  <button
                    className="gf-modal-btn gf-modal-btn--confirm"
                    onClick={confirmarSolicitacaoRepasse}
                    disabled={solicitandoRepasse || !valorRepasse || getValorNumerico(valorRepasse) <= 0 || !chavePix}
                  >
                    {solicitandoRepasse ? "Solicitando..." : "Confirmar Solicitação"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Sucesso Repasse */}
        {modalSucessoRepasseAberto && (
          <div className="dash-modal-overlay dash-modal-overlay--top" onClick={() => setModalSucessoRepasseAberto(false)}>
            <div className="dash-modal dash-modal--md" onClick={(e) => e.stopPropagation()}>
              <div className="gf-success-modal">
                <div className="gf-success-icon"><IconCheckStroke /></div>
                <h3 className="gf-success-title">Solicitação Enviada com Sucesso!</h3>
                <p className="gf-success-text">
                  Sua solicitação de repasse foi enviada e será aprovada em até <strong style={{ color: "var(--color-text)" }}>1 dia útil</strong>.
                </p>
                <button className="gf-success-btn" onClick={() => setModalSucessoRepasseAberto(false)}>Entendi</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Detalhes Total a Receber / Total Recebido */}
        {modalDetalhesTotalAberto && (
          <div className="dash-modal-overlay" onClick={() => setModalDetalhesTotalAberto(false)}>
            <div className="dash-modal dash-modal--lg" style={{ display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
              <div className="dash-modal-header">
                <div>
                  <h3 className="dash-modal-title">
                    {tipoDetalhesTotal === "receber" ? "Detalhes - Total a Receber" : "Detalhes - Total Recebido"}
                  </h3>
                  <p className="dash-modal-subtitle">
                    {tipoDetalhesTotal === "receber"
                      ? "Valores disponíveis para solicitar repasse"
                      : "Histórico de valores já recebidos"}
                  </p>
                </div>
                <button className="dash-modal-close" onClick={() => setModalDetalhesTotalAberto(false)}>×</button>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {tipoDetalhesTotal === "receber" ? (
                  <div>
                    <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600, color: "var(--color-text)", marginBottom: "var(--space-lg)" }}>
                      Reservas por Dia
                    </h4>

                    {reservasPorDia.length > 0 ? (
                      <div className="gf-detail-list">
                        {reservasPorDia.map((reserva, index) => (
                          <div key={index} className="gf-detail-list-item">
                            <div>
                              <div className="gf-detail-list-date">{formatDateBR(reserva.data.toISOString())}</div>
                              <div className="gf-detail-list-desc">Reservas do dia</div>
                            </div>
                            <div className="gf-detail-list-value">{formatBRL(reserva.valor)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState titulo="Nenhuma reserva encontrada." compact />
                    )}

                    {overviewPendente?.kpis && (
                      <div className="gf-resume-box gf-resume-box--blue">
                        <h4>Resumo e Descontos</h4>

                        <div className="gf-resume-row">
                          <div className="gf-resume-row-label">Receita Bruta Total</div>
                          <div className="gf-resume-row-value">{formatBRL(overviewPendente.kpis.receita_bruta)}</div>
                        </div>
                        <div className="gf-resume-hint">Soma de todas as reservas dos dias acima</div>

                        <div className="gf-deduction gf-deduction--red" style={{ marginTop: "var(--space-lg)" }}>
                          <div className="gf-resume-row" style={{ marginBottom: "var(--space-xs)" }}>
                            <div className="gf-deduction-label">Taxa da Plataforma</div>
                            <div className="gf-deduction-value">- {formatBRL(overviewPendente.kpis.taxa_plataforma)}</div>
                          </div>
                          <div className="gf-deduction-hint">Desconto aplicado sobre a receita bruta</div>
                        </div>

                        {overviewCancelado?.kpis?.receita_bruta > 0 && (
                          <div className="gf-deduction gf-deduction--yellow">
                            <div className="gf-resume-row" style={{ marginBottom: "var(--space-xs)" }}>
                              <div className="gf-deduction-label">Cancelamentos</div>
                              <div className="gf-deduction-value">- {formatBRL(overviewCancelado.kpis.receita_bruta)}</div>
                            </div>
                            <div className="gf-deduction-hint">Valor das reservas canceladas</div>
                          </div>
                        )}

                        <div className="gf-total-divider">
                          <div className="gf-resume-row">
                            <div className="gf-total-label">Valor Líquido Disponível</div>
                            <div className="gf-total-value">{formatBRL(overviewPendente.kpis.valor_liquido)}</div>
                          </div>
                          <div className="gf-resume-hint" style={{ marginTop: "var(--space-sm)" }}>
                            Este é o valor que você pode solicitar para repasse
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600, color: "var(--color-text)", marginBottom: "var(--space-lg)" }}>
                      Histórico de Transações Concluídas
                    </h4>

                    {transacoesConcluidas.length > 0 ? (
                      <div className="gf-detail-list">
                        {transacoesConcluidas.map((transacao) => (
                          <div key={transacao.id} className="gf-detail-list-item">
                            <div style={{ flex: 1 }}>
                              <div className="gf-detail-list-date">{formatDateBR(transacao.data.toISOString())}</div>
                              <div className="gf-detail-list-desc">{transacao.descricao}</div>
                            </div>
                            <div className="gf-detail-list-value">{formatBRL(transacao.valor)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState titulo="Nenhuma transação encontrada." compact />
                    )}

                    <div className="gf-resume-box gf-resume-box--green">
                      <h4>Resumo</h4>
                      <div className="gf-total-divider">
                        <div className="gf-resume-row">
                          <div className="gf-total-label">Valor Total Recebido</div>
                          <div className="gf-total-value">{formatBRL(totalRecebido)}</div>
                        </div>
                        <div className="gf-resume-hint" style={{ marginTop: "var(--space-sm)" }}>
                          Total já recebido em todas as transações concluídas
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="gf-modal-footer">
                <button className="btn-brand" onClick={() => setModalDetalhesTotalAberto(false)}>Fechar</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
