import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/ui";

import {
  formatarMoeda as formatBRL,
  formatarDataBR as formatDateBR,
} from "../../utils/formatters";
import { statusRepasseLabel, statusRepasseClass } from "../../utils/status";

import IconCheck from "../../components/icons/IconCheck";
import IconCancel from "../../components/icons/IconCancel";
import IconClock from "../../components/icons/IconClock";
import IconDollar from "../../components/icons/IconDollar";

import ModalDetalhesRepasse from "../../components/modals/ModalDetalhesRepasse";
import ModalDetalhesVendas from "../../components/modals/ModalDetalhesVendas";
import ModalSolicitarRepasse from "../../components/modals/ModalSolicitarRepasse";
import ModalSucessoRepasse from "../../components/modals/ModalSucessoRepasse";
import ModalDetalhesTotal from "../../components/modals/ModalDetalhesTotal";

import useGestorFinanceiroPage from "../../hooks/useGestorFinanceiroPage";

const GestorFinanceiroPage = () => {
  const {
    loading,
    erro,
    setErro,
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
    repasses,
    repassesPaginados,
    setPagina,
    paginaSegura,
    totalPaginas,
    modalDetalhesAberto,
    setModalDetalhesAberto,
    detalhesRepasse,
    carregandoDetalhes,
    abrirDetalhesRepasse,
    modalDetalhesVendasAberto,
    setModalDetalhesVendasAberto,
    modalDetalhesTotalAberto,
    setModalDetalhesTotalAberto,
    tipoDetalhesTotal,
    setTipoDetalhesTotal,
    reservasPorDia,
    transacoesConcluidas,
    modalSolicitarRepasseAberto,
    setModalSolicitarRepasseAberto,
    chavePix,
    solicitandoRepasse,
    confirmarSolicitacaoRepasse,
    modalSucessoRepasseAberto,
    setModalSucessoRepasseAberto,
  } = useGestorFinanceiroPage();

  return (
    <div className="page">
      <div style={{ marginBottom: "var(--space-sm)" }}>
        <h1 className="page-title">Financeiro</h1>
        <p
          style={{
            fontSize: "var(--font-base)",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-xs)",
          }}
        >
          Gerencie suas finanças e acompanhe seus repasses
        </p>
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
                <button
                  className="gf-summary-btn"
                  onClick={() => {
                    setTipoDetalhesTotal("receber");
                    setModalDetalhesTotalAberto(true);
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
              <div className="gf-summary-value">
                {loading ? "..." : formatBRL(totalAReceber)}
              </div>
              <div className="gf-summary-hint">
                Valor disponível para solicitar repasse
              </div>
            </div>
          </div>

          <div className="gf-summary-card gf-summary-card--green">
            <div className="gf-summary-circle" />
            <div className="gf-summary-inner">
              <div className="gf-summary-top">
                <div className="gf-summary-label">Total Recebido</div>
                <button
                  className="gf-summary-btn"
                  onClick={() => {
                    setTipoDetalhesTotal("recebido");
                    setModalDetalhesTotalAberto(true);
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
              <div className="gf-summary-value">
                {loading ? "..." : formatBRL(totalRecebido)}
              </div>
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
          <button
            className="gf-repasse-btn"
            onClick={() => setModalSolicitarRepasseAberto(true)}
            disabled={loading || totalAReceber <= 0}
            type="button"
          >
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
            <p className="gf-stats-subtitle">
              Acompanhe o desempenho das suas vendas
            </p>
          </div>
          <button
            className="gf-stats-detail-btn"
            onClick={() => setModalDetalhesVendasAberto(true)}
          >
            Ver Detalhes
          </button>
        </div>

        <div className="gf-stats-grid">
          <div className="gf-stat-card gf-stat-card--yellow">
            <div className="gf-stat-top">
              <div className="gf-stat-label">Vendas em Processamento</div>
              <div className="gf-stat-icon gf-stat-icon--yellow">
                <IconClock size={22} />
              </div>
            </div>
            <div className="gf-stat-value">
              {loading ? "..." : formatBRL(vendasProcessamento)}
            </div>
            <div className="gf-stat-hint">
              Aguardando confirmação de pagamento
            </div>
          </div>

          <div className="gf-stat-card gf-stat-card--red">
            <div className="gf-stat-top">
              <div className="gf-stat-label">Vendas Canceladas</div>
              <div className="gf-stat-icon gf-stat-icon--red">
                <IconCancel />
              </div>
            </div>
            <div className="gf-stat-value">
              {loading ? "..." : formatBRL(vendasCanceladas)}
            </div>
            <div className="gf-stat-hint">
              Reservas canceladas pelos clientes
            </div>
          </div>

          <div className="gf-stat-card gf-stat-card--purple">
            <div className="gf-stat-top">
              <div className="gf-stat-label">Taxa da Plataforma</div>
              <div className="gf-stat-icon gf-stat-icon--purple">
                <IconDollar size={22} />
              </div>
            </div>
            <div className="gf-stat-value">
              {loading ? "..." : formatBRL(taxaMensal)}
            </div>
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
              {repasses.length}{" "}
              {repasses.length === 1 ? "transação" : "transações"}
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
                          <td className="gf-cell-bold">
                            {formatBRL(repasse.valor_total_liquido || 0)}
                          </td>
                          <td>{repasse.nome_titular || nomeTitular || "—"}</td>
                          <td>
                            {repasse.data_pagamento
                              ? formatDateBR(repasse.data_pagamento)
                              : repasse.created_at
                                ? formatDateBR(repasse.created_at)
                                : "—"}
                          </td>
                          <td>
                            <span className={`gf-badge gf-badge--${cls}`}>
                              <span className="gf-badge-dot" />
                              {statusRepasseLabel(repasse.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="gf-detail-btn"
                              onClick={() => abrirDetalhesRepasse(repasse)}
                            >
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
                  <button
                    className="gf-page-btn"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaSegura <= 1}
                  >
                    Anterior
                  </button>
                  <div className="gf-pagination-info">
                    Página {paginaSegura} de {totalPaginas}
                  </div>
                  <button
                    className="gf-page-btn"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaSegura >= totalPaginas}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ModalDetalhesRepasse
        aberto={modalDetalhesAberto}
        onFechar={() => setModalDetalhesAberto(false)}
        carregando={carregandoDetalhes}
        detalhes={detalhesRepasse}
      />

      <ModalDetalhesVendas
        aberto={modalDetalhesVendasAberto}
        onFechar={() => setModalDetalhesVendasAberto(false)}
        overviewPendente={overviewPendente}
        overviewCancelado={overviewCancelado}
        vendasProcessamento={vendasProcessamento}
        vendasCanceladas={vendasCanceladas}
        taxaMensal={taxaMensal}
        labelMesAtual={labelMesAtual}
        pagamentosMes={pagamentosMes}
      />

      <ModalSolicitarRepasse
        aberto={modalSolicitarRepasseAberto}
        onFechar={() => !solicitandoRepasse && setModalSolicitarRepasseAberto(false)}
        totalAReceber={totalAReceber}
        nomeTitular={nomeTitular}
        chavePix={chavePix}
        solicitando={solicitandoRepasse}
        onConfirmar={confirmarSolicitacaoRepasse}
      />

      <ModalSucessoRepasse
        aberto={modalSucessoRepasseAberto}
        onFechar={() => setModalSucessoRepasseAberto(false)}
      />

      <ModalDetalhesTotal
        aberto={modalDetalhesTotalAberto}
        onFechar={() => setModalDetalhesTotalAberto(false)}
        tipo={tipoDetalhesTotal}
        reservasPorDia={reservasPorDia}
        transacoesConcluidas={transacoesConcluidas}
        overviewPendente={overviewPendente}
        overviewCancelado={overviewCancelado}
        totalRecebido={totalRecebido}
      />
    </div>
  );
};

export default GestorFinanceiroPage;
