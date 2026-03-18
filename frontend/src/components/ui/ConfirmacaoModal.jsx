import React from "react";
import PropTypes from "prop-types";
import useFocusTrap from "../../hooks/useFocusTrap";
import { formatarDataBR, formatarHoraStr, formatarMoeda } from "../../utils/formatters";

const ConfirmacaoModal = ({
  aberto,
  titulo = "Confirmar Cancelamento",
  mensagem = "Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.",
  reserva,
  onFechar,
  onConfirmar,
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar Cancelamento",
}) => {
  const containerRef = useFocusTrap(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div
      className="dash-modal-overlay dash-modal-overlay--top"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacao-modal-titulo"
        aria-describedby="confirmacao-modal-mensagem"
        tabIndex="-1"
        className="dash-modal dash-modal--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirmacao-modal-titulo" className="dash-modal-title confirmacao-modal-titulo">{titulo}</h3>
        <p id="confirmacao-modal-mensagem" className="dash-confirm-text">{mensagem}</p>
        {reserva && (
          <div className="dash-confirm-info">
            {reserva.tipoQuadra && (
              <div className="dash-confirm-title">{reserva.tipoQuadra}</div>
            )}
            {reserva.data && reserva.hora && (
              <div className="dash-confirm-detail">
                {formatarDataBR(reserva.data)} às {formatarHoraStr(reserva.hora)}
              </div>
            )}
            {reserva.valor != null && (
              <div className="dash-confirm-value">{formatarMoeda(reserva.valor)}</div>
            )}
          </div>
        )}
        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn--secondary" onClick={onFechar}>
            {textoCancelar}
          </button>
          <button type="button" className="dash-btn dash-btn--danger" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmacaoModal.propTypes = {
  aberto: PropTypes.bool.isRequired,
  titulo: PropTypes.string,
  mensagem: PropTypes.string,
  reserva: PropTypes.shape({
    tipoQuadra: PropTypes.string,
    data: PropTypes.string,
    hora: PropTypes.string,
    valor: PropTypes.number,
  }),
  onFechar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
  textoCancelar: PropTypes.string,
  textoConfirmar: PropTypes.string,
};

export default ConfirmacaoModal;
