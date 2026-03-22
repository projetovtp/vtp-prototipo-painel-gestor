import IconBuilding from "../icons/IconBuilding";
import IconLayers from "../icons/IconLayers";
import IconList from "../icons/IconList";
import IconUsers from "../icons/IconUsers";
import { statusLabelQuadra } from "../../utils/status";
import { formatarNomeQuadra } from "../../utils/formatters";

export default function QuadraCard({ quadra, onEditar, onToggleStatus, onExcluir }) {
  const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";

  return (
    <div className="cfg-quadra-card">
      <div className="cfg-quadra-card-header">
        <div style={{ flex: 1 }}>
          <h3 className="cfg-quadra-card-name">{formatarNomeQuadra(quadra)}</h3>
        </div>
        <span className={`cfg-status-badge ${estaAtiva ? "cfg-status-badge--active" : "cfg-status-badge--inactive"}`}>
          {statusLabelQuadra(quadra.status)}
        </span>
      </div>

      <div className="cfg-quadra-info">
        {quadra.estrutura && (
          <div className="cfg-quadra-info-item">
            <IconBuilding />
            <div>
              <div className="cfg-quadra-info-label">Estrutura</div>
              <div className="cfg-quadra-info-value">{quadra.estrutura}</div>
            </div>
          </div>
        )}

        {quadra.material && (
          <div className="cfg-quadra-info-item">
            <IconLayers />
            <div>
              <div className="cfg-quadra-info-label">Material</div>
              <div className="cfg-quadra-info-value">{quadra.material}</div>
            </div>
          </div>
        )}

        {quadra.quantidade_quadras && (
          <div className="cfg-quadra-info-item">
            <IconList />
            <div>
              <div className="cfg-quadra-info-label">Quantidade</div>
              <div className="cfg-quadra-info-value">
                {quadra.quantidade_quadras} {quadra.quantidade_quadras === 1 ? "quadra" : "quadras"}
              </div>
            </div>
          </div>
        )}

        {quadra.modalidades?.length > 0 && (
          <div className={`cfg-quadra-info-item${quadra.modalidades.length > 2 ? " cfg-quadra-info-item--wide" : ""}`} style={{ alignItems: "flex-start" }}>
            <IconUsers style={{ marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div className="cfg-quadra-info-label" style={{ marginBottom: 4 }}>Modalidades</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {quadra.modalidades.map((mod, idx) => (
                  <span key={idx} className="cfg-mod-tag">{mod}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cfg-quadra-actions">
        <button className="cfg-btn-edit" onClick={() => onEditar(quadra.id)}>Editar</button>
        <button
          className={estaAtiva ? "cfg-btn-deactivate" : "cfg-btn-activate"}
          onClick={() => onToggleStatus(quadra)}
        >
          {estaAtiva ? "Desativar" : "Ativar"}
        </button>
        <button className="cfg-btn-delete" onClick={() => onExcluir(quadra)}>Excluir</button>
      </div>
    </div>
  );
}
