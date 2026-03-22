import React from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import IconWarning from "../icons/iconWarning";

const ModalConfirmacao = ({
  aberto,
  titulo,
  descricao,
  onConfirmar,
  onCancelar,
  textoConfirmar = "Remover",
  textoCancelar = "Cancelar",
  carregando = false,
  wide = false,
}) => {
  const ref = useFocusTrap(aberto, onCancelar);

  if (!aberto) return null;

  return (
    <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancelar(); }}>
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        tabIndex="-1"
        className={`vt-modal rh-modal-confirm${wide ? " rh-modal-confirm--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vt-modal-body rh-modal-confirm-body">
          <div className="rh-confirm-icon">
            <IconWarning />
          </div>
          <h3 className="rh-modal-confirm-titulo">{titulo}</h3>
          <p className="rh-modal-confirm-desc">{descricao}</p>
          <div className="rh-modal-actions">
            <button type="button" className="btn-outlined" onClick={onCancelar} disabled={carregando}>
              {textoCancelar}
            </button>
            <button type="button" className="btn-danger-solid" onClick={onConfirmar} disabled={carregando}>
              {carregando ? "Removendo..." : textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;
