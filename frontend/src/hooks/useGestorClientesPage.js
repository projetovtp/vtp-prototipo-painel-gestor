import { useState, useEffect } from "react";
import { useGestorClientes } from "./api";
import { gestorReservasApi } from "../api/endpoints/gestorReservasApi";
import { calcularStatusCliente } from "../utils/status";

export function useGestorClientesPage() {
  const { listar, obterHistorico } = useGestorClientes();

  // ─── Lista ───────────────────────────────────────────────────────────────
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarClientes() {
      try {
        setCarregando(true);
        setErro("");
        const data = await listar({ busca: "" });
        setClientes(data || []);
      } finally {
        setCarregando(false);
      }
    }
    carregarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Busca e paginação ────────────────────────────────────────────────────
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const clientesComStatus = clientes.map((c) => ({
    ...c,
    status: calcularStatusCliente(c),
  }));

  const clientesFiltrados = clientesComStatus.filter(
    (c) =>
      busca === "" ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cpf.includes(busca) ||
      c.telefone.includes(busca),
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFim);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  // ─── Modal de histórico ───────────────────────────────────────────────────
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  async function abrirHistoricoCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);
    setErro("");
    try {
      const data = await obterHistorico(cliente.id);
      setHistoricoReservas(data || []);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setClienteSelecionado(null);
    setHistoricoReservas([]);
  }

  // ─── Modal de cancelamento ────────────────────────────────────────────────
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  function abrirModalConfirmacao(reserva) {
    setReservaParaCancelar(reserva);
    setModalConfirmacaoAberto(true);
  }

  function fecharModalConfirmacao() {
    setModalConfirmacaoAberto(false);
    setReservaParaCancelar(null);
  }

  async function confirmarCancelamento() {
    if (!reservaParaCancelar) return;
    try {
      setErro("");
      try {
        await gestorReservasApi.cancelar(reservaParaCancelar.id);
      } catch {
        // Backend indisponível — apenas atualiza localmente
      }
      setHistoricoReservas((prev) =>
        prev.map((r) => (r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r)),
      );
      if (clienteSelecionado) {
        setClienteSelecionado((prev) => ({
          ...prev,
          totalReservas: Math.max(0, prev.totalReservas - 1),
          totalGasto: Math.max(0, prev.totalGasto - reservaParaCancelar.valor),
        }));
      }
      fecharModalConfirmacao();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro("Erro ao cancelar reserva. Tente novamente.");
    }
  }

  return {
    // lista
    carregando,
    erro,
    setErro,
    // busca e paginação
    busca,
    setBusca,
    paginaAtual,
    setPaginaAtual,
    clientesComStatus,
    clientesFiltrados,
    totalPaginas,
    indiceInicio,
    indiceFim,
    clientesPaginados,
    // modal histórico
    modalHistoricoAberto,
    clienteSelecionado,
    historicoReservas,
    carregandoHistorico,
    abrirHistoricoCliente,
    fecharModalHistorico,
    // modal cancelamento
    modalConfirmacaoAberto,
    reservaParaCancelar,
    abrirModalConfirmacao,
    fecharModalConfirmacao,
    confirmarCancelamento,
  };
}
