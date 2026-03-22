import { LoadingSpinner, EmptyState } from "../ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarMoeda as formatBRL,
  formatarDataBR as formatDateBR,
} from "../../utils/formatters";
import { statusRepasseLabel } from "../../utils/status";
import PaymentMiniTable from "../gestor/PaymentMiniTable";

const ModalDetalhesRepasse = ({ aberto, onFechar, carregando, detalhes }) => {
  const ref = useFocusTrap(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div className="dash-modal-overlay" onClick={onFechar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gf-modal-repasse-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-header">
          <h2 id="gf-modal-repasse-titulo" className="dash-modal-title">Detalhes do Repasse</h2>
          <button type="button" className="dash-modal-close" aria-label="Fechar modal" onClick={onFechar}>×</button>
        </div>

        {carregando ? (
          <LoadingSpinner mensagem="Carregando detalhes..." tamanho={24} />
        ) : detalhes ? (
          <div>
            <div className="gf-repasse-field">
              <div className="gf-repasse-field-label">Valor Total Repassado</div>
              <div className="gf-repasse-field-value">{formatBRL(detalhes.repasse?.valor_total_liquido || 0)}</div>
            </div>
            <div className="gf-repasse-field">
              <div className="gf-repasse-field-label">Data do Repasse</div>
              <div className="gf-repasse-field-value gf-repasse-field-value--sm">
                {detalhes.repasse?.data_pagamento ? formatDateBR(detalhes.repasse.data_pagamento) : "—"}
              </div>
            </div>
            <div className="gf-repasse-field">
              <div className="gf-repasse-field-label">Status</div>
              <div className="gf-repasse-field-value gf-repasse-field-value--sm">
                {statusRepasseLabel(detalhes.repasse?.status) || "—"}
              </div>
            </div>

            {detalhes.pagamentos?.length > 0 && (
              <div>
                <h3 className="gf-repasse-detail-title">Agendamentos Incluídos</h3>
                <PaymentMiniTable pagamentos={detalhes.pagamentos} />
              </div>
            )}
          </div>
        ) : (
          <EmptyState titulo="Erro ao carregar detalhes do repasse." compact />
        )}
      </div>
    </div>
  );
};

export default ModalDetalhesRepasse;
