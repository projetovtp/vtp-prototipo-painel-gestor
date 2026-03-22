import { formatarMoeda as formatBRL } from "../../utils/formatters";
import IconStar from "../../components/icons/IconStar";
import IconCheckbox from "../../components/icons/IconCheckbox";

const TopQuadras = ({ quadras }) => {
  return (
    <div className="card rp-section">
      <div className="rp-section-header">
        <div className="rp-section-icon rp-section-icon--yellow">
          <IconStar />
        </div>
        <h3 className="rp-section-title">Quadras Mais Utilizadas</h3>
      </div>
      <div className="rp-quadras-grid">
        {quadras.map((quadra, index) => (
          <div key={index} className="rp-quadra-card rp-quadra-card--default">
            <div className="rp-quadra-content">
              <div className="rp-quadra-top">
                <div>
                  <div className="rp-quadra-nome">{quadra.nome}</div>
                  <div className="rp-quadra-reservas">
                    <IconCheckbox />
                    {quadra.reservas} {quadra.reservas === 1 ? "reserva" : "reservas"}
                  </div>
                </div>
                <div className="rp-quadra-rank">{index + 1}</div>
              </div>
              <div className="rp-quadra-bottom">
                <div className="rp-quadra-receita">{formatBRL(quadra.receita)}</div>
                <div className="rp-quadra-receita-label">Receita total</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopQuadras;
