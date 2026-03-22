import { useState } from "react";
import { EmptyState } from "../ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import { formatarMoeda as formatBRL } from "../../utils/formatters";
import PaymentMiniTable from "../gestor/PaymentMiniTable";

const ModalDetalhesVendas = ({
  aberto,
  onFechar,
  overviewPendente,
  overviewCancelado,
  vendasProcessamento,
  vendasCanceladas,
  taxaMensal,
  labelMesAtual,
  pagamentosMes,
}) => {
  const ref = useFocusTrap(aberto, onFechar);
  const [abaAtiva, setAbaAtiva] = useState("processamento");

  if (!aberto) return null;

  return (
    <div className="dash-modal-overlay" onClick={onFechar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gf-modal-vendas-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-header">
          <h2 id="gf-modal-vendas-titulo" className="dash-modal-title">Detalhes de Vendas</h2>
          <button type="button" className="dash-modal-close" aria-label="Fechar modal" onClick={onFechar}>×</button>
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
  );
};

export default ModalDetalhesVendas;
