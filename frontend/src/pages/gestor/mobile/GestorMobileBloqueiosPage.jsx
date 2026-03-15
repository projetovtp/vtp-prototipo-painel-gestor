import React, { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "../../../hooks/api";
import { useAuth } from "../../../context/AuthContext";
import { ErrorMessage } from "../../../components/ui";

function fmtDateBR(d) { if (!d) return "—"; const [y, m, dd] = String(d).slice(0, 10).split("-"); return `${dd}/${m}/${y}`; }

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function GestorMobileBloqueiosPage() {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarBloqueios, criarBloqueiosLote, excluirBloqueio } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState("");
  const [bloqueios, setBloqueios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [bloquearTodas, setBloquearTodas] = useState(false);
  const [qtdQuadras, setQtdQuadras] = useState(1);

  const [mesSel, setMesSel] = useState(new Date());
  const [dataSel, setDataSel] = useState("");
  const [horasSel, setHorasSel] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  const [confirmAberto, setConfirmAberto] = useState(false);
  const [confirmData, setConfirmData] = useState({ titulo: "", msg: "", acao: null });

  useEffect(() => { if (usuario) carregarQuadras(); }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (quadraId) { carregarBloqueios(); setBloquearTodas(false); setQtdQuadras(1); } else setBloqueios([]); }, [quadraId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarQuadras() {
    try { setCarregando(true); const d = await listarQuadrasApi(); const q = Array.isArray(d) ? d : []; setQuadras(q); if (q.length > 0 && !quadraId) setQuadraId(q[0].id); } catch { setErro("Erro ao carregar quadras."); } finally { setCarregando(false); }
  }

  async function carregarBloqueios() {
    if (!quadraId) return;
    try { setCarregando(true); const d = await listarBloqueios({ quadraId }); setBloqueios(d?.bloqueios || []); } catch { setErro("Erro ao carregar bloqueios."); } finally { setCarregando(false); }
  }

  function fmtNomeQuadra(q) { return q.modalidade ? `${q.tipo || "Quadra"} - ${q.modalidade}` : q.tipo || "Quadra"; }

  function getGrupo() {
    if (!quadraId || !quadras.length) return null;
    const sel = quadras.find((q) => q.id === quadraId);
    if (!sel) return null;
    const nome = fmtNomeQuadra(sel);
    return quadras.filter((q) => fmtNomeQuadra(q) === nome);
  }

  function getQuadrasParaBloquear() {
    const g = getGrupo();
    if (!g || g.length <= 1) return [quadraId];
    if (bloquearTodas) return g.map((q) => q.id);
    return g.slice(0, Math.min(qtdQuadras, g.length)).map((q) => q.id);
  }

  function diasDoMes() {
    const a = mesSel.getFullYear(), m = mesSel.getMonth();
    const primeiro = new Date(a, m, 1), ultimo = new Date(a, m + 1, 0);
    const diasArr = [];
    for (let i = 0; i < primeiro.getDay(); i++) diasArr.push(null);
    for (let dia = 1; dia <= ultimo.getDate(); dia++) {
      const iso = `${a}-${String(m + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      diasArr.push({ dia, data: iso, bloqueado: bloqueios.some((b) => b.data === iso) });
    }
    return diasArr;
  }

  function getHorasBloqueadas() {
    if (!dataSel) return [];
    const bDia = bloqueios.filter((b) => b.data === dataSel);
    const hbs = [];
    bDia.forEach((b) => {
      const hi = parseInt(b.hora_inicio?.split(":")[0] || 0), hf = parseInt(b.hora_fim?.split(":")[0] || 23);
      for (let h = hi; h < hf; h++) { const hr = String(h).padStart(2, "0") + ":00"; if (!hbs.includes(hr)) hbs.push(hr); }
    });
    return hbs;
  }

  function toggleHora(h) { setHorasSel((p) => p.includes(h) ? p.filter((x) => x !== h) : [...p, h]); }

  function pedirConfirmacao(titulo, msg, acao) { setConfirmData({ titulo, msg, acao }); setConfirmAberto(true); }
  function fecharConfirm() { setConfirmAberto(false); }
  async function executarConfirm() { if (confirmData.acao) await confirmData.acao(); fecharConfirm(); }

  async function salvarBloqueios() {
    if (!dataSel || !horasSel.length) { setErro("Selecione data e horários."); return; }
    try {
      setSalvando(true); setErro("");
      const hi = Math.min(...horasSel.map((h) => parseInt(h))), hf = Math.max(...horasSel.map((h) => parseInt(h))) + 1;
      await criarBloqueiosLote({ quadraIds: getQuadrasParaBloquear(), data: dataSel, horaInicio: String(hi).padStart(2, "0") + ":00", horaFim: String(hf).padStart(2, "0") + ":00", motivo: "Bloqueio manual" });
      setMensagem("Horários bloqueados!"); setDataSel(""); setHorasSel([]); setBloquearTodas(false); setQtdQuadras(1);
      await carregarBloqueios(); setTimeout(() => setMensagem(""), 3000);
    } catch (e) { setErro(e.response?.data?.error || "Erro ao bloquear."); } finally { setSalvando(false); }
  }

  async function bloquearDia() {
    if (!dataSel) { setErro("Selecione uma data."); return; }
    try {
      setSalvando(true); setErro("");
      await criarBloqueiosLote({ quadraIds: getQuadrasParaBloquear(), data: dataSel, horaInicio: "00:00", horaFim: "23:59", motivo: "Bloqueio dia inteiro" });
      setMensagem("Dia inteiro bloqueado!"); setDataSel(""); setHorasSel([]); setBloquearTodas(false); setQtdQuadras(1);
      await carregarBloqueios(); setTimeout(() => setMensagem(""), 3000);
    } catch (e) { setErro(e.response?.data?.error || "Erro ao bloquear dia."); } finally { setSalvando(false); }
  }

  async function desbloquearHoras() {
    if (!dataSel || !horasSel.length) { setErro("Selecione horários para desbloquear."); return; }
    try {
      setRemovendo(true); setErro("");
      const bDia = bloqueios.filter((b) => b.data === dataSel);
      const ids = new Set();
      horasSel.forEach((h) => {
        const hr = parseInt(h);
        const b = bDia.find((b) => { const hi = parseInt(b.hora_inicio?.split(":")[0] || 0), hf = parseInt(b.hora_fim?.split(":")[0] || 23); return hr >= hi && hr < hf; });
        if (b) ids.add(b.id);
      });
      await Promise.all([...ids].map((id) => excluirBloqueio(id)));
      setMensagem("Horários desbloqueados!"); setDataSel(""); setHorasSel([]);
      await carregarBloqueios(); setTimeout(() => setMensagem(""), 3000);
    } catch (e) { setErro(e.response?.data?.error || "Erro ao desbloquear."); } finally { setRemovendo(false); }
  }

  async function desbloquearDia() {
    if (!dataSel) return;
    try {
      setRemovendo(true); setErro("");
      await Promise.all(bloqueios.filter((b) => b.data === dataSel).map((b) => excluirBloqueio(b.id)));
      setMensagem("Dia desbloqueado!"); setDataSel(""); setHorasSel([]);
      await carregarBloqueios(); setTimeout(() => setMensagem(""), 3000);
    } catch (e) { setErro(e.response?.data?.error || "Erro ao desbloquear dia."); } finally { setRemovendo(false); }
  }

  const isOp = salvando || removendo;
  const horasBloq = getHorasBloqueadas();
  const diaBloqueado = dataSel && bloqueios.some((b) => b.data === dataSel);
  const grupo = getGrupo();
  const totalGrupo = grupo ? grupo.length : 1;
  const temMultiplas = totalGrupo > 1;

  useEffect(() => {
    if (dataSel) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [dataSel]);

  return (
    <div className="mhr">
      {/* Court selector */}
      <div className="mhr-court-bar">
        <select className="mhr-court-select" value={quadraId} onChange={(e) => { setQuadraId(e.target.value); setDataSel(""); setHorasSel([]); }}>
          <option value="">Selecione uma quadra</option>
          {quadras.map((q) => <option key={q.id} value={q.id}>{fmtNomeQuadra(q)}</option>)}
        </select>
      </div>

      {mensagem && <div className="mhr-toast">{mensagem}</div>}
      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      <div className="mhr-scroll">
        {!quadraId ? (
          <div className="mhr-center" style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>Selecione uma quadra para gerenciar bloqueios</div>
        ) : (
          <>
            {/* Calendar */}
            <div className="mbl-cal-nav">
              <button className="mbl-cal-arrow" onClick={() => { const n = new Date(mesSel); n.setMonth(n.getMonth() - 1); setMesSel(n); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="mbl-cal-month">{MESES[mesSel.getMonth()]} {mesSel.getFullYear()}</span>
              <button className="mbl-cal-arrow" onClick={() => { const n = new Date(mesSel); n.setMonth(n.getMonth() + 1); setMesSel(n); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            <div className="mbl-cal-grid">
              {DIAS_ABREV.map((d) => <div key={d} className="mbl-cal-hdr">{d}</div>)}
              {diasDoMes().map((d, i) =>
                !d ? <div key={`e${i}`} /> : (
                  <button key={d.dia} className={`mbl-cal-day${dataSel === d.data ? " mbl-cal-day--sel" : d.bloqueado ? " mbl-cal-day--blk" : ""}`} onClick={() => { setDataSel(d.data); setHorasSel([]); }}>
                    {d.dia}
                  </button>
                )
              )}
            </div>

            {/* Legend */}
            <div className="mbl-legend">
              <span className="mbl-legend-item"><span className="mbl-legend-dot mbl-legend-dot--free" /> Livre</span>
              <span className="mbl-legend-item"><span className="mbl-legend-dot mbl-legend-dot--blk" /> Bloqueado</span>
              <span className="mbl-legend-item"><span className="mbl-legend-dot mbl-legend-dot--sel" /> Selecionado</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom sheet for time selection */}
      {dataSel && (
        <div className="mbl-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setDataSel(""); setHorasSel([]); } }}>
          <div className="mbl-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mbl-sheet-handle" />
            <div className="mbl-sheet-hdr">
              <span className="mbl-sheet-title">{fmtDateBR(dataSel)}</span>
              <button className="mhr-sheet-close" onClick={() => { setDataSel(""); setHorasSel([]); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="mbl-sheet-scroll">
              {temMultiplas && (
                <div className="mbl-quadra-multi">
                  <span className="mbl-quadra-multi-label">{totalGrupo} quadras do mesmo tipo</span>
                  <label className="mbl-quadra-multi-chk">
                    <input type="checkbox" checked={bloquearTodas} onChange={(e) => { setBloquearTodas(e.target.checked); if (e.target.checked) setQtdQuadras(totalGrupo); }} />
                    Todas
                  </label>
                  {!bloquearTodas && (
                    <select className="mbl-quadra-multi-sel" value={qtdQuadras} onChange={(e) => setQtdQuadras(Number(e.target.value))}>
                      {Array.from({ length: totalGrupo }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} quadra{n > 1 ? "s" : ""}</option>)}
                    </select>
                  )}
                </div>
              )}

              {diaBloqueado && (
                <div className="mbl-alert-blocked">
                  <span>Este dia possui bloqueios</span>
                  <button className="mbl-btn-unblock-sm" onClick={() => pedirConfirmacao("Desbloquear dia inteiro?", `Desbloquear todos os horários de ${fmtDateBR(dataSel)}?`, desbloquearDia)} disabled={removendo}>
                    {removendo ? "..." : "Desbloquear Dia"}
                  </button>
                </div>
              )}

              <div className="mbl-hours-label">Selecione os horários:</div>
              <div className="mbl-hours-grid">
                {Array.from({ length: 18 }, (_, i) => {
                  const h = i + 6;
                  const hr = String(h).padStart(2, "0") + ":00";
                  const sel = horasSel.includes(hr);
                  const blk = horasBloq.includes(hr);
                  return (
                    <button key={hr} className={`mbl-hour-btn${blk ? " mbl-hour-btn--blk" : ""}${sel ? " mbl-hour-btn--sel" : ""}`} onClick={() => toggleHora(hr)} disabled={isOp}>
                      {hr}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="mbl-sheet-actions">
                {horasSel.length > 0 && (
                  horasSel.some((h) => horasBloq.includes(h)) ? (
                    <button className="mhr-btn-danger-full" onClick={() => pedirConfirmacao("Desbloquear?", `Desbloquear ${horasSel.length} horário(s)?`, desbloquearHoras)} disabled={isOp}>
                      {removendo ? "Desbloqueando..." : `Desbloquear ${horasSel.length} horário(s)`}
                    </button>
                  ) : (
                    <button className="mhr-btn-brand-full" onClick={salvarBloqueios} disabled={isOp}>
                      {salvando ? "Bloqueando..." : `Bloquear ${horasSel.length} horário(s)`}
                    </button>
                  )
                )}
                {!diaBloqueado && (
                  <button className="mhr-btn-danger-full" onClick={() => pedirConfirmacao("Bloquear dia inteiro?", `Bloquear todos os horários de ${fmtDateBR(dataSel)}?`, bloquearDia)} disabled={isOp}>
                    {salvando ? "Bloqueando..." : "Bloquear Dia Inteiro"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm popup */}
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
