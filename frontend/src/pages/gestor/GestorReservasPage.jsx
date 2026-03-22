import React from "react";
import { ErrorMessage, LoadingSpinner } from "../../components/ui";
import { DetalhesReservaModal } from "../../components/modals";
import { formatarDataBR, labelDiaSemana, plusDiasISO } from "../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES } from "../../utils/constants";
import GrupoQuadras from "../../components/gestor/GrupoQuadras";
import { useGestorReservasPage } from "../../hooks/useGestorReservasPage";

const GestorReservasPage = () => {
  const {
    reservas,
    quadras,
    carregando,
    carregandoSlots,
    erro, setErro,
    modoVisualizacao, setModoVisualizacao,
    dataSelecionada, setDataSelecionada,
    mesAtual,
    diaClicado, setDiaClicado,
    modalAberto,
    reservaSelecionada,
    gruposQuadras,
    agregarSlots,
    dataTemRegras,
    avancarMes, retrocederMes, irParaHoje,
    abrirModal, fecharModal, handleMudanca,
  } = useGestorReservasPage();

  const renderSlotsDoDia = (dataISO) => {
    if (carregandoSlots) return <LoadingSpinner mensagem="Carregando horários..." />;
    return (
      <div className="rv-groups">
        {Object.entries(gruposQuadras).map(([nomeGrupo, quadrasGrupo]) => (
          <GrupoQuadras
            key={nomeGrupo}
            nomeGrupo={nomeGrupo}
            quadrasGrupo={quadrasGrupo}
            slotsAgregados={agregarSlots(quadrasGrupo)}
            dataISO={dataISO}
            quadras={quadras}
            onAbrirModal={abrirModal}
          />
        ))}
      </div>
    );
  };

  const renderDetalhesDoDia = (dataISO) => (
    <div>
      <button type="button" className="rv-back-btn" onClick={() => setDiaClicado(null)}>
        ← Voltar
      </button>
      <h3 className="rv-day-title">Horários de {formatarDataBR(dataISO)}</h3>
      {renderSlotsDoDia(dataISO)}
    </div>
  );

  const renderVisualizacaoSemanal = () => {
    if (diaClicado) return renderDetalhesDoDia(diaClicado);

    const ref = new Date(`${dataSelecionada}T12:00:00`);
    const diaSemana = ref.getDay();
    const inicioSemana = new Date(ref);
    inicioSemana.setDate(ref.getDate() - diaSemana);

    const diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const dataISO = dia.toISOString().split("T")[0];
      const reservasDoDia = reservas.filter(r => r.data === dataISO);
      diasSemana.push({
        dia: dia.getDate(),
        data: dataISO,
        nomeDia: labelDiaSemana(new Date(`${dataISO}T12:00:00`).getDay()),
        temRegras: dataTemRegras(dataISO),
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }

    return (
      <div>
        <div className="rv-calendar-header">
          {DIAS_SEMANA_ABREVIADOS.map(d => <div key={d} className="rv-calendar-header-cell">{d}</div>)}
        </div>
        <div className="rv-calendar-grid">
          {diasSemana.map((dia) => {
            if (!dia.temRegras) {
              return (
                <div key={dia.data} className="rv-calendar-day rv-calendar-day--disabled">
                  <div className="rv-calendar-day-label">{dia.nomeDia}</div>
                  <div className="rv-calendar-day-num" style={{ color: "var(--color-text-muted)" }}>{dia.dia}</div>
                  <div className="rv-calendar-day-sub">Sem regras</div>
                </div>
              );
            }
            return (
              <button
                key={dia.data}
                type="button"
                className={`rv-calendar-day${dia.temReservas ? " rv-calendar-day--has-reservas" : ""}`}
                onClick={() => setDiaClicado(dia.data)}
              >
                <div className="rv-calendar-day-label">{dia.nomeDia}</div>
                <div className="rv-calendar-day-num">{dia.dia}</div>
                {dia.temReservas && (
                  <div className="rv-calendar-day-count">
                    {dia.quantidadeReservas} reserva{dia.quantidadeReservas !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVisualizacaoMensal = () => {
    if (diaClicado) return renderDetalhesDoDia(diaClicado);

    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicialSemana; i++) dias.push(null);
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const reservasDoDia = reservas.filter(r => r.data === dataISO);
      dias.push({
        dia,
        data: dataISO,
        temRegras: dataTemRegras(dataISO),
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }

    return (
      <div>
        <div className="rv-calendar-header">
          {DIAS_SEMANA_ABREVIADOS.map(d => <div key={d} className="rv-calendar-header-cell">{d}</div>)}
        </div>
        <div className="rv-calendar-grid">
          {dias.map((dia, index) => {
            if (!dia) return <div key={`empty-${index}`} />;
            if (!dia.temRegras) {
              return (
                <div key={dia.data} className="rv-calendar-day rv-calendar-day--disabled">
                  <div className="rv-calendar-day-num" style={{ color: "var(--color-text-muted)" }}>{dia.dia}</div>
                  <div className="rv-calendar-day-sub">Sem regras</div>
                </div>
              );
            }
            return (
              <button
                key={dia.data}
                type="button"
                className={`rv-calendar-day${dia.temReservas ? " rv-calendar-day--has-reservas" : ""}`}
                onClick={() => setDiaClicado(dia.data)}
              >
                <div className="rv-calendar-day-num">{dia.dia}</div>
                {dia.temReservas && (
                  <div className="rv-calendar-day-count">{dia.quantidadeReservas}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <h2 className="page-title">Reservas</h2>
      <p className="rv-subtitle">
        Visualize e gerencie todas as reservas de todas as suas quadras
      </p>
      <div className="rv-wrapper">

        <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

        <div className="rv-controls">
          <div className="rv-mode-tabs">
            {["dia", "semana", "mes"].map((modo) => (
              <button
                key={modo}
                type="button"
                className={`rv-mode-tab${modoVisualizacao === modo ? " rv-mode-tab--active" : ""}`}
                onClick={() => { setModoVisualizacao(modo); setDiaClicado(null); }}
              >
                {modo === "dia" ? "Dia" : modo === "semana" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          <div className="rv-nav">
            {modoVisualizacao === "dia" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={() => setDataSelecionada(plusDiasISO(dataSelecionada, -1))}>←</button>
                <input
                  type="date"
                  className="rv-date-input"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                />
                <button type="button" className="rv-nav-btn" onClick={() => setDataSelecionada(plusDiasISO(dataSelecionada, 1))}>→</button>
              </>
            )}

            {modoVisualizacao === "semana" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={() => setDataSelecionada(plusDiasISO(dataSelecionada, -7))}>←</button>
                <button type="button" className="rv-nav-btn" onClick={irParaHoje}>Hoje</button>
                <button type="button" className="rv-nav-btn" onClick={() => setDataSelecionada(plusDiasISO(dataSelecionada, 7))}>→</button>
              </>
            )}

            {modoVisualizacao === "mes" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={retrocederMes}>←</button>
                <div className="rv-nav-label">
                  {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </div>
                <button type="button" className="rv-nav-btn" onClick={avancarMes}>→</button>
                <button type="button" className="rv-nav-btn" onClick={irParaHoje}>Hoje</button>
              </>
            )}
          </div>
        </div>

        {carregando ? (
          <LoadingSpinner mensagem="Carregando reservas..." />
        ) : (
          <>
            {modoVisualizacao === "dia" && renderSlotsDoDia(dataSelecionada)}
            {modoVisualizacao === "semana" && renderVisualizacaoSemanal()}
            {modoVisualizacao === "mes" && renderVisualizacaoMensal()}
          </>
        )}
      </div>

      {modalAberto && (
        <DetalhesReservaModal
          aberto={modalAberto}
          onFechar={fecharModal}
          reserva={reservaSelecionada}
          reservas={reservaSelecionada?.todasReservas}
          onCancelado={handleMudanca}
          onCriada={handleMudanca}
        />
      )}
    </div>
  );
};

export default GestorReservasPage;
