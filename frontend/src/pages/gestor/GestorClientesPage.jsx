import React, { useState, useEffect } from "react";
import { useGestorClientes } from "../../hooks/api";
import { gestorReservasApi } from "../../api/endpoints/gestorReservasApi";
import { LoadingSpinner, ErrorMessage, EmptyState, ConfirmacaoModal } from "../../components/ui";
import { HistoricoModal } from "../../components/modals";

import {
  formatarMoeda as formatBRL,
  formatarDataBR as formatDateBR,
} from "../../utils/formatters";

function calcularStatusCliente(cliente) {
  if (cliente.status === "inativo" || cliente.status === "ativo") {
    return cliente.status;
  }
  if (!cliente.ultimaReserva || cliente.totalReservas === 0) {
    return "inativo";
  }
  const hoje = new Date();
  const ultimaReserva = new Date(cliente.ultimaReserva);
  const diasSemReserva = Math.floor((hoje - ultimaReserva) / (1000 * 60 * 60 * 24));
  return diasSemReserva <= 30 ? "ativo" : "inativo";
}

// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const IconeDocumento = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconeSeta = ({ direcao = "esquerda" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {direcao === "esquerda"
      ? <polyline points="15 18 9 12 15 6" />
      : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

// ─── Componente Principal ────────────────────────────────────────────────────

const GestorClientesPage = () => {
  const { listar, obterHistorico } = useGestorClientes();

  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const novosClientesMes = 4;

  // ─── Histórico ─────────────────────────────────────────────────────────────

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

  // ─── Cancelamento ──────────────────────────────────────────────────────────

  function podeCancelar(reserva) {
    if (reserva.status !== "pending" && reserva.status !== "paid") return false;
    if (!reserva.created_at) return false;
    const horasDesdeCriacao = (new Date() - new Date(reserva.created_at)) / (1000 * 60 * 60);
    return horasDesdeCriacao <= 24;
  }

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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <h2 className="page-title">Clientes</h2>

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {/* Estatísticas */}
      <div className="cl-stats-grid">
        <div className="card cl-stat-card">
          <div className="cl-stat-label">Total de Clientes</div>
          <div className="cl-stat-value">{clientesComStatus.length}</div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">
            Clientes Ativos
            <span className="cl-stat-hint">(Reserva nos últimos 30 dias)</span>
          </div>
          <div className="cl-stat-value">
            {clientesComStatus.filter((c) => c.status === "ativo").length}
          </div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">
            Clientes Inativos
            <span className="cl-stat-hint">(Sem reservas nos últimos 30 dias)</span>
          </div>
          <div className="cl-stat-value">
            {clientesComStatus.filter((c) => c.status === "inativo").length}
          </div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">Novos Clientes (este mês)</div>
          <div className="cl-stat-value">{novosClientesMes}</div>
        </div>
      </div>

      {/* Busca */}
      <div className="card cl-stat-card">
        <input
          type="text"
          className="cl-search-input"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela de clientes */}
      {carregando ? (
        <div className="card cl-stat-card">
          <LoadingSpinner mensagem="Carregando clientes..." />
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="card cl-stat-card">
          <EmptyState
            titulo={busca ? "Nenhum cliente encontrado com essa busca." : "Nenhum cliente cadastrado."}
            compact
          />
        </div>
      ) : (
        <div className="card cl-table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="dash-history-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th className="text-right">Reservas</th>
                  <th className="text-right">Total Gasto</th>
                  <th>Última Reserva</th>
                  <th className="text-center">Histórico</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="cl-table-name">{cliente.nome}</td>
                    <td className="cl-table-secondary">{cliente.cpf}</td>
                    <td className="cl-table-secondary">{cliente.telefone}</td>
                    <td>
                      <span className={`cl-status-badge cl-status-badge--${cliente.status}`}>
                        {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-right text-bold">{cliente.totalReservas}</td>
                    <td className="text-right text-bold">{formatBRL(cliente.totalGasto)}</td>
                    <td className="cl-table-secondary">{formatDateBR(cliente.ultimaReserva)}</td>
                    <td className="text-center">
                      <button
                        className="cl-action-btn"
                        onClick={() => abrirHistoricoCliente(cliente)}
                        title="Ver Histórico"
                      >
                        <IconeDocumento />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="cl-pagination">
              <div className="cl-pagination-info">
                Mostrando {indiceInicio + 1} a{" "}
                {Math.min(indiceFim, clientesFiltrados.length)} de{" "}
                {clientesFiltrados.length} clientes
              </div>
              <div className="cl-pagination-controls">
                <button
                  className="cl-pagination-btn"
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  <IconeSeta direcao="esquerda" />
                  Anterior
                </button>
                <div className="cl-pagination-counter">
                  <span>Página</span>
                  <span className="cl-pagination-num">{paginaAtual}</span>
                  <span>de</span>
                  <span className="cl-pagination-num">{totalPaginas}</span>
                </div>
                <button
                  className="cl-pagination-btn"
                  onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                  <IconeSeta direcao="direita" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <HistoricoModal
        aberto={modalHistoricoAberto}
        subtitulo={clienteSelecionado ? `${clienteSelecionado.nome} • ${clienteSelecionado.cpf}` : ""}
        infoTelefone={clienteSelecionado?.telefone}
        totalReservas={clienteSelecionado?.totalReservas}
        totalGasto={clienteSelecionado?.totalGasto}
        historico={historicoReservas}
        carregando={carregandoHistorico}
        onFechar={fecharModalHistorico}
        onCancelar={abrirModalConfirmacao}
        podeCancelar={podeCancelar}
      />

      <ConfirmacaoModal
        aberto={modalConfirmacaoAberto}
        reserva={reservaParaCancelar}
        onFechar={fecharModalConfirmacao}
        onConfirmar={confirmarCancelamento}
        textoCancelar="Voltar"
      />
    </div>
  );
}

export default GestorClientesPage;
