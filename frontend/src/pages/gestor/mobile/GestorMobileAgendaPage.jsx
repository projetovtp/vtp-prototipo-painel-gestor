import React, { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "../../../hooks/api";
import { useAuth } from "../../../context/AuthContext";
import { ErrorMessage, EmptyState } from "../../../components/ui";

function formatBRL(v) { return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

const DIAS_SEMANA = [
  { valor: 1, nome: "Segunda-feira", abrev: "Seg" },
  { valor: 2, nome: "Terça-feira", abrev: "Ter" },
  { valor: 3, nome: "Quarta-feira", abrev: "Qua" },
  { valor: 4, nome: "Quinta-feira", abrev: "Qui" },
  { valor: 5, nome: "Sexta-feira", abrev: "Sex" },
  { valor: 6, nome: "Sábado", abrev: "Sáb" },
  { valor: 0, nome: "Domingo", abrev: "Dom" },
];

export default function GestorMobileAgendaPage() {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras, criarRegra, editarRegra: editarRegraApi, excluirRegra } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState("");
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ diasSemana: [], horaInicio: "", horaFim: "", precoHora: "" });
  const [editId, setEditId] = useState(null);

  const [confirmAberto, setConfirmAberto] = useState(false);
  const [confirmData, setConfirmData] = useState({ titulo: "", msg: "", acao: null });

  useEffect(() => { if (usuario) carregarQuadras(); }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (quadraId) carregarRegras(); else setRegras([]); }, [quadraId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarQuadras() {
    try { setCarregando(true); const d = await listarQuadrasApi(); const q = Array.isArray(d) ? d : []; setQuadras(q); if (q.length > 0 && !quadraId) setQuadraId(q[0].id); } catch { setErro("Erro ao carregar quadras."); } finally { setCarregando(false); }
  }

  async function carregarRegras() {
    if (!quadraId) return;
    try { setCarregando(true); setErro(""); const d = await listarRegras({ quadraId }); setRegras(d?.regras || []); } catch { setErro("Erro ao carregar regras."); } finally { setCarregando(false); }
  }

  function corrigirHora(v) { if (!v) return v; const [h, m] = v.split(":"); return m && m !== "00" ? `${h}:00` : v; }

  function toggleDia(val) {
    setForm((p) => ({ ...p, diasSemana: p.diasSemana.includes(val) ? p.diasSemana.filter((d) => d !== val) : [...p.diasSemana, val] }));
  }

  function abrirCriar() { setEditId(null); setForm({ diasSemana: [], horaInicio: "", horaFim: "", precoHora: "" }); setFormAberto(true); }

  function abrirEditar(regra) {
    setEditId(regra.id);
    setForm({ diasSemana: [regra.dia_semana], horaInicio: regra.hora_inicio, horaFim: regra.hora_fim, precoHora: regra.preco_hora ? String(regra.preco_hora) : "" });
    setFormAberto(true);
  }

  function fecharForm() { setFormAberto(false); setEditId(null); }

  function gerarHorarios(hi, hf) {
    const hs = [];
    for (let h = parseInt(hi.split(":")[0]); h < parseInt(hf.split(":")[0]); h++) hs.push(String(h).padStart(2, "0") + ":00");
    return hs;
  }

  async function handleSalvar() {
    if (!quadraId) { setErro("Selecione uma quadra."); return; }
    if (!form.diasSemana.length) { setErro("Selecione um dia."); return; }
    if (!form.horaInicio || !form.horaFim) { setErro("Preencha os horários."); return; }
    const hi = parseInt(form.horaInicio.split(":")[0]), hf = parseInt(form.horaFim.split(":")[0]);
    if (hi >= hf) { setErro("Hora final deve ser maior que inicial."); return; }
    const preco = Number(String(form.precoHora).replace(",", ".").trim());
    if (!preco || preco <= 0) { setErro("Preço inválido."); return; }

    try {
      setSalvando(true); setErro("");
      if (editId) {
        await editarRegraApi(editId, { quadraId, diaSemana: form.diasSemana[0], horaInicio: form.horaInicio, horaFim: form.horaFim, precoHora: preco, ativo: true });
        setMensagem("Regra atualizada!");
      } else {
        await Promise.all(form.diasSemana.map((ds) => criarRegra({ quadraId, diaSemana: Number(ds), horaInicio: form.horaInicio, horaFim: form.horaFim, precoHora: preco, ativo: true })));
        setMensagem("Regras criadas!");
      }
      fecharForm();
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (e) {
      if (e.response?.status === 409) setErro("Já existe regra para este dia/horário.");
      else setErro(e.response?.data?.error || "Erro ao salvar.");
    } finally { setSalvando(false); }
  }

  function pedirConfirmacao(titulo, msg, acao) { setConfirmData({ titulo, msg, acao }); setConfirmAberto(true); }
  function fecharConfirm() { setConfirmAberto(false); }
  async function executarConfirm() { if (confirmData.acao) await confirmData.acao(); fecharConfirm(); }

  async function removerRegra(id) {
    try { setErro(""); await excluirRegra(id); setMensagem("Regra removida!"); await carregarRegras(); setTimeout(() => setMensagem(""), 3000); } catch (e) { setErro(e.response?.data?.error || "Erro ao remover."); }
  }

  async function limparDia(diaSemana) {
    const rDia = regras.filter((r) => r.dia_semana === diaSemana);
    try { setCarregando(true); await Promise.all(rDia.map((r) => excluirRegra(r.id))); setMensagem("Regras do dia removidas!"); await carregarRegras(); setTimeout(() => setMensagem(""), 3000); } catch (e) { setErro(e.response?.data?.error || "Erro ao limpar dia."); } finally { setCarregando(false); }
  }

  async function limparTodas() {
    try { setCarregando(true); await Promise.all(regras.map((r) => excluirRegra(r.id))); setMensagem("Todas as regras removidas!"); await carregarRegras(); setTimeout(() => setMensagem(""), 3000); } catch (e) { setErro(e.response?.data?.error || "Erro ao limpar."); } finally { setCarregando(false); }
  }

  function fmtNomeQuadra(q) { return q.modalidade ? `${q.tipo || "Quadra"} - ${q.modalidade}` : q.tipo || "Quadra"; }

  const regrasPorDia = DIAS_SEMANA.map((d) => ({ ...d, regras: regras.filter((r) => r.dia_semana === d.valor) }));

  useEffect(() => {
    if (formAberto) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [formAberto]);

  return (
    <div className="mhr">
      {/* Court selector */}
      <div className="mhr-court-bar">
        <select className="mhr-court-select" value={quadraId} onChange={(e) => setQuadraId(e.target.value)}>
          <option value="">Selecione uma quadra</option>
          {quadras.map((q) => <option key={q.id} value={q.id}>{fmtNomeQuadra(q)}</option>)}
        </select>
      </div>

      {mensagem && <div className="mhr-toast">{mensagem}</div>}
      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {/* Content */}
      <div className="mhr-scroll">
        {!quadraId ? (
          <div className="mhr-center"><EmptyState titulo="Selecione uma quadra" compact /></div>
        ) : (
          <>
            {/* Header actions */}
            <div className="mhr-actions-bar">
              <button className="mhr-btn-add" onClick={abrirCriar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                Nova Regra
              </button>
              {regras.length > 0 && (
                <button className="mhr-btn-danger-sm" onClick={() => pedirConfirmacao("Limpar Todas?", `Remover todas as ${regras.length} regras?`, limparTodas)}>
                  Limpar Todas ({regras.length})
                </button>
              )}
            </div>

            {/* Rules by day */}
            {regras.length === 0 ? (
              <div className="mhr-empty">Nenhuma regra cadastrada. Toque em "Nova Regra" para começar.</div>
            ) : (
              regrasPorDia.map(({ valor, nome, abrev, regras: rDia }) => {
                if (!rDia.length) return null;
                return (
                  <div key={valor} className="mhr-day-group">
                    <div className="mhr-day-hdr">
                      <span className="mhr-day-name">{nome}</span>
                      <button className="mhr-day-clear" onClick={() => pedirConfirmacao(`Limpar ${nome}?`, `Remover todas as regras de ${nome}?`, () => limparDia(valor))}>
                        Limpar
                      </button>
                    </div>
                    {rDia.map((regra) => (
                      <div key={regra.id} className="mhr-regra-card">
                        <div className="mhr-regra-info">
                          <span className="mhr-regra-time">{regra.hora_inicio} — {regra.hora_fim}</span>
                          <span className="mhr-regra-price">{regra.preco_hora ? `${formatBRL(regra.preco_hora)}/h` : "Sem preço"}</span>
                        </div>
                        <div className="mhr-regra-btns">
                          <button className="mhr-regra-btn mhr-regra-btn--edit" onClick={() => abrirEditar(regra)}>Editar</button>
                          <button className="mhr-regra-btn mhr-regra-btn--rm" onClick={() => pedirConfirmacao("Remover?", `Remover regra de ${nome} (${regra.hora_inicio}—${regra.hora_fim})?`, () => removerRegra(regra.id))}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
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
        <div className="mhr-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharForm(); }}>
          <div className="mhr-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mhr-sheet-handle" />
            <div className="mhr-sheet-hdr">
              <span className="mhr-sheet-title">{editId ? "Editar Regra" : "Nova Regra"}</span>
              <button className="mhr-sheet-close" onClick={fecharForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="mhr-sheet-body">
              <label className="mhr-form-label">Dias da Semana</label>
              <div className="mhr-day-chips">
                {DIAS_SEMANA.map((d) => {
                  const sel = form.diasSemana.includes(d.valor);
                  const dis = !!editId && !sel;
                  return (
                    <button key={d.valor} className={`mhr-day-chip${sel ? " mhr-day-chip--sel" : ""}${dis ? " mhr-day-chip--dis" : ""}`} onClick={() => !dis && toggleDia(d.valor)} disabled={dis}>
                      {d.abrev}
                    </button>
                  );
                })}
              </div>

              <div className="mhr-form-row">
                <div className="mhr-form-field">
                  <label className="mhr-form-label">Hora Início</label>
                  <input className="mhr-form-input" type="time" step="3600" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: corrigirHora(e.target.value) })} />
                </div>
                <div className="mhr-form-field">
                  <label className="mhr-form-label">Hora Fim</label>
                  <input className="mhr-form-input" type="time" step="3600" value={form.horaFim} onChange={(e) => setForm({ ...form, horaFim: corrigirHora(e.target.value) })} />
                </div>
              </div>

              <label className="mhr-form-label">Preço por Hora (R$)</label>
              <input className="mhr-form-input" type="number" step="0.01" min="0" value={form.precoHora} onChange={(e) => setForm({ ...form, precoHora: e.target.value })} placeholder="Ex: 100.00" />

              {form.horaInicio && form.horaFim && parseInt(form.horaInicio) < parseInt(form.horaFim) && (
                <div className="mhr-preview">Horários: {gerarHorarios(form.horaInicio, form.horaFim).join(", ")}</div>
              )}

              <div className="mhr-form-actions">
                {editId && (
                  <button className="mhr-btn-danger-full" onClick={() => { fecharForm(); pedirConfirmacao("Remover?", "Remover esta regra permanentemente?", () => removerRegra(editId)); }}>
                    Remover
                  </button>
                )}
                <button className="mhr-btn-brand-full" onClick={handleSalvar} disabled={salvando}>
                  {salvando ? "Salvando..." : editId ? "Salvar" : "Criar Regra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation popup */}
      {confirmAberto && (
        <div className="mcl-confirm-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharConfirm(); }}>
          <div className="mcl-confirm">
            <div className="mcl-confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2" /><line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div className="mcl-confirm-title">{confirmData.titulo}</div>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-xl)", textAlign: "center" }}>{confirmData.msg}</div>
            <div className="mcl-confirm-actions">
              <button className="mcl-confirm-btn mcl-confirm-btn--secondary" onClick={fecharConfirm}>Cancelar</button>
              <button className="mcl-confirm-btn mcl-confirm-btn--danger" onClick={executarConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
