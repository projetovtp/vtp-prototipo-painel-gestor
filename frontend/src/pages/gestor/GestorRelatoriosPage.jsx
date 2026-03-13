import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function exportarParaPDF(contentRef, tituloRelatorio, textoData, setExportando) {
  if (!contentRef.current) return;
  setExportando(true);
  try {
    const el = contentRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f5f3f3",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgW = canvas.width;
    const imgH = canvas.height;

    const pdfW = 210;
    const margin = 10;
    const usableW = pdfW - margin * 2;
    const ratio = usableW / imgW;
    const scaledH = imgH * ratio;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageH = 297 - margin * 2;

    let posY = 0;
    let page = 0;

    while (posY < scaledH) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin - posY, usableW, scaledH);
      posY += pageH;
      page++;
    }

    const nomeArquivo = `relatorio-${tituloRelatorio.toLowerCase().replace(/\s+/g, "-")}-${textoData.replace(/[/\s]/g, "-")}.pdf`;
    pdf.save(nomeArquivo);
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
    alert("Erro ao gerar o PDF. Tente novamente.");
  } finally {
    setExportando(false);
  }
}

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function fmtDate(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];


// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const IconeReservas = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const IconeReceita = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
  </svg>
);

const IconeCancelar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconeOcupacao = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconeRelogio = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconeEstrela = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconeCalendario = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" />
  </svg>
);

const IconeExportar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function TopQuadras({ quadras }) {
  return (
    <div className="card rp-section">
      <div className="rp-section-header">
        <div className="rp-section-icon rp-section-icon--yellow">
          <IconeEstrela />
        </div>
        <h3 className="rp-section-title">Quadras Mais Utilizadas</h3>
      </div>
      <div className="rp-quadras-grid">
        {quadras.map((quadra, index) => (
          <div key={index} className="rp-quadra-card rp-quadra-card--default">
            <div className="rp-quadra-content">
              <div className="rp-quadra-top">
                <div>
                  <div className="rp-quadra-nome">{quadra.nome}</div>
                  <div className="rp-quadra-reservas">
                    <IconeReservas />
                    {quadra.reservas} {quadra.reservas === 1 ? "reserva" : "reservas"}
                  </div>
                </div>
                <div className="rp-quadra-rank">{index + 1}</div>
              </div>
              <div className="rp-quadra-bottom">
                <div className="rp-quadra-receita">{formatBRL(quadra.receita)}</div>
                <div className="rp-quadra-receita-label">Receita total</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarioPopup({ mesCalendario, anoCalendario, dataInicio, dataFim, onClickDia, onSelecionarMes, onAvancar, onRetroceder, onLimpar, onAplicar, onFechar }) {
  function getDiasDoMes(mes, ano) {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias = [];
    for (let i = 0; i < primeiroDia.getDay(); i++) dias.push(null);
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) dias.push(dia);
    return dias;
  }

  function isDiaSelecionado(dia) {
    if (!dia) return false;
    const data = fmtDate(anoCalendario, mesCalendario, dia);
    return data === dataInicio || data === dataFim;
  }

  function isDiaNoIntervalo(dia) {
    if (!dia || !dataInicio || !dataFim) return false;
    const data = fmtDate(anoCalendario, mesCalendario, dia);
    return data >= dataInicio && data <= dataFim;
  }

  return (
    <>
      <div className="rp-calendar-overlay" onClick={onFechar} />
      <div className="rp-calendar">
        <div className="rp-calendar-nav">
          <button className="rp-calendar-nav-btn" onClick={onRetroceder}>‹</button>
          <div className="rp-calendar-month" onClick={onSelecionarMes}>
            {MESES[mesCalendario]} {anoCalendario}
          </div>
          <button className="rp-calendar-nav-btn" onClick={onAvancar}>›</button>
        </div>

        <div className="rp-calendar-weekdays">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="rp-calendar-weekday">{dia}</div>
          ))}
        </div>

        <div className="rp-calendar-days">
          {getDiasDoMes(mesCalendario, anoCalendario).map((dia, index) => {
            if (dia === null) return <div key={index} style={{ padding: 8 }} />;
            const selecionado = isDiaSelecionado(dia);
            const noIntervalo = isDiaNoIntervalo(dia);
            let cls = "rp-calendar-day";
            if (selecionado) cls += " rp-calendar-day--selected";
            else if (noIntervalo) cls += " rp-calendar-day--range";
            return (
              <button key={index} className={cls} onClick={() => onClickDia(dia)}>
                {dia}
              </button>
            );
          })}
        </div>

        <div className="rp-calendar-footer">
          <button className="rp-calendar-btn" onClick={onLimpar}>Limpar</button>
          <button className="rp-calendar-btn rp-calendar-btn--primary" onClick={onAplicar}>Aplicar</button>
        </div>
      </div>
    </>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

function calcularDatasParaPeriodo(p) {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  switch (p) {
    case "hoje": {
      const s = fmtDate(h.getFullYear(), h.getMonth(), h.getDate());
      return { inicio: s, fim: s };
    }
    case "semana": {
      const inicioSemana = new Date(h);
      inicioSemana.setDate(h.getDate() - h.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      return {
        inicio: fmtDate(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate()),
        fim: fmtDate(fimSemana.getFullYear(), fimSemana.getMonth(), fimSemana.getDate()),
      };
    }
    case "mes": {
      const inicioMes = new Date(h.getFullYear(), h.getMonth(), 1);
      const fimMes = new Date(h.getFullYear(), h.getMonth() + 1, 0);
      return {
        inicio: fmtDate(inicioMes.getFullYear(), inicioMes.getMonth(), inicioMes.getDate()),
        fim: fmtDate(fimMes.getFullYear(), fimMes.getMonth(), fimMes.getDate()),
      };
    }
    default:
      return null;
  }
}

export default function GestorRelatoriosPage() {
  const hoje = new Date();
  const datasIniciais = calcularDatasParaPeriodo("mes");
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(datasIniciais.inicio);
  const [dataFim, setDataFim] = useState(datasIniciais.fim);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(hoje.getMonth());
  const [anoCalendario, setAnoCalendario] = useState(hoje.getFullYear());
  const calendarioRef = useRef(null);
  const conteudoRef = useRef(null);
  const [exportando, setExportando] = useState(false);

  function handleChangePeriodo(novoPeriodo) {
    setPeriodo(novoPeriodo);
    const datas = calcularDatasParaPeriodo(novoPeriodo);
    if (datas) {
      setDataInicio(datas.inicio);
      setDataFim(datas.fim);
      setMostrarCalendario(false);
    } else {
      setMostrarCalendario(true);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target)) {
        setMostrarCalendario(false);
      }
    }
    if (mostrarCalendario) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarCalendario]);

  function handleClicarDia(dia) {
    const data = fmtDate(anoCalendario, mesCalendario, dia);
    if (!dataInicio || (dataInicio && dataFim)) {
      setDataInicio(data);
      setDataFim("");
    } else {
      if (data >= dataInicio) {
        setDataFim(data);
      } else {
        setDataFim(dataInicio);
        setDataInicio(data);
      }
    }
  }

  function handleSelecionarMes() {
    setDataInicio(fmtDate(anoCalendario, mesCalendario, 1));
    setDataFim(fmtDate(anoCalendario, mesCalendario, new Date(anoCalendario, mesCalendario + 1, 0).getDate()));
    setPeriodo("custom");
  }

  function avancarMes() {
    if (mesCalendario === 11) { setMesCalendario(0); setAnoCalendario(anoCalendario + 1); }
    else setMesCalendario(mesCalendario + 1);
  }

  function retrocederMes() {
    if (mesCalendario === 0) { setMesCalendario(11); setAnoCalendario(anoCalendario - 1); }
    else setMesCalendario(mesCalendario - 1);
  }

  const mesAtual = periodo === "mes" ? hoje.getMonth() : mesCalendario;
  const anoAtual = periodo === "mes" ? hoje.getFullYear() : anoCalendario;

  const reservasPorDiaDoMes = useMemo(() => {
    if (periodo !== "mes") return {};
    const mes = periodo === "mes" ? new Date().getMonth() : mesCalendario;
    const ano = periodo === "mes" ? new Date().getFullYear() : anoCalendario;
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const reservasPorDia = {};
    const seed = ano * 12 + mes;
    for (let dia = 1; dia <= diasNoMes; dia++) {
      reservasPorDia[fmtDate(ano, mes, dia)] = ((seed * 31 + dia) * 17) % 9;
    }
    return reservasPorDia;
  }, [periodo, mesCalendario, anoCalendario]);

  const dadosRelatorio = {
    totalReservas: periodo === "hoje" ? 8 : periodo === "semana" ? 45 : periodo === "mes" ? 145 : 200,
    totalReceita: periodo === "hoje" ? 1200 : periodo === "semana" ? 6750 : periodo === "mes" ? 21750 : 30000,
    reservasCanceladas: periodo === "hoje" ? 1 : periodo === "semana" ? 3 : periodo === "mes" ? 8 : 12,
    taxaOcupacao: periodo === "hoje" ? 45 : periodo === "semana" ? 58 : periodo === "mes" ? 68 : 72,
    reservasPorDia: periodo === "hoje" ? [] : [
      { dia: "Seg", reservas: 12 }, { dia: "Ter", reservas: 15 }, { dia: "Qua", reservas: 18 },
      { dia: "Qui", reservas: 20 }, { dia: "Sex", reservas: 25 }, { dia: "Sáb", reservas: 30 }, { dia: "Dom", reservas: 25 },
    ],
    reservasPorHora: periodo === "hoje" ? (() => {
      const horarios = [];
      const seed = hoje.getFullYear() * 365 + hoje.getMonth() * 30 + hoje.getDate();
      for (let h = 8; h <= 22; h++) {
        horarios.push({ hora: String(h).padStart(2, "0") + ":00", reservas: ((seed * 31 + h) * 17) % 6 });
      }
      return horarios;
    })() : [],
    topQuadras: [
      { nome: "Quadra 1", reservas: periodo === "hoje" ? 3 : periodo === "semana" ? 12 : 45, receita: periodo === "hoje" ? 450 : periodo === "semana" ? 1800 : 6750 },
      { nome: "Quadra 2", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 10 : 38, receita: periodo === "hoje" ? 300 : periodo === "semana" ? 1500 : 5700 },
      { nome: "Quadra 3", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 9 : 35, receita: periodo === "hoje" ? 300 : periodo === "semana" ? 1350 : 5250 },
      { nome: "Quadra 4", reservas: periodo === "hoje" ? 1 : periodo === "semana" ? 5 : 27, receita: periodo === "hoje" ? 150 : periodo === "semana" ? 750 : 4050 },
    ],
  };

  const periodos = [
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Esta Semana" },
    { key: "mes", label: "Este Mês" },
    { key: "custom", label: "Personalizado" },
  ];

  const tituloRelatorio = periodo === "hoje" ? "Relatório do Dia" : periodo === "semana" ? "Relatório Semanal" : periodo === "mes" ? "Relatório Mensal" : "Relatório Personalizado";
  const textoData = dataInicio && dataFim
    ? `${formatDateBR(dataInicio)}${dataInicio !== dataFim ? ` - ${formatDateBR(dataFim)}` : ""}`
    : "Período selecionado";

  return (
    <div className="page">
      {/* Header com filtros de período */}
      <div className="rp-header" ref={calendarioRef}>
        <h2 className="page-title">Relatórios</h2>

        <div className="rp-filters">
          <div className="rp-period-btns">
            {periodos.map((p) => (
              <button
                key={p.key}
                className={`rp-period-btn ${periodo === p.key ? "rp-period-btn--active" : ""}`}
                onClick={() => handleChangePeriodo(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {(dataInicio || dataFim) && (
            <div className="rp-date-range">
              <span>
                {dataInicio && formatDateBR(dataInicio)}
                {dataInicio && dataFim && dataInicio !== dataFim && " até "}
                {dataFim && dataInicio !== dataFim && formatDateBR(dataFim)}
              </span>
            </div>
          )}

          {periodo === "custom" && mostrarCalendario && (
            <CalendarioPopup
              mesCalendario={mesCalendario}
              anoCalendario={anoCalendario}
              dataInicio={dataInicio}
              dataFim={dataFim}
              onClickDia={handleClicarDia}
              onSelecionarMes={handleSelecionarMes}
              onAvancar={avancarMes}
              onRetroceder={retrocederMes}
              onLimpar={() => { setDataInicio(""); setDataFim(""); }}
              onAplicar={() => setMostrarCalendario(false)}
              onFechar={() => setMostrarCalendario(false)}
            />
          )}
        </div>
      </div>

      {/* Subheader com título e exportar */}
      <div className="rp-subheader">
        <div>
          <h3 className="rp-subheader-title">{tituloRelatorio}</h3>
          <p className="rp-subheader-date">{textoData}</p>
        </div>
        <button
          className="rp-export-btn"
          disabled={exportando}
          onClick={() => exportarParaPDF(conteudoRef, tituloRelatorio, textoData, setExportando)}
        >
          <IconeExportar />
          {exportando ? "Gerando..." : "Exportar PDF"}
        </button>
      </div>

      {/* Área capturada para PDF */}
      <div ref={conteudoRef} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>

      {/* Cards de KPI */}
      <div className="rp-kpi-grid">
        <div className="card rp-kpi-card rp-kpi-card--highlight">
          <div className="rp-kpi-deco" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="rp-kpi-header">
              <span className="rp-kpi-icon"><IconeReservas /></span>
              <span className="rp-kpi-label">Total de Reservas</span>
            </div>
            <div className="rp-kpi-value">{dadosRelatorio.totalReservas}</div>
            <div className="rp-kpi-hint">{periodo === "hoje" ? "reservas confirmadas" : "reservas no período"}</div>
          </div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon"><IconeReceita /></span>
            <span className="rp-kpi-label">Total Receita</span>
          </div>
          <div className="rp-kpi-value">{formatBRL(dadosRelatorio.totalReceita)}</div>
          <div className="rp-kpi-hint">{periodo === "hoje" ? "receita do dia" : "receita total"}</div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon rp-kpi-icon--danger"><IconeCancelar /></span>
            <span className="rp-kpi-label">Reservas Canceladas</span>
          </div>
          <div className="rp-kpi-value rp-kpi-value--danger">{dadosRelatorio.reservasCanceladas}</div>
          <div className="rp-kpi-hint">{periodo === "hoje" ? "cancelamentos do dia" : "cancelamentos"}</div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon rp-kpi-icon--brand"><IconeOcupacao /></span>
            <span className="rp-kpi-label">Taxa de Ocupação</span>
          </div>
          <div className="rp-kpi-value">{dadosRelatorio.taxaOcupacao}%</div>
          <div className="rp-kpi-hint">{periodo === "hoje" ? "ocupação do dia" : "ocupação média"}</div>
        </div>
      </div>

      {/* Conteúdo por período */}
      {periodo === "hoje" && (
        <>
          {/* Reservas por horário */}
          <div className="card rp-section">
            <div className="rp-section-header">
              <div className="rp-section-icon rp-section-icon--blue"><IconeRelogio /></div>
              <h3 className="rp-section-title">Reservas por Horário</h3>
            </div>
            <div className="rp-hourly-grid">
              {dadosRelatorio.reservasPorHora.map((item, index) => (
                <div key={index} className={`rp-hourly-slot ${item.reservas > 0 ? "rp-hourly-slot--active" : ""}`}>
                  <div className="rp-hourly-time">{item.hora}</div>
                  <div className="rp-hourly-count">{item.reservas}</div>
                  <div className="rp-hourly-label">reservas</div>
                </div>
              ))}
            </div>
          </div>

          <TopQuadras quadras={dadosRelatorio.topQuadras} />
        </>
      )}

      {periodo === "semana" && (
        <>
          {/* Gráfico de barras por dia */}
          <div className="card rp-section" style={{ overflowX: "auto" }}>
            <div className="rp-section-header">
              <div className="rp-section-icon rp-section-icon--blue"><IconeOcupacao /></div>
              <h3 className="rp-section-title">Reservas por Dia da Semana</h3>
            </div>
            <div className="rp-bar-chart">
              {(() => {
                const maxReservas = Math.max(...dadosRelatorio.reservasPorDia.map((d) => d.reservas));
                return dadosRelatorio.reservasPorDia.map((item, index) => {
                  const pct = maxReservas > 0 ? (item.reservas / maxReservas) * 100 : 0;
                  const altura = Math.max(pct * 2.4, item.reservas > 0 ? 20 : 0);
                  const isMax = item.reservas === maxReservas;
                  return (
                    <div key={index} className="rp-bar-col">
                      <div
                        className={`rp-bar ${isMax ? "rp-bar--max" : ""}`}
                        style={{ height: `${altura}px` }}
                      >
                        {item.reservas}
                      </div>
                      <div className="rp-bar-label">{item.dia}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <TopQuadras quadras={dadosRelatorio.topQuadras} />
        </>
      )}

      {periodo === "mes" && (
        <>
          {/* Calendário mensal */}
          <div className="card rp-month-calendar">
            <div className="rp-month-header">
              <div className="rp-month-header-left">
                <div className="rp-section-icon rp-section-icon--blue" style={{ width: 28, height: 28, borderRadius: 6 }}>
                  <IconeCalendario />
                </div>
                <h3 className="rp-section-title" style={{ fontSize: 16 }}>Calendário do Mês - Reservas por Dia</h3>
              </div>
              <div className="rp-month-badge">{MESES[mesAtual]} {anoAtual}</div>
            </div>

            <div className="rp-month-weekdays">
              {DIAS_SEMANA.map((dia, i) => (
                <div key={i} className="rp-month-weekday">{dia}</div>
              ))}
            </div>

            <div className="rp-month-days">
              {(() => {
                const primeiroDia = new Date(anoAtual, mesAtual, 1);
                const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
                const dias = [];

                for (let i = 0; i < primeiroDia.getDay(); i++) {
                  dias.push(<div key={`empty-${i}`} className="rp-month-day" style={{ border: "none", background: "none" }} />);
                }

                for (let dia = 1; dia <= diasNoMes; dia++) {
                  const data = fmtDate(anoAtual, mesAtual, dia);
                  const numReservas = reservasPorDiaDoMes[data] || 0;
                  const isHoje = anoAtual === hoje.getFullYear() && mesAtual === hoje.getMonth() && dia === hoje.getDate();
                  const temReservas = numReservas > 0;

                  let cls = "rp-month-day";
                  if (isHoje) cls += " rp-month-day--today";
                  if (temReservas) cls += " rp-month-day--has-reservas";

                  dias.push(
                    <div key={dia} className={cls}>
                      <div className="rp-month-day-num">{dia}</div>
                      {temReservas && <div className="rp-month-day-badge">{numReservas}</div>}
                    </div>
                  );
                }

                return dias;
              })()}
            </div>
          </div>

          <TopQuadras quadras={dadosRelatorio.topQuadras} />
        </>
      )}

      {periodo === "custom" && (
        <TopQuadras quadras={dadosRelatorio.topQuadras} />
      )}

      </div>{/* fim conteudoRef */}
    </div>
  );
}
