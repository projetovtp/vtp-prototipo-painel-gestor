import React from "react";
import { ErrorMessage } from "../../components/ui";
import { formatarMoeda as formatBRL, formatarDataBR as formatDateBR, formatarDataISO } from "../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES, PERIODOS_RELATORIO } from "../../utils/constants";
import { exportarParaPDF } from "../../utils/exportPdf";

import CalendarioPopup from "../../components/ui/CalendarioPopup";
import TopQuadras from "../../components/ui/TopQuadras";

import IconClock from "../../components/icons/IconClock";
import IconCheckbox from "../../components/icons/IconCheckbox";
import IconDollarFilled from "../../components/icons/IconDollarFilled";
import IconX from "../../components/icons/IconX";
import IconBarChart from "../../components/icons/IconBarChart";
import IconCalendarFilled from "../../components/icons/IconCalendarFilled";
import IconExport from "../../components/icons/IconExport";

import useGestorRelatorios from "../../hooks/useGestorRelatorios";

const GestorRelatoriosPage = () => {
  const {
    hoje, periodo, dataInicio, dataFim, mostrarCalendario,
    mesCalendario, anoCalendario, exportando, erro,
    calendarioRef, conteudoRef, mesAtual, anoAtual,
    reservasPorDiaDoMes, dadosRelatorio,
    handleChangePeriodo, handleClicarDia, handleSelecionarMes,
    avancarMes, retrocederMes,
    setDataInicio, setDataFim, setMostrarCalendario, setExportando, setErro,
  } = useGestorRelatorios();

  const tituloRelatorio = periodo === "hoje" ? "Relatório do Dia" : periodo === "semana" ? "Relatório Semanal" : periodo === "mes" ? "Relatório Mensal" : "Relatório Personalizado";
  const textoData = dataInicio && dataFim
    ? `${formatDateBR(dataInicio)}${dataInicio !== dataFim ? ` - ${formatDateBR(dataFim)}` : ""}`
    : "Período selecionado";

  return (
    <div className="page">
      <ErrorMessage mensagem={erro} onDismiss={() => setErro("")} />
      {/* Header com filtros de período */}
      <div className="rp-header" ref={calendarioRef}>
        <h2 className="page-title">Relatórios</h2>

        <div className="rp-filters">
          <div className="rp-period-btns">
            {PERIODOS_RELATORIO.map((p) => (
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
          onClick={() => exportarParaPDF(conteudoRef, tituloRelatorio, textoData, setExportando, setErro)}
        >
          <IconExport />
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
              <span className="rp-kpi-icon"><IconCheckbox /></span>
              <span className="rp-kpi-label">Total de Reservas</span>
            </div>
            <div className="rp-kpi-value">{dadosRelatorio.totalReservas}</div>
            <div className="rp-kpi-hint">{periodo === "hoje" ? "reservas confirmadas" : "reservas no período"}</div>
          </div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon"><IconDollarFilled /></span>
            <span className="rp-kpi-label">Total Receita</span>
          </div>
          <div className="rp-kpi-value">{formatBRL(dadosRelatorio.totalReceita)}</div>
          <div className="rp-kpi-hint">{periodo === "hoje" ? "receita do dia" : "receita total"}</div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon rp-kpi-icon--danger"><IconX /></span>
            <span className="rp-kpi-label">Reservas Canceladas</span>
          </div>
          <div className="rp-kpi-value rp-kpi-value--danger">{dadosRelatorio.reservasCanceladas}</div>
          <div className="rp-kpi-hint">{periodo === "hoje" ? "cancelamentos do dia" : "cancelamentos"}</div>
        </div>

        <div className="card rp-kpi-card">
          <div className="rp-kpi-header">
            <span className="rp-kpi-icon rp-kpi-icon--brand"><IconBarChart /></span>
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
              <div className="rp-section-icon rp-section-icon--blue"><IconClock size={20} /></div>
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
              <div className="rp-section-icon rp-section-icon--blue"><IconBarChart /></div>
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
                  <IconCalendarFilled />
                </div>
                <h3 className="rp-section-title" style={{ fontSize: 16 }}>Calendário do Mês - Reservas por Dia</h3>
              </div>
              <div className="rp-month-badge">{MESES[mesAtual]} {anoAtual}</div>
            </div>

            <div className="rp-month-weekdays">
              {DIAS_SEMANA_ABREVIADOS.map((dia, i) => (
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
                  const data = formatarDataISO(anoAtual, mesAtual, dia);
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
};

export default GestorRelatoriosPage;
