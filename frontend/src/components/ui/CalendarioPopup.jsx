import { formatarDataISO } from "../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES } from "../../utils/constants";

const CalendarioPopup = ({ mesCalendario, anoCalendario, dataInicio, dataFim, onClickDia, onSelecionarMes, onAvancar, onRetroceder, onLimpar, onAplicar, onFechar }) => {
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
    const data = formatarDataISO(anoCalendario, mesCalendario, dia);
    return data === dataInicio || data === dataFim;
  }

  function isDiaNoIntervalo(dia) {
    if (!dia || !dataInicio || !dataFim) return false;
    const data = formatarDataISO(anoCalendario, mesCalendario, dia);
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
          {DIAS_SEMANA_ABREVIADOS.map((dia) => (
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
};

export default CalendarioPopup;
