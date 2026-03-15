import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui";

const MOCK_QUADRAS = [
  {
    id: 1, nome: "Indoor - Futsal", estrutura: "Indoor", material: "Sintético",
    modalidades: ["Futsal", "Handebol"], quantidade_quadras: 2,
    apelido: "Quadra Central", empresa_id: 1, status: "ativa",
    created_at: new Date().toISOString(),
  },
  {
    id: 2, nome: "Externa - Society", estrutura: "Externa", material: "Gramado Natural",
    modalidades: ["Society 5x5", "Society 7x7", "Futebol de campo"], quantidade_quadras: 3,
    apelido: "Campão", empresa_id: 1, status: "ativa",
    created_at: new Date().toISOString(),
  },
  {
    id: 3, nome: "Coberta - Beach Tennis", estrutura: "Coberta", material: "Areia",
    modalidades: ["Beach Tennis", "Vôlei de praia", "Futvôlei"], quantidade_quadras: 2,
    apelido: "Arena de Areia", empresa_id: 1, status: "ativa",
    created_at: new Date().toISOString(),
  },
  {
    id: 4, nome: "Indoor - Basquete", estrutura: "Indoor", material: "Cimento",
    modalidades: ["Basquete"], quantidade_quadras: 1,
    apelido: "Quadra NBA", empresa_id: 1, status: "inativa",
    created_at: new Date().toISOString(),
  },
  {
    id: 5, nome: "Coberta - Tênis", estrutura: "Coberta", material: "Saibro",
    modalidades: ["Tênis", "Pádel"], quantidade_quadras: 4,
    apelido: "Courts", empresa_id: 1, status: "ativa",
    created_at: new Date().toISOString(),
  },
  {
    id: 6, nome: "Externa - Vôlei", estrutura: "Externa", material: "Areia",
    modalidades: ["Vôlei de praia"], quantidade_quadras: 1,
    apelido: null, empresa_id: 1, status: "inativa",
    created_at: new Date().toISOString(),
  },
];

const MOCK_EMPRESAS = [
  { id: 1, nome: "Complexo Esportivo VTP", endereco_resumo: "Rua das Quadras, 123 - São Paulo, SP" },
];

const ESTRUTURAS = ["Indoor", "Coberta", "Externa"];
const MATERIAIS = ["Sintético", "Gramado Natural", "Cimento", "Madeira", "Areia", "Saibro"];

function getStatusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "ativa") return "Ativa";
  if (s === "inativa") return "Inativa";
  return "Status não informado";
}

function getQuadraDisplayName(quadra) {
  if (quadra.apelido) return quadra.apelido;
  if (quadra.nome) return quadra.nome;
  return `${quadra.estrutura || "Quadra"}${quadra.modalidades?.length ? ` - ${quadra.modalidades[0]}` : ""}`;
}

export default function GestorConfiguracoesQuadrasPage() {
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState(MOCK_QUADRAS);
  const [empresas] = useState(MOCK_EMPRESAS);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoQuadraId, setEditandoQuadraId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [quadraParaExcluir, setQuadraParaExcluir] = useState(null);

  const [formData, setFormData] = useState({
    estrutura: "", material: "", modalidades: [],
    inputModalidade: "", quantidadeQuadras: "", apelido: ""
  });

  function resetForm() {
    return { estrutura: "", material: "", modalidades: [], inputModalidade: "", quantidadeQuadras: "", apelido: "" };
  }

  function handleNovaQuadra() {
    setEditandoQuadraId(null);
    setFormData(resetForm());
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEditandoQuadraId(null);
    setFormData(resetForm());
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function handleEditarQuadra(id) {
    const quadra = quadras.find(q => q.id === id);
    if (!quadra) return;

    setEditandoQuadraId(id);
    setFormData({
      estrutura: quadra.estrutura || "",
      material: quadra.material || "",
      modalidades: quadra.modalidades || [],
      inputModalidade: "",
      quantidadeQuadras: quadra.quantidade_quadras?.toString() || "",
      apelido: quadra.apelido || "",
    });
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    setSalvando(true);
    setMensagemErro("");
    setMensagemSucesso("");

    if (!formData.estrutura || !formData.material || !formData.modalidades?.length || !formData.quantidadeQuadras) {
      setMensagemErro("Estrutura, Material, Modalidade e Quantidade são obrigatórios.");
      setSalvando(false);
      return;
    }

    const quantidade = parseInt(formData.quantidadeQuadras);
    if (isNaN(quantidade) || quantidade <= 0) {
      setMensagemErro("A quantidade de quadras deve ser um número maior que zero.");
      setSalvando(false);
      return;
    }

    const primeiraModalidade = formData.modalidades[0] || "";
    const nomeQuadra = formData.apelido.trim()
      ? formData.apelido.trim()
      : `${formData.estrutura}${primeiraModalidade ? ` - ${primeiraModalidade}` : ""}`;

    if (editandoQuadraId) {
      setQuadras(prev => prev.map(q =>
        q.id === editandoQuadraId
          ? { ...q, estrutura: formData.estrutura, material: formData.material, modalidades: formData.modalidades, quantidade_quadras: quantidade, apelido: formData.apelido.trim() || null, nome: nomeQuadra }
          : q
      ));
      setMensagemSucesso("Quadra atualizada com sucesso!");
    } else {
      setQuadras(prev => [...prev, {
        id: Date.now(), nome: nomeQuadra, estrutura: formData.estrutura,
        material: formData.material, modalidades: formData.modalidades,
        quantidade_quadras: quantidade, apelido: formData.apelido.trim() || null,
        empresa_id: 1, status: "ativa", created_at: new Date().toISOString()
      }]);
      setMensagemSucesso("Quadra adicionada com sucesso!");
    }

    setSalvando(false);
    setTimeout(handleFecharModal, 2000);
  }

  function handleToggleStatus(quadra) {
    const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";
    const novoStatus = estaAtiva ? "inativa" : "ativa";

    setQuadras(prev => prev.map(q =>
      q.id === quadra.id ? { ...q, status: novoStatus } : q
    ));
    setMensagemSucesso(`Quadra ${estaAtiva ? "desativada" : "ativada"} com sucesso!`);
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  function handleConfirmarExclusao() {
    if (!quadraParaExcluir) return;
    setQuadras(prev => prev.filter(q => q.id !== quadraParaExcluir.id));
    setQuadraParaExcluir(null);
    setMensagemSucesso("Quadra excluída com sucesso!");
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  const empresasComQuadras = empresas
    .map((empresa) => ({
      ...empresa,
      quadras: quadras.filter((q) => q.empresa_id === empresa.id),
    }))
    .filter((empresa) => empresa.quadras?.length > 0);

  function buildNamePreview() {
    if (formData.apelido.trim()) return `Nome da quadra: ${formData.apelido.trim()}`;
    if (formData.estrutura && formData.modalidades?.length) {
      const extra = formData.modalidades.length > 1 ? ` (+${formData.modalidades.length - 1})` : "";
      return `Nome da quadra será: ${formData.estrutura} - ${formData.modalidades[0]}${extra}`;
    }
    return "Se não informado, o nome será: Estrutura - Modalidade";
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="cfg-header">
          <button className="cfg-back-btn" onClick={() => navigate("/gestor/configuracoes")} title="Voltar para Configurações">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="cfg-title">Configurações das Quadras</h1>
        </div>
        <button className="btn-primary" onClick={handleNovaQuadra}>+ Adicionar Quadra</button>
      </div>

      {/* Alertas globais */}
      {mensagemSucesso && !modalAberto && <div className="cfg-alert cfg-alert--success">{mensagemSucesso}</div>}

      {quadras.length === 0 && (
        <div className="card" style={{ marginTop: 0 }}>
          <EmptyState
            titulo="Não tem nenhuma quadra"
            descricao="Comece adicionando sua primeira quadra para gerenciar suas reservas"
            acao={handleNovaQuadra}
            acaoLabel="+ Adicionar Quadra"
          />
        </div>
      )}

      {quadras.length > 0 && (
        <div>
          {empresasComQuadras.length === 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Há quadras cadastradas, mas nenhuma empresa vinculada foi encontrada. Verifique seus complexos.
              </p>
            </div>
          )}

          <div className="cfg-quadra-grid">
            {empresasComQuadras.flatMap((empresa) =>
              empresa.quadras.map((quadra) => {
                const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";

                return (
                  <div key={quadra.id} className="cfg-quadra-card">
                    <div className="cfg-quadra-card-header">
                      <div style={{ flex: 1 }}>
                        <h3 className="cfg-quadra-card-name">{getQuadraDisplayName(quadra)}</h3>
                      </div>
                      <span className={`cfg-status-badge ${estaAtiva ? "cfg-status-badge--active" : "cfg-status-badge--inactive"}`}>
                        {getStatusLabel(quadra.status)}
                      </span>
                    </div>

                    <div className="cfg-quadra-info">
                      {quadra.estrutura && (
                        <div className="cfg-quadra-info-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21h18M5 21V7l8-4v14M19 21V11l-6-4M9 9v0M9 15v0M15 11v0M15 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div>
                            <div className="cfg-quadra-info-label">Estrutura</div>
                            <div className="cfg-quadra-info-value">{quadra.estrutura}</div>
                          </div>
                        </div>
                      )}

                      {quadra.material && (
                        <div className="cfg-quadra-info-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div>
                            <div className="cfg-quadra-info-label">Material</div>
                            <div className="cfg-quadra-info-value">{quadra.material}</div>
                          </div>
                        </div>
                      )}

                      {quadra.quantidade_quadras && (
                        <div className="cfg-quadra-info-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <div>
                            <div className="cfg-quadra-info-label">Quantidade</div>
                            <div className="cfg-quadra-info-value">{quadra.quantidade_quadras} {quadra.quantidade_quadras === 1 ? "quadra" : "quadras"}</div>
                          </div>
                        </div>
                      )}

                      {quadra.modalidades?.length > 0 && (
                        <div className={`cfg-quadra-info-item${quadra.modalidades.length > 2 ? " cfg-quadra-info-item--wide" : ""}`} style={{ alignItems: "flex-start" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 2 }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
                      <button className="cfg-btn-edit" onClick={() => handleEditarQuadra(quadra.id)}>Editar</button>
                      <button
                        className={estaAtiva ? "cfg-btn-deactivate" : "cfg-btn-activate"}
                        onClick={() => handleToggleStatus(quadra)}
                      >
                        {estaAtiva ? "Desativar" : "Ativar"}
                      </button>
                      <button className="cfg-btn-delete" onClick={() => setQuadraParaExcluir(quadra)}>Excluir</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Popup de confirmação de exclusão */}
      {quadraParaExcluir && (
        <div className="cfg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuadraParaExcluir(null); }}>
          <div className="cfg-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="cfg-confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="cfg-confirm-title">Excluir quadra</h3>
            <p className="cfg-confirm-msg">
              Tem certeza que deseja excluir <strong>{getQuadraDisplayName(quadraParaExcluir)}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="cfg-confirm-actions">
              <button type="button" className="cfg-btn-cancel" onClick={() => setQuadraParaExcluir(null)}>Cancelar</button>
              <button type="button" className="btn-danger" onClick={handleConfirmarExclusao}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="cfg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleFecharModal(); }}>
          <div className="cfg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cfg-modal-header">
              <h3 className="cfg-modal-title">{editandoQuadraId ? "Editar Quadra" : "Adicionar Quadra"}</h3>
              <button type="button" className="cfg-modal-close" onClick={handleFecharModal}>×</button>
            </div>

            {mensagemSucesso && <div className="cfg-alert cfg-alert--success" style={{ marginBottom: 16 }}>{mensagemSucesso}</div>}
            {mensagemErro && <div className="cfg-alert cfg-alert--error" style={{ marginBottom: 16 }}>{mensagemErro}</div>}

            <form onSubmit={handleSubmit} className="cfg-modal-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="estrutura">Estrutura *</label>
                  <select id="estrutura" name="estrutura" value={formData.estrutura} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    {ESTRUTURAS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="material">Material *</label>
                  <select id="material" name="material" value={formData.material} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    {MATERIAIS.map((m) => <option key={m} value={m}>{m}</option>)}
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
                            setFormData(prev => ({ ...prev, modalidades: prev.modalidades.filter((_, i) => i !== index) }));
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
                      onChange={(e) => setFormData(prev => ({ ...prev, inputModalidade: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          e.preventDefault();
                          const nova = e.target.value.trim();
                          setFormData(prev => {
                            const mods = prev.modalidades || [];
                            if (mods.includes(nova)) return { ...prev, inputModalidade: "" };
                            return { ...prev, modalidades: [...mods, nova], inputModalidade: "" };
                          });
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
                  <input id="quantidadeQuadras" name="quantidadeQuadras" type="number" value={formData.quantidadeQuadras} onChange={handleChange} placeholder="Ex: 2" min="1" required />
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="apelido">Apelido</label>
                  <input id="apelido" name="apelido" type="text" value={formData.apelido} onChange={handleChange} placeholder="Ex: Quadra Principal" />
                  <small>{buildNamePreview()}</small>
                </div>
              </div>

              <div className="cfg-modal-actions">
                <button type="button" className="cfg-btn-cancel" onClick={handleFecharModal}>Cancelar</button>
                <button type="submit" className="cfg-btn-submit" disabled={salvando}>
                  {salvando
                    ? (editandoQuadraId ? "Atualizando..." : "Salvando...")
                    : (editandoQuadraId ? "Atualizar" : "Adicionar Quadra")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
