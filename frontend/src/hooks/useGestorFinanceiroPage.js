import { useEffect, useState, useCallback, useMemo } from "react";
import { useGestorFinanceiro } from "./api";
import { formatarMoeda as formatBRL } from "../utils/formatters";
import { MESES } from "../utils/constants";

const ITENS_POR_PAGINA = 10;

const useGestorFinanceiroPage = () => {
    const {
        obterOverview,
        listarRepasses,
        obterReservasPorDia,
        listarTransacoes,
        obterDadosBancarios,
        obterDetalheRepasse,
        solicitarRepasse,
      } = useGestorFinanceiro();

  const [overviewTotal, setOverviewTotal] = useState(null);
  const [overviewPendente, setOverviewPendente] = useState(null);
  const [overviewCancelado, setOverviewCancelado] = useState(null);
  const [repasses, setRepasses] = useState([]);
  const [nomeTitular, setNomeTitular] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [pagina, setPagina] = useState(1);

  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [detalhesRepasse, setDetalhesRepasse] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const [modalDetalhesVendasAberto, setModalDetalhesVendasAberto] = useState(false);

  const [modalDetalhesTotalAberto, setModalDetalhesTotalAberto] = useState(false);
  const [tipoDetalhesTotal, setTipoDetalhesTotal] = useState("");
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [transacoesConcluidas, setTransacoesConcluidas] = useState([]);

  const [modalSolicitarRepasseAberto, setModalSolicitarRepasseAberto] = useState(false);
  const [chavePix, setChavePix] = useState("");
  const [solicitandoRepasse, setSolicitandoRepasse] = useState(false);
  const [modalSucessoRepasseAberto, setModalSucessoRepasseAberto] = useState(false);

  // --- Derivados ---

  const kpisTotal = overviewTotal?.kpis || {};
  const kpisPendente = overviewPendente?.kpis || {};
  const kpisCancelado = overviewCancelado?.kpis || {};

  const totalAReceber = kpisPendente?.valor_liquido || 0;
  const totalRecebido = kpisTotal?.valor_liquido || 0;
  const vendasProcessamento = kpisPendente?.receita_bruta || 0;
  const vendasCanceladas = kpisCancelado?.receita_bruta || 0;

  const pagamentosPagos = useMemo(
    () => overviewTotal?.ultimos_pagamentos || [],
    [overviewTotal],
  );

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

  const totalPaginas = Math.max(1, Math.ceil(repasses.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const repassesPaginados = repasses.slice(
    (paginaSegura - 1) * ITENS_POR_PAGINA,
    paginaSegura * ITENS_POR_PAGINA,
  );

  // --- Ações ---

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [overviewData, repassesData, reservasDia, transacoesData, bancarios] =
        await Promise.allSettled([
          obterOverview(),
          listarRepasses(),
          obterReservasPorDia(),
          listarTransacoes(),
          obterDadosBancarios(),
        ]);

      if (overviewData.status === "fulfilled" && overviewData.value) {
        const ov = overviewData.value;
        setOverviewTotal(ov.total || ov);
        setOverviewPendente(ov.pendente || null);
        setOverviewCancelado(ov.cancelado || null);
      }
      if (repassesData.status === "fulfilled")
        setRepasses(Array.isArray(repassesData.value) ? repassesData.value : []);
      if (reservasDia.status === "fulfilled")
        setReservasPorDia(Array.isArray(reservasDia.value) ? reservasDia.value : []);
      if (transacoesData.status === "fulfilled")
        setTransacoesConcluidas(Array.isArray(transacoesData.value) ? transacoesData.value : []);
      if (bancarios.status === "fulfilled" && bancarios.value) {
        setNomeTitular(bancarios.value.nomeTitular || "");
        setChavePix(bancarios.value.chavePix || "");
      }
    } finally {
      setLoading(false);
    }
  }, [obterOverview, listarRepasses, obterReservasPorDia, listarTransacoes, obterDadosBancarios]);

  const abrirDetalhesRepasse = useCallback(
    async (repasse) => {
      setModalDetalhesAberto(true);
      setCarregandoDetalhes(true);
      try {
        const data = await obterDetalheRepasse(repasse.id);
        setDetalhesRepasse(data);
      } catch {
        setDetalhesRepasse(null);
      } finally {
        setCarregandoDetalhes(false);
      }
    },
    [obterDetalheRepasse],
  );


  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function confirmarSolicitacaoRepasse(valor) {
    if (valor <= 0) {
      setErro("Por favor, informe um valor válido.");
      return;
    }
    if (valor > totalAReceber) {
      setErro(`O valor não pode ser maior que ${formatBRL(totalAReceber)}.`);
      return;
    }
    if (!chavePix) {
      setErro("Por favor, configure a chave PIX nas configurações antes de solicitar um repasse.");
      return;
    }

    setSolicitandoRepasse(true);
    try {
      await solicitarRepasse({ valor, chave_pix: chavePix });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setModalSolicitarRepasseAberto(false);
    setModalSucessoRepasseAberto(true);
    setSolicitandoRepasse(false);
    carregarDados();
  }

  return {
    // Estado
    loading,
    erro,
    setErro,

    // Dados
    overviewPendente,
    overviewCancelado,
    nomeTitular,
    totalAReceber,
    totalRecebido,
    vendasProcessamento,
    vendasCanceladas,
    taxaMensal,
    pagamentosMes,
    labelMesAtual,

    // Tabela + paginação
    repasses,
    repassesPaginados,
    pagina,
    setPagina,
    paginaSegura,
    totalPaginas,

    // Modal Detalhes Repasse
    modalDetalhesAberto,
    setModalDetalhesAberto,
    detalhesRepasse,
    carregandoDetalhes,
    abrirDetalhesRepasse,

    // Modal Detalhes Vendas
    modalDetalhesVendasAberto,
    setModalDetalhesVendasAberto,

    // Modal Detalhes Total
    modalDetalhesTotalAberto,
    setModalDetalhesTotalAberto,
    tipoDetalhesTotal,
    setTipoDetalhesTotal,
    reservasPorDia,
    transacoesConcluidas,

    // Modal Solicitar Repasse
    modalSolicitarRepasseAberto,
    setModalSolicitarRepasseAberto,
    chavePix,
    solicitandoRepasse,
    confirmarSolicitacaoRepasse,

    // Modal Sucesso
    modalSucessoRepasseAberto,
    setModalSucessoRepasseAberto,
  };
};

export default useGestorFinanceiroPage;
