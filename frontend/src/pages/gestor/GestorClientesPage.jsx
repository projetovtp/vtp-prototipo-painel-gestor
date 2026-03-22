import React from "react";
import { LoadingSpinner, ErrorMessage, EmptyState, ConfirmacaoModal } from "../../components/ui";
import { HistoricoModal } from "../../components/modals";
import { podeCancelar } from "../../utils/validacoes";
import { formatarMoeda as formatBRL, formatarDataBR as formatDateBR } from "../../utils/formatters";
import IconDocument from "../../components/icons/IconDocument";
import IconChevronLeft from "../../components/icons/IconChevronLeft";
import IconChevronRight from "../../components/icons/IconChevronRight";
import { useGestorClientesPage } from "../../hooks/useGestorClientesPage";

const GestorClientesPage = () => {
  const {
    carregando, erro, setErro,
    busca, setBusca, paginaAtual, setPaginaAtual,
    clientesComStatus, clientesFiltrados,
    totalPaginas, indiceInicio, indiceFim, clientesPaginados,
    modalHistoricoAberto, clienteSelecionado, historicoReservas, carregandoHistorico,
    abrirHistoricoCliente, fecharModalHistorico,
    modalConfirmacaoAberto, reservaParaCancelar,
    abrirModalConfirmacao, fecharModalConfirmacao, confirmarCancelamento,
  } = useGestorClientesPage();

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
                        <IconDocument />
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
                  <IconChevronLeft />
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
                  <IconChevronRight />
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
};

export default GestorClientesPage;
