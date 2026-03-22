import { formatarMoeda as formatBRL, formatarDataBR as formatDateBR } from "../../utils/formatters";
import { statusLabelReserva, statusPaymentClass } from "../../utils/status";

const PaymentMiniTable = ({ pagamentos, showTaxa }) => {
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
                  {statusLabelReserva(p.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentMiniTable;
