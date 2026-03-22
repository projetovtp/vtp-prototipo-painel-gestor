import useFocusTrap from "../../hooks/useFocusTrap";
import IconCheckStroke from "../icons/IconCheckStroke";

const ModalSucessoRepasse = ({ aberto, onFechar }) => {
  const ref = useFocusTrap(aberto, onFechar);

  if (!aberto) return null;

  return (
    <div className="dash-modal-overlay dash-modal-overlay--top" onClick={onFechar}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gf-modal-sucesso-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gf-success-modal">
          <div className="gf-success-icon"><IconCheckStroke /></div>
          <h3 id="gf-modal-sucesso-titulo" className="gf-success-title">Solicitação Enviada com Sucesso!</h3>
          <p className="gf-success-text">
            Sua solicitação de repasse foi enviada e será aprovada em até <strong style={{ color: "var(--color-text)" }}>1 dia útil</strong>.
          </p>
          <button type="button" className="gf-success-btn" onClick={onFechar}>Entendi</button>
        </div>
      </div>
    </div>
  );
};

export default ModalSucessoRepasse;
