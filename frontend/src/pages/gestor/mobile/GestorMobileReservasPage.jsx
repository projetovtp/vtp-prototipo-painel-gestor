import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useGestorReservas, useGestorQuadras, useGestorAgenda } from "../../../hooks/api";
import { ErrorMessage, LoadingSpinner, EmptyState } from "../../../components/ui";

import {
  formatarDataBR,
  formatarMoeda,
  formatarCPF,
  formatarTelefone,
  formatarNomeQuadra,
  agregarSlotsGrupo,
} from "../../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES } from "../../../utils/constants";

const GestorMobileReservasPage = () => {
  const { listar: listarReservasApi, cancelar: cancelarReserva, criar: criarReserva } = useGestorReservas();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras } = useGestorAgenda();

  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erro, setErro] = useState("");

  const [modo, setModo] = useState("dia");
  const [dataSel, setDataSel] = useState(() => new Date().toISOString().split("T")[0]);
  const [mesAtual, setMesAtual] = useState(() => { const h = new Date(); return new Date(h.getFullYear(), h.getMonth(), 1); });
  const [diaClicado, setDiaClicado] = useState(null);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [reservaSel, setReservaSel] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const [novaAberta, setNovaAberta] = useState(false);
  const [novaData, setNovaData] = useState(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarReservas(); carregarRegrasHorarios(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const data = modo === "dia" ? dataSel : diaClicado;
    if (data) carregarSlotsTodasQuadras(data);
  }, [modo, dataSel, diaClicado, quadras, reservas, regrasHorarios]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sheetAberto || novaAberta) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }
  }, [sheetAberto, novaAberta]);

  const carregarReservas = async () => {
    try {
      setCarregando(true); setErro("");
      const dados = await listarReservasApi() || {};
      setReservas(dados.reservas || []);
      let qc = dados.quadras || [];
      const expandidas = [];
      const porNome = {};
      qc.forEach((q) => { const n = formatarNomeQuadra(q); if (!porNome[n]) porNome[n] = []; porNome[n].push(q); });
      Object.entries(porNome).forEach(([n, grupo]) => {
        if (n.toLowerCase().includes("beach tennis")) { const p = grupo[0]; for (let i = grupo.length; i < 6; i++) expandidas.push({ ...p, id: `bt-${i + 1}-${p.id}` }); }
        if (n.toLowerCase().includes("pádel") || n.toLowerCase().includes("padel")) { const p = grupo[0]; for (let i = grupo.length; i < 3; i++) expandidas.push({ ...p, id: `pd-${i + 1}-${p.id}` }); }
      });
      setQuadras([...qc, ...expandidas]);
    } catch (e) { setErro(e?.response?.data?.error || "Erro ao carregar reservas."); } finally { setCarregando(false); }
  };

  const carregarRegrasHorarios = async () => {
    try {
      const dq = await listarQuadrasApi();
      const qd = Array.isArray(dq) ? dq : dq?.quadras || [];
      const all = [];
      for (const q of qd) { try { const dr = await listarRegras({ quadraId: q.id }); (dr?.regras || []).forEach((r) => all.push({ ...r, quadra_id: q.id })); } catch { /* next */ } }
      setRegrasHorarios(all);
    } catch { /* silent */ }
  };

  const dataTemRegras = useCallback((iso) => {
    if (!iso || regrasHorarios.length === 0) return false;
    return regrasHorarios.some((r) => r.dia_semana === new Date(`${iso}T12:00:00`).getDay());
  }, [regrasHorarios]);

  const gerarReservasExemplo = useCallback((qId, dataISO, horaStr) => {
    if (!quadras.length) return { status: "DISPONIVEL", reserva: null, bloqueio: null };
    const quadra = quadras.find((q) => q.id === qId);
    if (!quadra) return { status: "DISPONIVEL", reserva: null, bloqueio: null };
    const nm = formatarNomeQuadra(quadra);
    const hora = parseInt(horaStr.split(":")[0]);
    const hash = String(qId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);

    if (nm.toLowerCase().includes("beach tennis")) {
      const idx = hash % 6;
      if (hora === 14 && idx === 0) return { status: "RESERVADO", reserva: { id: `rp-${qId}-${dataISO}-${horaStr}`, user_cpf: "123.456.789-00", phone: "(11) 98765-4321", preco_total: 150, pago_via_pix: true, nome: "João Silva", quadra_id: qId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (hora === 14 && idx === 1) return { status: "RESERVADO", reserva: { id: `rn-${qId}-${dataISO}-${horaStr}`, user_cpf: "987.654.321-00", phone: "(11) 91234-5678", preco_total: 150, pago_via_pix: false, nome: "Maria Santos", quadra_id: qId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (idx === 0 && (hora === 9 || hora === 10)) return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bl-${qId}-${dataISO}-${horaStr}` }, reserva: null };
      if (idx === 3 && (hora === 18 || hora === 19)) return { status: "RESERVADO", reserva: { id: `rp2-${qId}-${dataISO}-${horaStr}`, user_cpf: "111.222.333-44", phone: "(11) 99876-5432", preco_total: 150, pago_via_pix: true, nome: "Pedro Oliveira", quadra_id: qId, data: dataISO, hora: horaStr }, bloqueio: null };
    }
    if (nm.toLowerCase().includes("pádel") || nm.toLowerCase().includes("padel")) {
      const idx = hash % 3;
      if (idx === 0 && (hora === 11 || hora === 12)) return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bl-${qId}-${dataISO}-${horaStr}` }, reserva: null };
      if (idx === 1 && (hora === 18 || hora === 19)) return { status: "RESERVADO", reserva: { id: `rp3-${qId}-${dataISO}-${horaStr}`, user_cpf: "555.666.777-88", phone: "(11) 97654-3210", preco_total: 200, pago_via_pix: true, nome: "Ana Costa", quadra_id: qId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (idx === 2 && (hora === 20 || hora === 21)) return { status: "RESERVADO", reserva: { id: `rn2-${qId}-${dataISO}-${horaStr}`, user_cpf: "999.888.777-66", phone: "(11) 96543-2109", preco_total: 200, pago_via_pix: false, nome: "Carlos Mendes", quadra_id: qId, data: dataISO, hora: horaStr }, bloqueio: null };
    }
    const real = reservas.find((r) => { const rd = (r.data || "").split("T")[0]; const rh = r.hora || r.hora_inicio || ""; return r.quadra_id === qId && rd === dataISO && rh.startsWith(horaStr.split(":")[0]); });
    if (real) return { status: "RESERVADO", reserva: { id: real.id, user_cpf: real.user_cpf, phone: real.phone, preco_total: real.preco_total, pago_via_pix: real.pago_via_pix, nome: real.nome || real.user_name }, bloqueio: null };
    return { status: "DISPONIVEL", reserva: null, bloqueio: null };
  }, [quadras, reservas]);

  const gerarSlotsMock = useCallback((dataISO) => {
    if (!dataISO || !quadras.length) return {};
    const result = {};
    const diaSemana = new Date(`${dataISO}T12:00:00`).getDay();
    quadras.forEach((q) => {
      const regras = regrasHorarios.filter((r) => r.quadra_id === q.id && r.dia_semana === diaSemana);
      const slots = [];
      const gerar = (hi, hf, preco) => {
        for (let h = hi; h < hf; h++) {
          const hs = `${String(h).padStart(2, "0")}:00`;
          const hfs = `${String(h + 1).padStart(2, "0")}:00`;
          const ex = gerarReservasExemplo(q.id, dataISO, hs);
          slots.push({ data: dataISO, hora: hs, hora_fim: hfs, status: ex.status, preco_hora: preco, reserva: ex.reserva, bloqueio: ex.bloqueio });
        }
      };
      if (!regras.length) gerar(8, 22, 100);
      else regras.forEach((r) => gerar(parseInt(r.hora_inicio.split(":")[0]), parseInt(r.hora_fim.split(":")[0]), r.preco_hora || 100));
      result[q.id] = slots.sort((a, b) => a.hora.localeCompare(b.hora));
    });
    return result;
  }, [quadras, regrasHorarios, gerarReservasExemplo]);

  const carregarSlotsTodasQuadras = useCallback((dataISO) => {
    if (!dataISO || !quadras.length) { setSlotsPorQuadra({}); return; }
    setCarregandoSlots(true);
    setSlotsPorQuadra(gerarSlotsMock(dataISO));
    setCarregandoSlots(false);
  }, [quadras, gerarSlotsMock]);

  const gruposQuadras = useMemo(() => {
    const g = {};
    quadras.forEach((q) => { const n = formatarNomeQuadra(q); if (!g[n]) g[n] = []; g[n].push(q); });
    return g;
  }, [quadras]);

  const agregarSlots = useCallback(
    (grupo) => agregarSlotsGrupo(grupo, slotsPorQuadra),
    [slotsPorQuadra]
  );

  // Navigation
  const avancarDia = () => { const d = new Date(`${dataSel}T12:00:00`); d.setDate(d.getDate() + 1); setDataSel(d.toISOString().split("T")[0]); };
  const retrocederDia = () => { const d = new Date(`${dataSel}T12:00:00`); d.setDate(d.getDate() - 1); setDataSel(d.toISOString().split("T")[0]); };
  const avancarSemana = () => { const d = new Date(dataSel); d.setDate(d.getDate() + 7); setDataSel(d.toISOString().split("T")[0]); };
  const retrocederSemana = () => { const d = new Date(dataSel); d.setDate(d.getDate() - 7); setDataSel(d.toISOString().split("T")[0]); };
  const avancarMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  const retrocederMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  const irParaHoje = () => { const h = new Date(); setDataSel(h.toISOString().split("T")[0]); setMesAtual(new Date(h.getFullYear(), h.getMonth(), 1)); setDiaClicado(null); setModo("dia"); };

  // Sheet handlers
  function abrirDetalhes(reservasSlot) {
    if (!reservasSlot || !reservasSlot.length) return;
    setReservaSel(reservasSlot);
    setSheetAberto(true);
  }

  function abrirNova(horaSlot, grupoQuadras) {
    const q = grupoQuadras[0];
    const dataAtual = modo === "dia" ? dataSel : diaClicado;
    setNovaData({ quadra_id: q.id, data: dataAtual, hora: horaSlot, quadra: q, preco_hora: 100 });
    setNome(""); setCpf(""); setPhone(""); setValor(""); setErro("");
    setNovaAberta(true);
  }

  async function handleCancelar(reservaId) {
    try {
      setCancelando(true); setErro("");
      await cancelarReserva(reservaId);
      handleMudanca();
      setSheetAberto(false);
    } catch (e) { setErro(e?.response?.data?.error || "Erro ao cancelar."); } finally { setCancelando(false); }
  }

  async function handleCriarReserva() {
    if (!cpf || !nome) { setErro("Informe CPF e nome."); return; }
    try {
      setSalvando(true); setErro("");
      const body = { quadraId: novaData.quadra_id, data: novaData.data, hora: novaData.hora, nome, cpf, phone };
      if (valor) body.valor = Number(valor);
      await criarReserva(body);
      handleMudanca();
      setNovaAberta(false);
    } catch (e) { setErro(e?.response?.data?.error || "Erro ao criar."); } finally { setSalvando(false); }
  }

  function handleMudanca() {
    carregarReservas();
    const data = modo === "dia" ? dataSel : diaClicado;
    if (data) carregarSlotsTodasQuadras(data);
  }

  // Date label
  function labelData() {
    if (modo === "dia") {
      const d = new Date(`${dataSel}T12:00:00`);
      return `${DIAS_SEMANA_ABREVIADOS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
    }
    if (modo === "mes") return `${MESES[mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;
    const ref = new Date(`${dataSel}T12:00:00`);
    const ini = new Date(ref); ini.setDate(ref.getDate() - ref.getDay());
    const fim = new Date(ini); fim.setDate(ini.getDate() + 6);
    return `${ini.getDate()} ${MESES[ini.getMonth()].slice(0, 3)} — ${fim.getDate()} ${MESES[fim.getMonth()].slice(0, 3)}`;
  }

  // Weekly days
  function getDiasSemana() {
    const ref = new Date(`${dataSel}T12:00:00`);
    const ini = new Date(ref); ini.setDate(ref.getDate() - ref.getDay());
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ini); d.setDate(ini.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const rDia = reservas.filter((r) => r.data === iso);
      dias.push({ dia: d.getDate(), data: iso, nomeDia: DIAS_SEMANA_ABREVIADOS[d.getDay()], temRegras: dataTemRegras(iso), temReservas: rDia.length > 0, qtd: rDia.length });
    }
    return dias;
  }

  // Monthly days
  function getDiasMes() {
    const ano = mesAtual.getFullYear(), mes = mesAtual.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < primeiro.getDay(); i++) cells.push(null);
    for (let d = 1; d <= diasNoMes; d++) {
      const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const rDia = reservas.filter((r) => r.data === iso);
      cells.push({ dia: d, data: iso, temRegras: dataTemRegras(iso), temReservas: rDia.length > 0, qtd: rDia.length });
    }
    return cells;
  }

  const handleNav = modo === "dia" ? { prev: retrocederDia, next: avancarDia } : modo === "semana" ? { prev: retrocederSemana, next: avancarSemana } : { prev: retrocederMes, next: avancarMes };

  return (
    <div className="mrsv">
      {/* Mode tabs */}
      <div className="mrsv-tabs">
        {[["dia", "Dia"], ["semana", "Semana"], ["mes", "Mês"]].map(([k, l]) => (
          <button key={k} className={`mrsv-tab${modo === k ? " mrsv-tab--active" : ""}`} onClick={() => { setModo(k); setDiaClicado(null); }}>{l}</button>
        ))}
      </div>

      {/* Date nav */}
      <div className="mrsv-nav">
        <button className="mrsv-nav-btn" onClick={handleNav.prev}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="mrsv-nav-label">{labelData()}</div>
        <button className="mrsv-nav-btn" onClick={handleNav.next}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="mrsv-hoje-btn" onClick={irParaHoje}>Hoje</button>
      </div>

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {/* Content */}
      <div className="mrsv-scroll">
        {carregando ? <div className="mrsv-center"><LoadingSpinner mensagem="Carregando..." tamanho={24} /></div> : (
          <>
            {/* Day view */}
            {modo === "dia" && renderSlots()}

            {/* Week view */}
            {modo === "semana" && !diaClicado && (
              <div className="mrsv-week-grid">
                {getDiasSemana().map((d) => (
                  <button key={d.data} className={`mrsv-week-card${d.temReservas ? " mrsv-week-card--has" : ""}${!d.temRegras ? " mrsv-week-card--off" : ""}`} onClick={() => d.temRegras && setDiaClicado(d.data)} disabled={!d.temRegras}>
                    <span className="mrsv-week-card-day">{d.nomeDia}</span>
                    <span className="mrsv-week-card-num">{d.dia}</span>
                    {d.temReservas && <span className="mrsv-week-card-badge">{d.qtd}</span>}
                    {!d.temRegras && <span className="mrsv-week-card-off">Sem regras</span>}
                  </button>
                ))}
              </div>
            )}
            {modo === "semana" && diaClicado && (
              <>
                <button className="mrsv-back" onClick={() => setDiaClicado(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Voltar • {formatarDataBR(diaClicado)}
                </button>
                {renderSlots()}
              </>
            )}

            {/* Month view */}
            {modo === "mes" && !diaClicado && (
              <>
                <div className="mrsv-month-wd">{DIAS_SEMANA_ABREVIADOS.map((d) => <div key={d} className="mrsv-month-wd-cell">{d}</div>)}</div>
                <div className="mrsv-month-grid">
                  {getDiasMes().map((d, i) => {
                    if (!d) return <div key={`e-${i}`} className="mrsv-month-cell" />;
                    const isHoje = d.data === new Date().toISOString().split("T")[0];
                    return (
                      <button key={d.data} className={`mrsv-month-cell mrsv-month-cell--day${d.temReservas ? " mrsv-month-cell--has" : ""}${isHoje ? " mrsv-month-cell--today" : ""}${!d.temRegras ? " mrsv-month-cell--off" : ""}`} onClick={() => d.temRegras && setDiaClicado(d.data)} disabled={!d.temRegras}>
                        <span className="mrsv-month-num">{d.dia}</span>
                        {d.temReservas && <span className="mrsv-month-badge">{d.qtd}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {modo === "mes" && diaClicado && (
              <>
                <button className="mrsv-back" onClick={() => setDiaClicado(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Voltar • {formatarDataBR(diaClicado)}
                </button>
                {renderSlots()}
              </>
            )}
          </>
        )}
      </div>

      {/* Reservation detail sheet */}
      {sheetAberto && reservaSel && (
        <div className="mrsv-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSheetAberto(false); }}>
          <div className="mrsv-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mrsv-sheet-handle" />
            <div className="mrsv-sheet-fixed">
              <div className="mrsv-sheet-hdr">
                <span className="mrsv-sheet-title">Detalhes {reservaSel.length > 1 ? `(${reservaSel.length})` : ""}</span>
                <button className="mrsv-sheet-close" onClick={() => setSheetAberto(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
            <div className="mrsv-sheet-scroll">
              <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />
              {reservaSel.map((r, i) => (
                <div key={r.id || i} className="mrsv-detail-card">
                  <div className="mrsv-detail-top">
                    <span className="mrsv-detail-quadra">{formatarNomeQuadra(quadras.find((q) => q.id === r.quadra_id))}</span>
                    <span className={`mrsv-detail-badge mrsv-detail-badge--${r.pago_via_pix ? "pago" : "pendente"}`}>{r.pago_via_pix ? "Reservado" : "Pendente"}</span>
                  </div>
                  <div className="mrsv-detail-row">{formatarDataBR(r.data)} • {r.hora}</div>
                  {r.nome && <div className="mrsv-detail-row"><strong>Cliente:</strong> {r.nome}</div>}
                  {r.user_cpf && <div className="mrsv-detail-row"><strong>CPF:</strong> {formatarCPF(r.user_cpf)}</div>}
                  {r.phone && <div className="mrsv-detail-row"><strong>Tel:</strong> {formatarTelefone(r.phone)}</div>}
                  <div className="mrsv-detail-bottom">
                    <span className="mrsv-detail-valor">{formatarMoeda(r.preco_total)}</span>
                    <button className="mrsv-detail-cancel" onClick={() => handleCancelar(r.id)} disabled={cancelando}>{cancelando ? "..." : "Cancelar"}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New reservation sheet */}
      {novaAberta && novaData && (
        <div className="mrsv-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) setNovaAberta(false); }}>
          <div className="mrsv-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mrsv-sheet-handle" />
            <div className="mrsv-sheet-fixed">
              <div className="mrsv-sheet-hdr">
                <span className="mrsv-sheet-title">Nova Reserva</span>
                <button className="mrsv-sheet-close" onClick={() => setNovaAberta(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
            <div className="mrsv-sheet-scroll">
              <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />
              <div className="mrsv-new-info">
                <span>{formatarNomeQuadra(novaData.quadra)}</span>
                <span>{formatarDataBR(novaData.data)} • {novaData.hora}</span>
              </div>
              <div className="mrsv-new-form">
                <label className="mrsv-form-label">Nome *</label>
                <input className="mrsv-form-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
                <label className="mrsv-form-label">CPF *</label>
                <input className="mrsv-form-input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
                <label className="mrsv-form-label">Telefone</label>
                <input className="mrsv-form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                <label className="mrsv-form-label">Valor</label>
                <input className="mrsv-form-input" type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" step="0.01" />
              </div>
              <button className="mrsv-new-submit" onClick={handleCriarReserva} disabled={salvando}>{salvando ? "Salvando..." : "Criar Reserva"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderSlots() {
    if (carregandoSlots) return <div className="mrsv-center"><LoadingSpinner mensagem="Carregando horários..." tamanho={20} /></div>;
    const entries = Object.entries(gruposQuadras);
    if (!entries.length) return <div className="mrsv-center"><EmptyState titulo="Nenhuma quadra encontrada" compact /></div>;

    return entries.map(([nomeGrupo, grupo]) => {
      const slots = agregarSlots(grupo);
      const totalQ = grupo.length;
      if (!slots.length) return (
        <div key={nomeGrupo} className="mrsv-group">
          <div className="mrsv-group-hdr"><span className="mrsv-group-name">{nomeGrupo}</span></div>
          <div className="mrsv-empty-slots">Sem horários para esta data</div>
        </div>
      );

      return (
        <div key={nomeGrupo} className="mrsv-group">
          <div className="mrsv-group-hdr">
            <span className="mrsv-group-name">{nomeGrupo}</span>
            {totalQ > 1 && <span className="mrsv-group-count">{totalQ} quadras</span>}
          </div>
          <div className="mrsv-slots">
            {slots.map((s) => {
              const pagas = s.reservadasPagas || 0;
              const pend = s.reservadasPendentes || 0;
              const disp = s.disponiveis || 0;
              const totalRes = pagas + pend;
              const isBloq = s.bloqueadas === totalQ;

              let cls = "mrsv-slot";
              if (isBloq) cls += " mrsv-slot--bloq";
              else if (totalRes > 0 && disp === 0) cls += " mrsv-slot--full";
              else if (totalRes > 0) cls += " mrsv-slot--mix";

              const handleClick = () => {
                if (isBloq) return;
                if (totalRes > 0 && s.reservas.length) abrirDetalhes(s.reservas);
                else abrirNova(s.hora, grupo);
              };

              return (
                <div key={s.hora} className={cls} onClick={handleClick}>
                  <div className="mrsv-slot-time">{s.hora}<span className="mrsv-slot-sep">—</span>{s.hora_fim}</div>
                  {isBloq ? <div className="mrsv-slot-status">Bloqueado</div> : (
                    <div className="mrsv-slot-info">
                      {totalQ > 1 ? <span className="mrsv-slot-disp">{disp}/{totalQ} disp.</span> : disp > 0 ? <span className="mrsv-slot-disp">Disponível</span> : <span className="mrsv-slot-disp mrsv-slot-disp--no">Lotado</span>}
                      <div className="mrsv-slot-tags">
                        {pagas > 0 && <span className="mrsv-slot-tag mrsv-slot-tag--pago">{pagas} pago{pagas > 1 ? "s" : ""}</span>}
                        {pend > 0 && <span className="mrsv-slot-tag mrsv-slot-tag--pend">{pend} pend.</span>}
                      </div>
                    </div>
                  )}
                  {!isBloq && s.preco_hora > 0 && <div className="mrsv-slot-price">{formatarMoeda(s.preco_hora)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }
}

export default GestorMobileReservasPage;
