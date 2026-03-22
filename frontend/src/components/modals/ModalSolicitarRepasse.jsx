import { useState } from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarMoeda as formatBRL,
  formatarValorMascarado,
  extrairValorNumerico,
} from "../../utils/formatters";

const ModalSolicitarRepasse = ({
  aberto,
  onFechar,
  totalAReceber,
  nomeTitular,
  chavePix,
  solicitando,
  onConfirmar,
}) => {
  const ref = useFocusTrap(aberto, () => !solicitando && onFechar());
  const [valorRepasse, setValorRepasse] = useState("");
const [ultimoAberto, setUltimoAberto] = useState(false);

if (aberto && !ultimoAberto) {
  setValorRepasse(formatarValorMascarado(totalAReceber.toString()));
}
if (aberto !== ultimoAberto) {
  setUltimoAberto(aberto);
}

  function handleValorChange(e) {
    const valor = e.target.value;
    const apenasNumeros = valor.replace(/\D/g, "");
    if (!apenasNumeros) {
      setValorRepasse("");
      return;
    }
    const valorNumerico = Number(apenasNumeros) / 100;
    if (valorNumerico > totalAReceber) {
      setValorRepasse(formatarValorMascarado(totalAReceber.toString()));
    } else {
      setValorRepasse(formatarValorMascarado(valor));
    }
  }

  if (!aberto) return null;

  const valorNumerico = extrairValorNumerico(valorRepasse);

  return (
    <div className="dash-modal-overlay" onClick={() => !solicitando && onFechar()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gf-modal-solicitar-titulo"
        tabIndex="-1"
        className="dash-modal dash-modal--md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-header">
          <h2 id="gf-modal-solicitar-titulo" className="dash-modal-title">Solicitar Repasse</h2>
          <button type="button" className="dash-modal-close" aria-label="Fechar modal" onClick={() => !solicitando && onFechar()} disabled={solicitando}>×</button>
        </div>

        <div className="gf-form-col">
          <div>
            <div className="gf-repasse-field-label">Valor Disponível</div>
            <div className="gf-repasse-field-value" style={{ color: "var(--color-brand)" }}>{formatBRL(totalAReceber)}</div>
          </div>

          <div>
            <label className="gf-form-label">Valor do Repasse *</label>
            <input
              className="gf-form-input"
              type="text"
              value={valorRepasse ? `R$ ${valorRepasse}` : ""}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              disabled={solicitando}
            />
            <div className="gf-form-hint">Valor máximo: {formatBRL(totalAReceber)}</div>
          </div>

          <div className="gf-pix-box">
            <div className="gf-pix-box-title">Conta para Recebimento</div>
            <div className="gf-pix-box-row"><strong>Titular:</strong> {nomeTitular || "—"}</div>
            <div className="gf-pix-box-row"><strong>Chave PIX:</strong> {chavePix || "Não configurada"}</div>
            {!chavePix && (
              <div className="gf-pix-warning">Configure a chave PIX nas configurações antes de solicitar um repasse.</div>
            )}
          </div>

          <div className="gf-modal-btn-row">
            <button className="gf-modal-btn gf-modal-btn--cancel" onClick={onFechar} disabled={solicitando}>
              Cancelar
            </button>
            <button
              className="gf-modal-btn gf-modal-btn--confirm"
              onClick={() => onConfirmar(valorNumerico)}
              disabled={solicitando || !valorRepasse || valorNumerico <= 0 || !chavePix}
            >
              {solicitando ? "Solicitando..." : "Confirmar Solicitação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSolicitarRepasse;
