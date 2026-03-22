import { ErrorMessage, EmptyState } from "../../../components/ui";
import { formatarMoeda as formatBRL, formatarNomeQuadra } from "../../../utils/formatters";

import AgendaRegraSheet from "./AgendaRegraSheet";
import IconPlus from "../../../components/icons/IconPlus";
import IconX from "../../../components/icons/IconX";
import ModalConfirmacao from "../../../components/ui/modalConfirmacao";

import useGestorMobileAgenda from "../../../hooks/useGestorMobileAgenda";

const GestorMobileAgendaPage = () => {
  const {
    quadras,
    quadraId,
    setQuadraId,
    regras,
    regrasPorDia,
    erro,
    setErro,
    mensagem,
    salvando,
    formAberto,
    form,
    setForm,
    editId,
    confirmacao,
    setConfirmacao,
    abrirCriar,
    abrirEditar,
    fecharForm,
    handleSalvar,
    pedirConfirmacao,
    removerRegra,
    limparTodas,
    limparDia
  } = useGestorMobileAgenda();

  return (
    <div className="mhr">
      {/* Court selector */}
      <div className="mhr-court-bar">
        <select
          className="mhr-court-select"
          value={quadraId}
          onChange={(e) => setQuadraId(e.target.value)}
        >
          <option value="">Selecione uma quadra</option>
          {quadras.map((q) => (
            <option key={q.id} value={q.id}>
              {formatarNomeQuadra(q)}
            </option>
          ))}
        </select>
      </div>

      {mensagem && <div className="mhr-toast">{mensagem}</div>}
      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {/* Content */}
      <div className="mhr-scroll">
        {!quadraId ? (
          <div className="mhr-center">
            <EmptyState titulo="Selecione uma quadra" compact />
          </div>
        ) : (
          <>
            {/* Header actions */}
            <div className="mhr-actions-bar">
              <button className="mhr-btn-add" onClick={abrirCriar}>
                <IconPlus size={16} />
                Nova Regra
              </button>

              {regras.length > 0 && (
                <button
                  className="mhr-btn-danger-sm"
                  onClick={() =>
                    pedirConfirmacao(
                      "Limpar Todas?",
                      `Remover todas as ${regras.length} regras?`,
                      limparTodas,
                    )
                  }
                >
                  Limpar Todas ({regras.length})
                </button>
              )}
            </div>

            {/* Rules by day */}
            {regras.length === 0 ? (
              <div className="mhr-empty">
                Nenhuma regra cadastrada. Toque em "Nova Regra" para começar.
              </div>
            ) : (
              regrasPorDia.map(({ valor, nome, regras: rDia }) => {
                if (!rDia.length) return null;
                return (
                  <div key={valor} className="mhr-day-group">
                    <div className="mhr-day-hdr">
                      <span className="mhr-day-name">{nome}</span>
                      <button
                        className="mhr-day-clear"
                        onClick={() =>
                          pedirConfirmacao(
                            `Limpar ${nome}?`,
                            `Remover todas as regras de ${nome}?`,
                            () => limparDia(valor),
                          )
                        }
                      >
                        Limpar
                      </button>
                    </div>
                    {rDia.map((regra) => (
                      <div key={regra.id} className="mhr-regra-card">
                        <div className="mhr-regra-info">
                          <span className="mhr-regra-time">
                            {regra.hora_inicio} — {regra.hora_fim}
                          </span>
                          <span className="mhr-regra-price">
                            {regra.preco_hora
                              ? `${formatBRL(regra.preco_hora)}/h`
                              : "Sem preço"}
                          </span>
                        </div>
                        <div className="mhr-regra-btns">
                          <button
                            className="mhr-regra-btn mhr-regra-btn--edit"
                            onClick={() => abrirEditar(regra)}
                          >
                            Editar
                          </button>
                          <button
                            className="mhr-regra-btn mhr-regra-btn--rm"
                            onClick={() =>
                              pedirConfirmacao(
                                "Remover?",
                                `Remover regra de ${nome} (${regra.hora_inicio}—${regra.hora_fim})?`,
                                () => removerRegra(regra.id),
                              )
                            }
                          >
                            <IconX size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* Create/Edit sheet */}
      {formAberto && (
        <AgendaRegraSheet
          form={form}
          setForm={setForm}
          editId={editId}
          salvando={salvando}
          onSalvar={handleSalvar}
          onRemover={(id) => {
            fecharForm();
            pedirConfirmacao(
              "Remover?",
              "Remover esta regra permanentemente?",
              () => removerRegra(id),
            );
          }}
          onFechar={fecharForm}
        />
      )}

      <ModalConfirmacao
        aberto={!!confirmacao}
        titulo={confirmacao?.titulo}
        descricao={confirmacao?.descricao}
        textoConfirmar="Confirmar"
        onConfirmar={async () => {
          if (confirmacao?.acao) await confirmacao.acao();
          setConfirmacao(null);
        }}
        onCancelar={() => setConfirmacao(null)}
      />
    </div>
  );
};

export default GestorMobileAgendaPage;
