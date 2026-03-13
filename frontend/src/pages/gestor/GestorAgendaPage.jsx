import React, { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "../../hooks/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorMessage, EmptyState } from "../../components/ui";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const DIAS_SEMANA = [
  { valor: 1, nome: "Segunda-feira", abreviacao: "Seg" },
  { valor: 2, nome: "Terça-feira", abreviacao: "Ter" },
  { valor: 3, nome: "Quarta-feira", abreviacao: "Qua" },
  { valor: 4, nome: "Quinta-feira", abreviacao: "Qui" },
  { valor: 5, nome: "Sexta-feira", abreviacao: "Sex" },
  { valor: 6, nome: "Sábado", abreviacao: "Sáb" },
  { valor: 0, nome: "Domingo", abreviacao: "Dom" }
];

export default function GestorAgendaPage() {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras, criarRegra, editarRegra: editarRegraApi, excluirRegra } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [regras, setRegras] = useState([]);

  const [regraForm, setRegraForm] = useState({
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
    precoHora: ""
  });
  const [regraEditandoId, setRegraEditandoId] = useState(null);
  const [regraEditando, setRegraEditando] = useState(null);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalLimparTodasAberto, setModalLimparTodasAberto] = useState(false);
  const [modalExcluirRegra, setModalExcluirRegra] = useState({ aberto: false, regraId: null });
  const [modalLimparDia, setModalLimparDia] = useState({ aberto: false, diaSemana: null, diaNome: "" });
  const [modalRemoverDoModal, setModalRemoverDoModal] = useState(false);
  const [salvandoRegra, setSalvandoRegra] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!usuario) return;
    carregarQuadras();
  }, [usuario]);

  useEffect(() => {
    if (quadraSelecionadaId) {
      carregarRegras();
    } else {
      setRegras([]);
    }
  }, [quadraSelecionadaId]);

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const data = await listarQuadrasApi();
      const quadrasData = Array.isArray(data) ? data : [];
      setQuadras(quadrasData);

      if (quadrasData.length > 0 && !quadraSelecionadaId) {
        setQuadraSelecionadaId(quadrasData[0].id);
      }
    } catch (err) {
      console.error("[AGENDA] Erro ao carregar quadras:", err);
      setErro("Erro ao carregar quadras.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRegras() {
    if (!quadraSelecionadaId) return;

    try {
      setCarregando(true);
      setErro("");
      const dataRegras = await listarRegras({ quadraId: quadraSelecionadaId });
      setRegras(dataRegras?.regras || []);
    } catch (err) {
      console.error("[AGENDA] Erro ao carregar regras:", err);
      setErro("Erro ao carregar regras.");
    } finally {
      setCarregando(false);
    }
  }

  function gerarHorarios(horaInicio, horaFim) {
    const horarios = [];
    const inicio = parseInt(horaInicio.split(":")[0]);
    const fim = parseInt(horaFim.split(":")[0]);
    for (let h = inicio; h < fim; h++) {
      horarios.push(String(h).padStart(2, "0") + ":00");
    }
    return horarios;
  }

  function corrigirHora(valor) {
    if (!valor) return valor;
    const [hora, minuto] = valor.split(":");
    return minuto && minuto !== "00" ? `${hora}:00` : valor;
  }

  function toggleDiaSemana(diaValor) {
    setRegraForm(prev => {
      const diasAtuais = prev.diasSemana || [];
      if (diasAtuais.includes(diaValor)) {
        return { ...prev, diasSemana: diasAtuais.filter(d => d !== diaValor) };
      }
      return { ...prev, diasSemana: [...diasAtuais, diaValor] };
    });
  }

  function getPrecoNumerico() {
    return Number(String(regraForm.precoHora).replace(",", ".").trim());
  }

  async function handleSalvarRegra(e) {
    e.preventDefault();

    if (!quadraSelecionadaId) {
      setErro("Selecione uma quadra antes de criar a regra.");
      return;
    }
    if (!regraForm.diasSemana || regraForm.diasSemana.length === 0) {
      setErro("Selecione pelo menos um dia da semana.");
      return;
    }
    if (!regraForm.horaInicio || !regraForm.horaFim) {
      setErro("Preencha os horários inicial e final.");
      return;
    }

    const horaInicioMatch = regraForm.horaInicio.match(/^(\d{2}):(\d{2})$/);
    const horaFimMatch = regraForm.horaFim.match(/^(\d{2}):(\d{2})$/);
    if (!horaInicioMatch || !horaFimMatch) {
      setErro("Formato de horário inválido. Use o formato HH:MM (ex: 08:00).");
      return;
    }

    const horaInicioNum = parseInt(regraForm.horaInicio.split(":")[0]);
    const horaFimNum = parseInt(regraForm.horaFim.split(":")[0]);
    const minutoInicio = parseInt(regraForm.horaInicio.split(":")[1]);
    const minutoFim = parseInt(regraForm.horaFim.split(":")[1]);

    if (minutoInicio !== 0 || minutoFim !== 0) {
      setErro("Os horários devem ser de hora em hora (ex: 08:00, 09:00).");
      setRegraForm({
        ...regraForm,
        horaInicio: String(horaInicioNum).padStart(2, "0") + ":00",
        horaFim: String(horaFimNum).padStart(2, "0") + ":00"
      });
      return;
    }

    if (horaInicioNum >= horaFimNum) {
      setErro("A hora final deve ser maior que a hora inicial.");
      return;
    }
    if (horaInicioNum < 0 || horaInicioNum > 23 || horaFimNum < 0 || horaFimNum > 23) {
      setErro("Os horários devem estar entre 00:00 e 23:00.");
      return;
    }
    if (!regraForm.precoHora || String(regraForm.precoHora).trim() === "") {
      setErro("O preço por hora é obrigatório.");
      return;
    }

    const precoHoraNum = getPrecoNumerico();
    if (isNaN(precoHoraNum) || precoHoraNum <= 0) {
      setErro("Preço por hora inválido. Informe um valor maior que zero (ex: 100 ou 100.50).");
      return;
    }

    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");

      const diasSemanaValidos = regraForm.diasSemana.filter(d =>
        !isNaN(Number(d)) && Number(d) >= 0 && Number(d) <= 6
      );
      if (diasSemanaValidos.length === 0) {
        setErro("Selecione pelo menos um dia da semana válido.");
        setSalvandoRegra(false);
        return;
      }

      if (regraEditandoId) {
        await editarRegraApi(regraEditandoId, {
          quadraId: quadraSelecionadaId,
          diaSemana: Number(regraForm.diasSemana[0]),
          horaInicio: regraForm.horaInicio,
          horaFim: regraForm.horaFim,
          precoHora: precoHoraNum,
          ativo: true
        });
        setMensagem("Regra atualizada com sucesso!");
      } else {
        await Promise.all(diasSemanaValidos.map(diaSemanaNum =>
          criarRegra({
            quadraId: quadraSelecionadaId,
            diaSemana: Number(diaSemanaNum),
            horaInicio: regraForm.horaInicio,
            horaFim: regraForm.horaFim,
            precoHora: precoHoraNum,
            ativo: true
          })
        ));
        const diasNomes = diasSemanaValidos.map(d => {
          const dia = DIAS_SEMANA.find(ds => ds.valor === Number(d));
          return dia ? dia.nome : d;
        }).join(", ");
        setMensagem(`Regras criadas com sucesso para: ${diasNomes}!`);
      }

      resetRegraForm();
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar regra:", err);
      if (err.response?.status === 409) {
        setErro("Já existe uma regra para este dia e horário. Use a opção 'Editar' para modificar ou remova a regra existente.");
      } else if (err.response?.status === 400) {
        setErro(err.response?.data?.error || "Dados inválidos. Verifique os campos preenchidos.");
      } else if (err.response?.status === 403) {
        setErro("Você não tem permissão para criar regras nesta quadra.");
      } else if (err.response?.status === 404) {
        setErro("Quadra não encontrada.");
      } else {
        setErro(err.response?.data?.error || "Erro ao salvar regra. Tente novamente.");
      }
    } finally {
      setSalvandoRegra(false);
    }
  }

  // --- Edit modal ---

  function iniciarEdicaoRegra(regra) {
    setRegraEditando(regra);
    setRegraEditandoId(regra.id);
    setRegraForm({
      diasSemana: [regra.dia_semana],
      horaInicio: regra.hora_inicio,
      horaFim: regra.hora_fim,
      precoHora: regra.preco_hora ? String(regra.preco_hora) : ""
    });
    setModalEdicaoAberto(true);
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false);
    setRegraEditando(null);
    resetRegraForm();
  }

  async function handleSalvarEdicaoModal(e) {
    e.preventDefault();
    if (!regraEditando) return;

    if (!regraForm.horaInicio || !regraForm.horaFim) {
      setErro("Preencha os horários inicial e final.");
      return;
    }

    const horaInicioMatch = regraForm.horaInicio.match(/^(\d{2}):(\d{2})$/);
    const horaFimMatch = regraForm.horaFim.match(/^(\d{2}):(\d{2})$/);
    if (!horaInicioMatch || !horaFimMatch) {
      setErro("Formato de horário inválido. Use o formato HH:MM (ex: 08:00).");
      return;
    }

    const horaInicioNum = parseInt(regraForm.horaInicio.split(":")[0]);
    const horaFimNum = parseInt(regraForm.horaFim.split(":")[0]);
    const minutoInicio = parseInt(regraForm.horaInicio.split(":")[1]);
    const minutoFim = parseInt(regraForm.horaFim.split(":")[1]);

    if (minutoInicio !== 0 || minutoFim !== 0) {
      setErro("Os horários devem ser de hora em hora (ex: 08:00, 09:00).");
      return;
    }
    if (horaInicioNum >= horaFimNum) {
      setErro("A hora final deve ser maior que a hora inicial.");
      return;
    }
    if (!regraForm.precoHora || String(regraForm.precoHora).trim() === "") {
      setErro("O preço por hora é obrigatório.");
      return;
    }

    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");

      const precoHoraNum = getPrecoNumerico();
      if (isNaN(precoHoraNum) || precoHoraNum <= 0) {
        setErro("Preço por hora inválido. Informe um valor maior que zero.");
        setSalvandoRegra(false);
        return;
      }

      await editarRegraApi(regraEditandoId, {
        quadraId: quadraSelecionadaId,
        diaSemana: regraEditando.dia_semana,
        horaInicio: regraForm.horaInicio,
        horaFim: regraForm.horaFim,
        precoHora: precoHoraNum,
        ativo: true
      });

      setMensagem("Regra atualizada com sucesso!");
      fecharModalEdicao();
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar edição:", err);
      if (err.response?.status === 409) {
        setErro("Já existe uma regra para este dia e horário.");
      } else if (err.response?.status === 400) {
        setErro(err.response?.data?.error || "Dados inválidos.");
      } else {
        setErro(err.response?.data?.error || "Erro ao atualizar regra.");
      }
    } finally {
      setSalvandoRegra(false);
    }
  }

  // --- Remove from edit modal ---

  async function handleRemoverDoModal() {
    if (!regraEditando) return;
    try {
      setErro("");
      setMensagem("");
      setModalRemoverDoModal(false);
      fecharModalEdicao();
      await excluirRegra(regraEditando.id);
      setMensagem("Regra removida com sucesso!");
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      setErro(err.response?.data?.error || "Erro ao remover regra.");
    }
  }

  // --- Delete single rule ---

  async function handleExcluirRegra() {
    const regraId = modalExcluirRegra.regraId;
    if (!regraId) {
      setErro("ID da regra não informado.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setModalExcluirRegra({ aberto: false, regraId: null });
      await excluirRegra(regraId);
      setMensagem("Regra removida com sucesso!");
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      if (err.response?.status === 404) {
        setErro("Regra não encontrada. Ela pode já ter sido removida.");
      } else if (err.response?.status === 403) {
        setErro("Você não tem permissão para remover esta regra.");
      } else {
        setErro(err.response?.data?.error || "Erro ao remover regra. Tente novamente.");
      }
    }
  }

  // --- Clear all rules ---

  function abrirModalLimparTodas() {
    if (regras.length === 0) {
      setErro("Não há regras para remover.");
      return;
    }
    setModalLimparTodasAberto(true);
  }

  async function handleLimparTodasRegras() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setModalLimparTodasAberto(false);
      await Promise.all(regras.map(regra => excluirRegra(regra.id)));
      setMensagem(`Todas as ${regras.length} regras foram removidas com sucesso!`);
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao limpar regras:", err);
      setErro(err.response?.data?.error || "Erro ao remover regras. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // --- Clear day rules ---

  function abrirModalLimparDia(diaSemana) {
    const dia = DIAS_SEMANA.find(d => d.valor === diaSemana);
    setModalLimparDia({ aberto: true, diaSemana, diaNome: dia?.nome || "" });
  }

  async function handleLimparDia() {
    const { diaSemana, diaNome } = modalLimparDia;
    const regrasDoDia = regras.filter(r => r.dia_semana === diaSemana);
    if (regrasDoDia.length === 0) {
      setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" });
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" });
      await Promise.all(regrasDoDia.map(regra => excluirRegra(regra.id)));
      setMensagem(`Regras de ${diaNome} removidas com sucesso!`);
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao limpar regras do dia:", err);
      setErro(err.response?.data?.error || "Erro ao remover regras.");
    } finally {
      setCarregando(false);
    }
  }

  // --- Reset ---

  function resetRegraForm() {
    setRegraForm({ diasSemana: [], horaInicio: "", horaFim: "", precoHora: "" });
    setRegraEditandoId(null);
  }

  function formatarNomeQuadra(quadra) {
    const tipo = quadra.tipo || "Quadra";
    const modalidade = quadra.modalidade || "";
    return modalidade ? `${tipo} - ${modalidade}` : tipo;
  }

  const regrasPorDia = DIAS_SEMANA.map(dia => ({
    ...dia,
    regras: regras.filter(r => r.dia_semana === dia.valor)
  }));

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                </svg>
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
                  {DIAS_SEMANA.map(dia => {
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
                          {regra.preco_hora ? formatBRL(regra.preco_hora) + "/hora" : "Sem preço definido"}
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
          <div className="vt-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="vt-modal-header">
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600 }}>Editar Regra de Horários</h3>
              <button type="button" className="vt-modal-close" onClick={fecharModalEdicao}>×</button>
            </div>
            <div className="vt-modal-body">
              <div className="rh-modal-info">
                <strong style={{ color: "var(--color-text)" }}>Dia da semana:</strong>{" "}
                {DIAS_SEMANA.find(d => d.valor === regraEditando.dia_semana)?.nome || "—"}
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

      {/* Modal de Confirmação - Remover do Modal de Edição */}
      {modalRemoverDoModal && regraEditando && (
        <div className="vt-modal-overlay" style={{ zIndex: 1100 }} onClick={(e) => { if (e.target === e.currentTarget) setModalRemoverDoModal(false); }}>
          <div className="vt-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="vt-modal-body" style={{ padding: 24 }}>
              <div className="rh-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#991b1b"/></svg>
              </div>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
                Remover esta Regra?
              </h3>
              <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                A regra de <strong>{DIAS_SEMANA.find(d => d.valor === regraEditando.dia_semana)?.nome}</strong> ({regraEditando.hora_inicio} às {regraEditando.hora_fim}) será permanentemente removida.
              </p>
              <div className="rh-modal-actions">
                <button type="button" className="btn-outlined" onClick={() => setModalRemoverDoModal(false)}>Cancelar</button>
                <button type="button" className="btn-danger-solid" onClick={handleRemoverDoModal} style={{ padding: "10px 20px" }}>Remover</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Excluir Regra Individual */}
      {modalExcluirRegra.aberto && (
        <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalExcluirRegra({ aberto: false, regraId: null }); }}>
          <div className="vt-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="vt-modal-body" style={{ padding: 24 }}>
              <div className="rh-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#991b1b"/></svg>
              </div>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
                Remover esta Regra?
              </h3>
              <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                Esta regra será permanentemente removida. Esta ação não pode ser desfeita.
              </p>
              <div className="rh-modal-actions">
                <button type="button" className="btn-outlined" onClick={() => setModalExcluirRegra({ aberto: false, regraId: null })}>Cancelar</button>
                <button type="button" className="btn-danger-solid" onClick={handleExcluirRegra} style={{ padding: "10px 20px" }}>Remover</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Limpar Todas as Regras */}
      {modalLimparTodasAberto && (
        <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalLimparTodasAberto(false); }}>
          <div className="vt-modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="vt-modal-body" style={{ padding: 24 }}>
              <div className="rh-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#991b1b"/></svg>
              </div>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
                Limpar Todas as Regras?
              </h3>
              <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                Tem certeza que deseja remover <strong>TODAS as {regras.length} regras</strong> desta quadra? Esta ação não pode ser desfeita e todas as regras de horários serão permanentemente excluídas.
              </p>
              <div className="rh-modal-actions">
                <button type="button" className="btn-outlined" onClick={() => setModalLimparTodasAberto(false)} disabled={carregando}>Cancelar</button>
                <button type="button" className="btn-danger-solid" onClick={handleLimparTodasRegras} disabled={carregando} style={{ padding: "10px 20px" }}>
                  {carregando ? "Removendo..." : "Sim, Limpar Todas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Limpar Dia */}
      {modalLimparDia.aberto && (
        <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" }); }}>
          <div className="vt-modal" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="vt-modal-body" style={{ padding: 24 }}>
              <div className="rh-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#991b1b"/></svg>
              </div>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
                Limpar Regras de {modalLimparDia.diaNome}?
              </h3>
              <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                Todas as regras de <strong>{modalLimparDia.diaNome}</strong> serão permanentemente removidas.
              </p>
              <div className="rh-modal-actions">
                <button type="button" className="btn-outlined" onClick={() => setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" })} disabled={carregando}>Cancelar</button>
                <button type="button" className="btn-danger-solid" onClick={handleLimparDia} disabled={carregando} style={{ padding: "10px 20px" }}>
                  {carregando ? "Removendo..." : "Sim, Limpar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
