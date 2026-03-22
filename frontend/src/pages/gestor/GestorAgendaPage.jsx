import React from "react";
import useFocusTrap from "../../hooks/useFocusTrap";
import { ErrorMessage, EmptyState } from "../../components/ui";
import { formatarMoeda, formatarNomeQuadra, corrigirHora } from "../../utils/formatters";
import { DIAS_SEMANA_REGRAS } from "../../utils/constants";
import { gerarHorarios } from "../../utils/agenda";
import IconDelete from "../../components/icons/iconDelete";
import ModalConfirmacao from "../../components/ui/modalConfirmacao";
import useGestorAgendaPage from "../../hooks/useGestorAgendaPage";


const GestorAgendaPage = () => {
  const {
    quadras,
    quadraSelecionadaId,
    setQuadraSelecionadaId,
    regras,
    regraForm,
    setRegraForm,
    regraEditandoId,
    regraEditando,
    modalEdicaoAberto,
    modalLimparTodasAberto,
    modalExcluirRegra,
    setModalExcluirRegra,
    modalLimparDia,
    modalRemoverDoModal,
    setModalRemoverDoModal,
    salvandoRegra,
    carregando,
    erro,
    setErro,
    mensagem,
    regrasPorDia,
    toggleDiaSemana,
    handleSalvarRegra,
    iniciarEdicaoRegra,
    fecharModalEdicao,
    handleSalvarEdicaoModal,
    handleRemoverDoModal,
    handleExcluirRegra,
    abrirModalLimparTodas,
    handleLimparTodasRegras,
    abrirModalLimparDia,
    handleLimparDia,
    resetRegraForm,
    setModalLimparDia,
    setModalLimparTodasAberto,
  } = useGestorAgendaPage();

  const refModalEdicao = useFocusTrap(modalEdicaoAberto, () => fecharModalEdicao());

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Regra de Horários</h1>
      </div>

      {mensagem && <div className="rh-success-msg">{mensagem}</div>}

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {!quadraSelecionadaId && (
        <div className="card" style={{ marginTop: 0 }}>
          <EmptyState titulo="Selecione uma quadra para configurar a agenda" compact />
        </div>
      )}

      {quadraSelecionadaId && (
        <div className="card" style={{ marginTop: 0, marginBottom: 24 }}>
          {/* Seleção de Quadra */}
          <div className="rh-separator">
            <label style={{ display: "block", fontSize: "var(--font-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
              Quadra
            </label>
            {carregando && quadras.length === 0 ? (
              <div className="rh-loading-box">Carregando quadras...</div>
            ) : (
              <select
                className="rh-quadra-select"
                value={quadraSelecionadaId}
                onChange={(e) => setQuadraSelecionadaId(e.target.value)}
              >
                <option value="">Selecione uma quadra</option>
                {quadras.map((quadra) => (
                  <option key={quadra.id} value={quadra.id}>
                    {formatarNomeQuadra(quadra)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rh-section-header">
            <div>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
                Regras de Horários
              </h3>
              <p style={{ fontSize: "var(--font-sm)", color: "var(--color-text-secondary)", margin: 0 }}>
                Configure os horários disponíveis de hora em hora. O sistema gerará automaticamente os horários entre o início e o fim informados.
              </p>
            </div>
            {regras.length > 0 && (
              <button
                type="button"
                className="btn-danger-soft"
                onClick={abrirModalLimparTodas}
                disabled={carregando}
                style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, padding: "10px 20px" }}
              >
                <IconDelete size={16}/>
                {carregando ? "Removendo..." : `Limpar Todas as Regras (${regras.length})`}
              </button>
            )}
          </div>

          {/* Form de Regra */}
          <form onSubmit={handleSalvarRegra} style={{ marginBottom: 24 }}>
            <div className="form-grid">
              <div className="form-field form-field-full">
                <label>Dias da Semana {regraEditandoId && "(edição de uma regra específica)"}</label>
                <div className="rh-dia-chips">
                  {DIAS_SEMANA_REGRAS.map(dia => {
                    const isSelecionado = regraForm.diasSemana.includes(dia.valor);
                    const isDisabled = !!regraEditandoId;
                    let cls = "rh-dia-chip";
                    if (isSelecionado) cls += " rh-dia-chip--selected";
                    if (isDisabled && !isSelecionado) cls += " rh-dia-chip--disabled";
                    return (
                      <label key={dia.valor} className={cls}>
                        <input
                          type="checkbox"
                          checked={isSelecionado}
                          onChange={() => toggleDiaSemana(dia.valor)}
                          disabled={isDisabled}
                          style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                        />
                        <span>{dia.nome}</span>
                      </label>
                    );
                  })}
                </div>
                <small style={{ marginTop: 8, display: "block" }}>
                  {regraEditandoId
                    ? "Você está editando uma regra específica. Para criar regras em múltiplos dias, cancele a edição e crie uma nova regra."
                    : "Selecione um ou mais dias da semana. A mesma regra será aplicada a todos os dias selecionados."}
                </small>
              </div>

              <div className="form-field">
                <label>Horário Inicial</label>
                <input
                  type="time"
                  value={regraForm.horaInicio}
                  onChange={(e) => setRegraForm({ ...regraForm, horaInicio: corrigirHora(e.target.value) })}
                  step="3600"
                  required
                />
                <small>Apenas horas cheias (ex: 08:00, 09:00). Minutos serão automaticamente definidos como 00.</small>
              </div>

              <div className="form-field">
                <label>Horário Final</label>
                <input
                  type="time"
                  value={regraForm.horaFim}
                  onChange={(e) => setRegraForm({ ...regraForm, horaFim: corrigirHora(e.target.value) })}
                  step="3600"
                  required
                />
                <small>Apenas horas cheias (ex: 22:00). O sistema criará horários até 21:00.</small>
              </div>

              <div className="form-field">
                <label>Preço por Hora (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={regraForm.precoHora}
                  onChange={(e) => setRegraForm({ ...regraForm, precoHora: e.target.value })}
                  placeholder="Ex: 100.00"
                  required
                />
                <small>Campo obrigatório. Informe o valor por hora (ex: 100.00)</small>
              </div>
            </div>

            {regraForm.horaInicio && regraForm.horaFim && (
              <div className="rh-preview-box">
                <strong>Horários que serão criados:</strong>{" "}
                {gerarHorarios(regraForm.horaInicio, regraForm.horaFim).join(", ")}
              </div>
            )}

            <div className="form-actions">
              {regraEditandoId && (
                <button type="button" onClick={resetRegraForm} className="btn-outlined">
                  Cancelar Edição
                </button>
              )}
              <button type="submit" className="btn-brand" disabled={salvandoRegra} style={{ padding: "8px 20px" }}>
                {salvandoRegra ? "Salvando..." : regraEditandoId ? "Atualizar Regra" : "Criar Regra"}
              </button>
            </div>
          </form>

          {/* Lista de Regras por Dia */}
          {regrasPorDia.map(({ valor, nome, regras: regrasDia }) => {
            if (regrasDia.length === 0) return null;
            return (
              <div key={valor} className="rh-dia-group">
                <div className="rh-dia-group-header">
                  <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600, color: "var(--color-text)" }}>{nome}</h4>
                  <button
                    type="button"
                    className="btn-danger-soft"
                    onClick={() => abrirModalLimparDia(valor)}
                    style={{ padding: "6px 12px", fontSize: "var(--font-sm)" }}
                  >
                    Limpar {nome}
                  </button>
                </div>
                <div className="rh-regras-list">
                  {regrasDia.map(regra => (
                    <div key={regra.id} className="rh-regra-card">
                      <div>
                        <div className="rh-regra-info">{regra.hora_inicio} às {regra.hora_fim}</div>
                        <div className="rh-regra-price">
                          {regra.preco_hora ? formatarMoeda(regra.preco_hora) + "/hora" : "Sem preço definido"}
                        </div>
                      </div>
                      <div className="rh-regra-actions">
                        <button type="button" className="rh-regra-btn rh-regra-btn--edit" onClick={() => iniciarEdicaoRegra(regra)}>
                          Editar
                        </button>
                        <button type="button" className="rh-regra-btn rh-regra-btn--remove" onClick={() => setModalExcluirRegra({ aberto: true, regraId: regra.id })}>
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {regras.length === 0 && (
            <div className="rh-empty">
              Nenhuma regra cadastrada. Crie uma regra acima para começar.
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      {modalEdicaoAberto && regraEditando && (
        <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharModalEdicao(); }}>
          <div
            ref={refModalEdicao}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-edicao-titulo"
            tabIndex="-1"
            className="vt-modal rh-modal-edicao"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vt-modal-header">
              <h3 id="agenda-modal-edicao-titulo" className="rh-modal-edicao-titulo">Editar Regra de Horários</h3>
              <button type="button" className="vt-modal-close" aria-label="Fechar modal" onClick={fecharModalEdicao}>×</button>
            </div>
            <div className="vt-modal-body">
              <div className="rh-modal-info">
                <strong style={{ color: "var(--color-text)" }}>Dia da semana:</strong>{" "}
                {DIAS_SEMANA_REGRAS.find(d => d.valor === regraEditando.dia_semana)?.nome || "—"}
              </div>

              <form onSubmit={handleSalvarEdicaoModal}>
                <div className="rh-modal-field">
                  <div>
                    <label>Horário Inicial</label>
                    <input
                      type="time"
                      value={regraForm.horaInicio}
                      onChange={(e) => setRegraForm({ ...regraForm, horaInicio: corrigirHora(e.target.value) })}
                      step="3600"
                      required
                    />
                    <small>Apenas horas cheias (ex: 08:00, 09:00)</small>
                  </div>

                  <div>
                    <label>Horário Final</label>
                    <input
                      type="time"
                      value={regraForm.horaFim}
                      onChange={(e) => setRegraForm({ ...regraForm, horaFim: corrigirHora(e.target.value) })}
                      step="3600"
                      required
                    />
                    <small>Apenas horas cheias (ex: 22:00)</small>
                  </div>

                  <div>
                    <label>Preço por Hora (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={regraForm.precoHora}
                      onChange={(e) => setRegraForm({ ...regraForm, precoHora: e.target.value })}
                      placeholder="Ex: 100.00"
                      required
                    />
                    <small>Campo obrigatório</small>
                  </div>

                  {regraForm.horaInicio && regraForm.horaFim && (
                    <div className="rh-preview-box">
                      <strong>Horários que serão atualizados:</strong>{" "}
                      {gerarHorarios(regraForm.horaInicio, regraForm.horaFim).join(", ")}
                    </div>
                  )}
                </div>

                <div className="rh-modal-actions">
                  <button type="button" className="btn-danger-soft" onClick={() => setModalRemoverDoModal(true)} style={{ padding: "10px 20px" }}>
                    Remover Horário
                  </button>
                  <button type="button" className="btn-outlined" onClick={fecharModalEdicao}>Cancelar</button>
                  <button type="submit" className="btn-brand" disabled={salvandoRegra} style={{ padding: "10px 20px" }}>
                    {salvandoRegra ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

<ModalConfirmacao
  aberto={modalRemoverDoModal && !!regraEditando}
  titulo="Remover esta Regra?"
  descricao={
    regraEditando && <>A regra de <strong>{DIAS_SEMANA_REGRAS.find(d => d.valor === regraEditando.dia_semana)?.nome}</strong> ({regraEditando.hora_inicio} às {regraEditando.hora_fim}) será permanentemente removida.</>
  }
  onConfirmar={handleRemoverDoModal}
  onCancelar={() => setModalRemoverDoModal(false)}
/>

<ModalConfirmacao
  aberto={modalExcluirRegra.aberto}
  titulo="Remover esta Regra?"
  descricao="Esta regra será permanentemente removida. Esta ação não pode ser desfeita."
  onConfirmar={handleExcluirRegra}
  onCancelar={() => setModalExcluirRegra({ aberto: false, regraId: null })}
/>

<ModalConfirmacao
  aberto={modalLimparTodasAberto}
  titulo="Limpar Todas as Regras?"
  descricao={<>Tem certeza que deseja remover <strong>TODAS as {regras.length} regras</strong> desta quadra? Esta ação não pode ser desfeita e todas as regras de horários serão permanentemente excluídas.</>}
  onConfirmar={handleLimparTodasRegras}
  onCancelar={() => setModalLimparTodasAberto(false)}
  textoConfirmar="Sim, Limpar Todas"
  carregando={carregando}
  wide
/>

<ModalConfirmacao
  aberto={modalLimparDia.aberto}
  titulo={`Limpar Regras de ${modalLimparDia.diaNome}?`}
  descricao={<>Todas as regras de <strong>{modalLimparDia.diaNome}</strong> serão permanentemente removidas.</>}
  onConfirmar={handleLimparDia}
  onCancelar={() => setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" })}
  textoConfirmar="Sim, Limpar"
  carregando={carregando}
  wide
/>

      
    </div>
  );
}

export default GestorAgendaPage;
