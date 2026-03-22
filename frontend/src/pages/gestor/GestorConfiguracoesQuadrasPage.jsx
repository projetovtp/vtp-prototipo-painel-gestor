import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui";
import { formatarNomeQuadra } from "../../utils/formatters";
import IconArrowLeft from "../../components/icons/IconArrowLeft";
import IconAlertCircle from "../../components/icons/IconAlertCircle";
import QuadraCard from "../../components/gestor/QuadraCard";
import ModalQuadra from "../../components/modals/ModalQuadra";
import { useGestorConfiguracoesQuadrasPage } from "../../hooks/useGestorConfiguracoesQuadrasPage";

const GestorConfiguracoesQuadrasPage = () => {
  const navigate = useNavigate();
  const {
    quadras,
    modalAberto,
    editandoQuadraId,
    salvando,
    mensagemSucesso,
    mensagemErro,
    quadraParaExcluir,
    setQuadraParaExcluir,
    formData,
    empresasComQuadras,
    handleNovaQuadra,
    handleFecharModal,
    handleEditarQuadra,
    handleChange,
    handleSubmit,
    handleToggleStatus,
    handleConfirmarExclusao,
    buildNamePreview,
  } = useGestorConfiguracoesQuadrasPage();

  return (
    <div className="page">
      <div className="page-header">
        <div className="cfg-header">
          <button className="cfg-back-btn" onClick={() => navigate("/gestor/configuracoes")} title="Voltar para Configurações">
            <IconArrowLeft />
          </button>
          <h1 className="cfg-title">Configurações das Quadras</h1>
        </div>
        <button className="btn-primary" onClick={handleNovaQuadra}>+ Adicionar Quadra</button>
      </div>

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
              empresa.quadras.map((quadra) => (
                <QuadraCard
                  key={quadra.id}
                  quadra={quadra}
                  onEditar={handleEditarQuadra}
                  onToggleStatus={handleToggleStatus}
                  onExcluir={setQuadraParaExcluir}
                />
              ))
            )}
          </div>
        </div>
      )}

      {quadraParaExcluir && (
        <div className="cfg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuadraParaExcluir(null); }}>
          <div className="cfg-confirm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="cfg-confirm-icon">
              <IconAlertCircle />
            </div>
            <h3 className="cfg-confirm-title">Excluir quadra</h3>
            <p className="cfg-confirm-msg">
              Tem certeza que deseja excluir <strong>{formatarNomeQuadra(quadraParaExcluir)}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="cfg-confirm-actions">
              <button type="button" className="cfg-btn-cancel" onClick={() => setQuadraParaExcluir(null)}>Cancelar</button>
              <button type="button" className="btn-danger" onClick={handleConfirmarExclusao}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      <ModalQuadra
        aberto={modalAberto}
        editandoId={editandoQuadraId}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onFechar={handleFecharModal}
        salvando={salvando}
        mensagemSucesso={mensagemSucesso}
        mensagemErro={mensagemErro}
        buildNamePreview={buildNamePreview}
      />
    </div>
  );
};

export default GestorConfiguracoesQuadrasPage;
