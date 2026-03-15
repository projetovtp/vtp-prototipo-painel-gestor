import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function formatBRL(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const [y, m, d] = String(yyyyMmDd).slice(0, 10).split("-");
  return !y || !m || !d ? yyyyMmDd : `${d}/${m}/${y}`;
}

function fmtDate(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function calcularDatasParaPeriodo(p) {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  switch (p) {
    case "hoje": {
      const s = fmtDate(h.getFullYear(), h.getMonth(), h.getDate());
      return { inicio: s, fim: s };
    }
    case "semana": {
      const ini = new Date(h);
      ini.setDate(h.getDate() - h.getDay());
      const fim = new Date(ini);
      fim.setDate(ini.getDate() + 6);
      return { inicio: fmtDate(ini.getFullYear(), ini.getMonth(), ini.getDate()), fim: fmtDate(fim.getFullYear(), fim.getMonth(), fim.getDate()) };
    }
    case "mes": {
      const ini = new Date(h.getFullYear(), h.getMonth(), 1);
      const fim = new Date(h.getFullYear(), h.getMonth() + 1, 0);
      return { inicio: fmtDate(ini.getFullYear(), ini.getMonth(), ini.getDate()), fim: fmtDate(fim.getFullYear(), fim.getMonth(), fim.getDate()) };
    }
    default: return null;
  }
}

async function exportarParaPDF(contentRef, titulo, textoData, setExportando) {
  if (!contentRef.current) return;
  setExportando(true);
  try {
    const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: "#f5f3f3", logging: false });
    const imgData = canvas.toDataURL("image/png");
    const pdfW = 210;
    const margin = 10;
    const usableW = pdfW - margin * 2;
    const ratio = usableW / canvas.width;
    const scaledH = canvas.height * ratio;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageH = 297 - margin * 2;
    let posY = 0, page = 0;
    while (posY < scaledH) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin - posY, usableW, scaledH);
      posY += pageH;
      page++;
    }
    pdf.save(`relatorio-${titulo.toLowerCase().replace(/\s+/g, "-")}-${textoData.replace(/[/\s]/g, "-")}.pdf`);
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
  } finally {
    setExportando(false);
  }
}

export default function GestorMobileRelatoriosPage() {
  const hoje = new Date();
  const datasIniciais = calcularDatasParaPeriodo("mes");
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(datasIniciais.inicio);
  const [dataFim, setDataFim] = useState(datasIniciais.fim);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(hoje.getMonth());
  const [anoCalendario, setAnoCalendario] = useState(hoje.getFullYear());
  const conteudoRef = useRef(null);
  const [exportando, setExportando] = useState(false);

  function handleChangePeriodo(p) {
    setPeriodo(p);
    const datas = calcularDatasParaPeriodo(p);
    if (datas) { setDataInicio(datas.inicio); setDataFim(datas.fim); setMostrarCalendario(false); }
    else setMostrarCalendario(true);
  }

  function handleClicarDia(dia) {
    const data = fmtDate(anoCalendario, mesCalendario, dia);
    if (!dataInicio || (dataInicio && dataFim)) { setDataInicio(data); setDataFim(""); }
    else {
      if (data >= dataInicio) setDataFim(data);
      else { setDataFim(dataInicio); setDataInicio(data); }
    }
  }

  function handleSelecionarMes() {
    setDataInicio(fmtDate(anoCalendario, mesCalendario, 1));
    setDataFim(fmtDate(anoCalendario, mesCalendario, new Date(anoCalendario, mesCalendario + 1, 0).getDate()));
    setPeriodo("custom");
  }

  function avancarMes() {
    if (mesCalendario === 11) { setMesCalendario(0); setAnoCalendario((a) => a + 1); }
    else setMesCalendario((m) => m + 1);
  }
  function retrocederMes() {
    if (mesCalendario === 0) { setMesCalendario(11); setAnoCalendario((a) => a - 1); }
    else setMesCalendario((m) => m - 1);
  }

  useEffect(() => {
    if (mostrarCalendario) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mostrarCalendario]);

  const mesAtual = periodo === "mes" ? hoje.getMonth() : mesCalendario;
  const anoAtual = periodo === "mes" ? hoje.getFullYear() : anoCalendario;

  const reservasPorDiaDoMes = useMemo(() => {
    if (periodo !== "mes") return {};
    const mes = hoje.getMonth(), ano = hoje.getFullYear();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const result = {};
    const seed = ano * 12 + mes;
    for (let dia = 1; dia <= diasNoMes; dia++) result[fmtDate(ano, mes, dia)] = ((seed * 31 + dia) * 17) % 9;
    return result;
  }, [periodo]); // eslint-disable-line react-hooks/exhaustive-deps

  const dados = {
    totalReservas: periodo === "hoje" ? 8 : periodo === "semana" ? 45 : periodo === "mes" ? 145 : 200,
    totalReceita: periodo === "hoje" ? 1200 : periodo === "semana" ? 6750 : periodo === "mes" ? 21750 : 30000,
    reservasCanceladas: periodo === "hoje" ? 1 : periodo === "semana" ? 3 : periodo === "mes" ? 8 : 12,
    taxaOcupacao: periodo === "hoje" ? 45 : periodo === "semana" ? 58 : periodo === "mes" ? 68 : 72,
    reservasPorDia: periodo === "hoje" ? [] : [
      { dia: "Seg", reservas: 12 }, { dia: "Ter", reservas: 15 }, { dia: "Qua", reservas: 18 },
      { dia: "Qui", reservas: 20 }, { dia: "Sex", reservas: 25 }, { dia: "Sáb", reservas: 30 }, { dia: "Dom", reservas: 25 },
    ],
    reservasPorHora: periodo === "hoje" ? (() => {
      const h2 = [];
      const seed = hoje.getFullYear() * 365 + hoje.getMonth() * 30 + hoje.getDate();
      for (let h = 8; h <= 22; h++) h2.push({ hora: String(h).padStart(2, "0") + ":00", reservas: ((seed * 31 + h) * 17) % 6 });
      return h2;
    })() : [],
    topQuadras: [
      { nome: "Quadra 1", reservas: periodo === "hoje" ? 3 : periodo === "semana" ? 12 : 45, receita: periodo === "hoje" ? 450 : periodo === "semana" ? 1800 : 6750 },
      { nome: "Quadra 2", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 10 : 38, receita: periodo === "hoje" ? 300 : periodo === "semana" ? 1500 : 5700 },
      { nome: "Quadra 3", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 9 : 35, receita: periodo === "hoje" ? 300 : periodo === "semana" ? 1350 : 5250 },
      { nome: "Quadra 4", reservas: periodo === "hoje" ? 1 : periodo === "semana" ? 5 : 27, receita: periodo === "hoje" ? 150 : periodo === "semana" ? 750 : 4050 },
    ],
  };

  const titulo = periodo === "hoje" ? "Relatório do Dia" : periodo === "semana" ? "Relatório Semanal" : periodo === "mes" ? "Relatório Mensal" : "Relatório Personalizado";
  const textoData = dataInicio && dataFim
    ? `${formatDateBR(dataInicio)}${dataInicio !== dataFim ? ` — ${formatDateBR(dataFim)}` : ""}`
    : "Período selecionado";

  const periodos = [
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
    { key: "custom", label: "Período" },
  ];

  const maxBarDia = Math.max(...dados.reservasPorDia.map((d) => d.reservas), 1);
  const maxBarHora = Math.max(...dados.reservasPorHora.map((d) => d.reservas), 1);

  function getDiasDoMes(mes, ano) {
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const dias = [];
    for (let i = 0; i < primeiro.getDay(); i++) dias.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) dias.push(d);
    return dias;
  }

  return (
    <div className="mrp">
      {/* Period pills */}
      <div className="mrp-pills">
        {periodos.map((p) => (
          <button key={p.key} className={`mrp-pill${periodo === p.key ? " mrp-pill--active" : ""}`} onClick={() => handleChangePeriodo(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Date range + export */}
      <div className="mrp-sub">
        <div className="mrp-sub-left">
          <div className="mrp-sub-title">{titulo}</div>
          <div className="mrp-sub-date">{textoData}</div>
        </div>
        <button className="mrp-export-btn" disabled={exportando} onClick={() => exportarParaPDF(conteudoRef, titulo, textoData, setExportando)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          {exportando ? "..." : "PDF"}
        </button>
      </div>

      {/* Main scrollable content */}
      <div className="mrp-scroll" ref={conteudoRef}>

        {/* KPI grid */}
        <div className="mrp-kpis">
          <div className="mrp-kpi mrp-kpi--brand">
            <div className="mrp-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            </div>
            <div className="mrp-kpi-value">{dados.totalReservas}</div>
            <div className="mrp-kpi-label">Reservas</div>
          </div>
          <div className="mrp-kpi mrp-kpi--green">
            <div className="mrp-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" /></svg>
            </div>
            <div className="mrp-kpi-value">{formatBRL(dados.totalReceita)}</div>
            <div className="mrp-kpi-label">Receita</div>
          </div>
          <div className="mrp-kpi mrp-kpi--red">
            <div className="mrp-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </div>
            <div className="mrp-kpi-value">{dados.reservasCanceladas}</div>
            <div className="mrp-kpi-label">Canceladas</div>
          </div>
          <div className="mrp-kpi mrp-kpi--purple">
            <div className="mrp-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div className="mrp-kpi-value">{dados.taxaOcupacao}%</div>
            <div className="mrp-kpi-label">Ocupação</div>
          </div>
        </div>

        {/* HOJE: Reservas por horário */}
        {periodo === "hoje" && dados.reservasPorHora.length > 0 && (
          <div className="mrp-section">
            <div className="mrp-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Reservas por Horário
            </div>
            <div className="mrp-hour-grid">
              {dados.reservasPorHora.map((item, i) => (
                <div key={i} className={`mrp-hour-slot${item.reservas > 0 ? " mrp-hour-slot--active" : ""}`}>
                  <span className="mrp-hour-time">{item.hora.slice(0, 2)}h</span>
                  <div className="mrp-hour-bar-bg">
                    <div className="mrp-hour-bar-fill" style={{ width: `${maxBarHora > 0 ? (item.reservas / maxBarHora) * 100 : 0}%` }} />
                  </div>
                  <span className="mrp-hour-count">{item.reservas}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEMANA: Reservas por dia da semana */}
        {periodo === "semana" && dados.reservasPorDia.length > 0 && (
          <div className="mrp-section">
            <div className="mrp-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Reservas por Dia
            </div>
            <div className="mrp-bar-chart">
              {dados.reservasPorDia.map((item, i) => {
                const pct = maxBarDia > 0 ? (item.reservas / maxBarDia) * 100 : 0;
                const isMax = item.reservas === maxBarDia;
                return (
                  <div key={i} className="mrp-bar-col">
                    <div className="mrp-bar-value">{item.reservas}</div>
                    <div className="mrp-bar-track">
                      <div className={`mrp-bar-fill${isMax ? " mrp-bar-fill--max" : ""}`} style={{ height: `${pct}%` }} />
                    </div>
                    <div className="mrp-bar-label">{item.dia}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MÊS: Calendário mensal */}
        {periodo === "mes" && (
          <div className="mrp-section">
            <div className="mrp-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" /></svg>
              Calendário — {MESES_CURTO[mesAtual]} {anoAtual}
            </div>
            <div className="mrp-cal-weekdays">
              {DIAS_SEMANA.map((d) => <div key={d} className="mrp-cal-wd">{d}</div>)}
            </div>
            <div className="mrp-cal-days">
              {(() => {
                const primeiro = new Date(anoAtual, mesAtual, 1);
                const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
                const cells = [];
                for (let i = 0; i < primeiro.getDay(); i++) cells.push(<div key={`e-${i}`} className="mrp-cal-cell" />);
                for (let dia = 1; dia <= diasNoMes; dia++) {
                  const data = fmtDate(anoAtual, mesAtual, dia);
                  const n = reservasPorDiaDoMes[data] || 0;
                  const isHoje = anoAtual === hoje.getFullYear() && mesAtual === hoje.getMonth() && dia === hoje.getDate();
                  let cls = "mrp-cal-cell mrp-cal-cell--day";
                  if (isHoje) cls += " mrp-cal-cell--today";
                  if (n > 0) cls += " mrp-cal-cell--has";
                  cells.push(
                    <div key={dia} className={cls}>
                      <span className="mrp-cal-num">{dia}</span>
                      {n > 0 && <span className="mrp-cal-badge">{n}</span>}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        )}

        {/* Top Quadras */}
        <div className="mrp-section">
          <div className="mrp-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Quadras Mais Utilizadas
          </div>
          <div className="mrp-quadras">
            {dados.topQuadras.map((q, i) => (
              <div key={i} className="mrp-quadra">
                <div className="mrp-quadra-rank">#{i + 1}</div>
                <div className="mrp-quadra-body">
                  <div className="mrp-quadra-name">{q.nome}</div>
                  <div className="mrp-quadra-meta">
                    <span>{q.reservas} reservas</span>
                    <span className="mrp-quadra-receita">{formatBRL(q.receita)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar bottom sheet for custom period */}
      {mostrarCalendario && (
        <div className="mrp-cal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setMostrarCalendario(false); }}>
          <div className="mrp-cal-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mrp-cal-sheet-handle" />
            <div className="mrp-cal-sheet-header">
              <span className="mrp-cal-sheet-title">Selecionar Período</span>
              <button className="mrp-cal-sheet-close" onClick={() => setMostrarCalendario(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            {(dataInicio || dataFim) && (
              <div className="mrp-cal-sheet-range">
                {dataInicio && formatDateBR(dataInicio)}
                {dataInicio && dataFim && dataInicio !== dataFim && " → "}
                {dataFim && dataInicio !== dataFim && formatDateBR(dataFim)}
              </div>
            )}

            <div className="mrp-cal-sheet-nav">
              <button className="mrp-cal-sheet-nav-btn" onClick={retrocederMes}>‹</button>
              <button className="mrp-cal-sheet-month" onClick={handleSelecionarMes}>{MESES[mesCalendario]} {anoCalendario}</button>
              <button className="mrp-cal-sheet-nav-btn" onClick={avancarMes}>›</button>
            </div>

            <div className="mrp-cal-weekdays" style={{ padding: "0" }}>
              {DIAS_SEMANA.map((d) => <div key={d} className="mrp-cal-wd">{d}</div>)}
            </div>
            <div className="mrp-cal-days" style={{ marginBottom: "var(--space-lg)" }}>
              {getDiasDoMes(mesCalendario, anoCalendario).map((dia, i) => {
                if (dia === null) return <div key={i} className="mrp-cal-cell" />;
                const data = fmtDate(anoCalendario, mesCalendario, dia);
                const isSel = data === dataInicio || data === dataFim;
                const isRange = dataInicio && dataFim && data > dataInicio && data < dataFim;
                let cls = "mrp-cal-cell mrp-cal-cell--day mrp-cal-cell--pick";
                if (isSel) cls += " mrp-cal-cell--selected";
                else if (isRange) cls += " mrp-cal-cell--range";
                return <button key={i} className={cls} onClick={() => handleClicarDia(dia)}>{dia}</button>;
              })}
            </div>

            <div className="mrp-cal-sheet-actions">
              <button className="mrp-cal-sheet-btn" onClick={() => { setDataInicio(""); setDataFim(""); }}>Limpar</button>
              <button className="mrp-cal-sheet-btn mrp-cal-sheet-btn--primary" onClick={() => setMostrarCalendario(false)}>Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
