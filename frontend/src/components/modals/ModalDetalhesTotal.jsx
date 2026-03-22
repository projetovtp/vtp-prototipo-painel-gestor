import { EmptyState } from "../ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarMoeda as formatBRL,
  formatarDataBR as formatDateBR,
} from "../../utils/formatters";

const ModalDetalhesTotal = ({
  aberto,
  onFechar,
  tipo,
  reservasPorDia,
  transacoesConcluidas,
  overviewPendente,
  overviewCancelado,
  totalRecebido,
}) => {
  const ref = useFocusTrap(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div className="dash-modal-overlay" onClick={onFechar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gf-modal-total-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--lg gf-modal-flex"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-header">
          <div>
            <h3 id="gf-modal-total-titulo" className="dash-modal-title">
              {tipo === "receber" ? "Detalhes - Total a Receber" : "Detalhes - Total Recebido"}
            </h3>
            <p className="dash-modal-subtitle">
              {tipo === "receber"
                ? "Valores disponíveis para solicitar repasse"
                : "Histórico de valores já recebidos"}
            </p>
          </div>
          <button type="button" className="dash-modal-close" aria-label="Fechar modal" onClick={onFechar}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {tipo === "receber" ? (
            <div>
              <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600, color: "var(--color-text)", marginBottom: "var(--space-lg)" }}>
                Reservas por Dia
              </h4>

              {reservasPorDia.length > 0 ? (
                <div className="gf-detail-list">
                  {reservasPorDia.map((reserva, index) => (
                    <div key={index} className="gf-detail-list-item">
                      <div>
                        <div className="gf-detail-list-date">
                          {formatDateBR(reserva.data instanceof Date ? reserva.data.toISOString() : reserva.data)}
                        </div>
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
                        <div className="gf-detail-list-date">
                          {formatDateBR(transacao.data instanceof Date ? transacao.data.toISOString() : transacao.data)}
                        </div>
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
          <button className="btn-brand" onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhesTotal;
