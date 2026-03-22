import { ESTRUTURAS_QUADRA, MATERIAIS_QUADRA } from "../../utils/constants";

export default function ModalQuadra({
  aberto,
  editandoId,
  formData,
  onChange,
  onSubmit,
  onFechar,
  salvando,
  mensagemSucesso,
  mensagemErro,
  buildNamePreview,
}) {
  if (!aberto) return null;

  return (
    <div className="cfg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="cfg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cfg-modal-header">
          <h3 className="cfg-modal-title">{editandoId ? "Editar Quadra" : "Adicionar Quadra"}</h3>
          <button type="button" className="cfg-modal-close" onClick={onFechar}>×</button>
        </div>

        {mensagemSucesso && <div className="cfg-alert cfg-alert--success" style={{ marginBottom: 16 }}>{mensagemSucesso}</div>}
        {mensagemErro && <div className="cfg-alert cfg-alert--error" style={{ marginBottom: 16 }}>{mensagemErro}</div>}

        <form onSubmit={onSubmit} className="cfg-modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="estrutura">Estrutura *</label>
              <select id="estrutura" name="estrutura" value={formData.estrutura} onChange={onChange} required>
                <option value="">Selecione</option>
                {ESTRUTURAS_QUADRA.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="material">Material *</label>
              <select id="material" name="material" value={formData.material} onChange={onChange} required>
                <option value="">Selecione</option>
                {MATERIAIS_QUADRA.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="modalidade-input">Modalidade *</label>
              <div
                className="cfg-tag-input-box"
                onClick={() => document.getElementById("modalidade-input")?.focus()}
              >
                {formData.modalidades?.map((modalidade, index) => (
                  <div key={index} className="cfg-tag">
                    <span>{modalidade}</span>
                    <button
                      type="button"
                      className="cfg-tag-remove"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onChange({
                          target: {
                            name: "modalidades",
                            value: formData.modalidades.filter((_, i) => i !== index),
                          },
                        });
                      }}
                    >×</button>
                  </div>
                ))}
                <input
                  id="modalidade-input"
                  type="text"
                  className="cfg-tag-input"
                  placeholder={formData.modalidades?.length ? "Adicionar outra modalidade..." : "Digite a modalidade e pressione Enter"}
                  value={formData.inputModalidade || ""}
                  onChange={(e) => onChange({ target: { name: "inputModalidade", value: e.target.value } })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      e.preventDefault();
                      const nova = e.target.value.trim();
                      const mods = formData.modalidades || [];
                      if (!mods.includes(nova)) {
                        onChange({ target: { name: "modalidades", value: [...mods, nova] } });
                      }
                      onChange({ target: { name: "inputModalidade", value: "" } });
                    }
                  }}
                />
              </div>
              {formData.modalidades?.length > 0 && (
                <small>{formData.modalidades.length} {formData.modalidades.length === 1 ? "modalidade adicionada" : "modalidades adicionadas"}</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="quantidadeQuadras">Quantidade de Quadras *</label>
              <input id="quantidadeQuadras" name="quantidadeQuadras" type="number" value={formData.quantidadeQuadras} onChange={onChange} placeholder="Ex: 2" min="1" required />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="apelido">Apelido</label>
              <input id="apelido" name="apelido" type="text" value={formData.apelido} onChange={onChange} placeholder="Ex: Quadra Principal" />
              <small>{buildNamePreview()}</small>
            </div>
          </div>

          <div className="cfg-modal-actions">
            <button type="button" className="cfg-btn-cancel" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="cfg-btn-submit" disabled={salvando}>
              {salvando
                ? (editandoId ? "Atualizando..." : "Salvando...")
                : (editandoId ? "Atualizar" : "Adicionar Quadra")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
