import React from "react";
import PropTypes from "prop-types";
import { LoadingSpinner, EmptyState } from "../../components/ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarMoeda,
  formatarDataBR,
  formatarHoraStr,
  formatarStatus,
} from "../../utils/formatters";

/**
 * Modal de histórico de reservas de um cliente/contato.
 *
 * Props:
 *  - aberto: bool
 *  - subtitulo: string — ex: "João Silva • (11) 99999-9999" ou "João Silva • 000.000.000-00"
 *  - infoTelefone: string — exibido na caixa de informações
 *  - totalReservas: number (opcional) — se omitido, usa historico.length
 *  - totalGasto: number (opcional) — se omitido, calculado a partir de historico
 *  - historico: array de reservas
 *  - carregando: bool
 *  - onFechar: fn
 *  - onCancelar: fn(reserva) — chamada quando o usuário clica em "Cancelar" numa reserva
 *  - podeCancelar: fn(reserva) => bool
 */
const HistoricoModal = ({
  aberto,
  subtitulo,
  infoTelefone,
  totalReservas: totalReservasProp,
  totalGasto: totalGastoProp,
  historico = [],
  carregando,
  onFechar,
  onCancelar,
  podeCancelar,
}) => {
  const containerRef = useFocusTrap(aberto, onFechar);

  if (!aberto) return null;

  const totalReservas = totalReservasProp ?? historico.length;
  const totalGasto = totalGastoProp ?? historico.reduce((acc, r) => acc + (r.valor || 0), 0);

  return (
    <div className="dash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="historico-modal-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-header">
          <div>
            <h2 id="historico-modal-titulo" className="dash-modal-title">Histórico de Reservas</h2>
            {subtitulo && <div className="dash-modal-subtitle">{subtitulo}</div>}
          </div>
          <button type="button" onClick={onFechar} className="dash-modal-close" aria-label="Fechar modal">×</button>
        </div>

        <div className="dash-info-box">
          <div className="dash-info-grid">
            {infoTelefone && (
              <div>
                <div className="dash-info-label">Telefone</div>
                <div className="dash-info-value">{infoTelefone}</div>
              </div>
            )}
            <div>
              <div className="dash-info-label">Total de Reservas</div>
              <div className="dash-info-value">{totalReservas}</div>
            </div>
            <div>
              <div className="dash-info-label">Total Gasto</div>
              <div className="dash-info-value dash-info-value--bold">
                {formatarMoeda(totalGasto)}
              </div>
            </div>
          </div>
        </div>

        {carregando ? (
          <LoadingSpinner mensagem="Carregando histórico..." />
        ) : historico.length === 0 ? (
          <EmptyState titulo="Nenhuma reserva encontrada." compact />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dash-history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Tipo de Quadra</th>
                  <th className="text-right">Valor</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((r) => (
                  <tr key={r.id}>
                    <td>{formatarDataBR(r.data)}</td>
                    <td>{formatarHoraStr(r.hora)}</td>
                    <td>{r.tipoQuadra}</td>
                    <td className="text-right text-bold">{formatarMoeda(r.valor)}</td>
                    <td className="text-center">
                      <span className={`dash-status-tag dash-status-tag--${r.status === "paid" ? "pago" : r.status === "pending" ? "pendente" : "cancelado"}`}>
                        {formatarStatus(r.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      {podeCancelar(r) ? (
                        <button type="button" className="dash-btn-cancel-table" onClick={() => onCancelar(r)}>Cancelar</button>
                      ) : (
                        <span className="dash-expired-label">{r.status === "canceled" ? "Cancelada" : "Prazo expirado"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

HistoricoModal.propTypes = {
  aberto: PropTypes.bool.isRequired,
  subtitulo: PropTypes.string,
  infoTelefone: PropTypes.string,
  totalReservas: PropTypes.number,
  totalGasto: PropTypes.number,
  historico: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      data: PropTypes.string,
      hora: PropTypes.string,
      tipoQuadra: PropTypes.string,
      valor: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  carregando: PropTypes.bool,
  onFechar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
  podeCancelar: PropTypes.func.isRequired,
};

export default HistoricoModal;
