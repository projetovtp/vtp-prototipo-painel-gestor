// src/pages/components/agenda/AgendaFilters.jsx
import React from "react";

/**
 * Componente de filtros da agenda.
 *
 * Ele NÃO tem estado próprio de regra de negócio:
 * tudo vem via props do pai (AgendaCinemaView / GestorAgendaPage).
 */
export function AgendaFilters({
  periodo,
  onPeriodoChange,
  dataInicio,
  onDataInicioChange,
  dataFim,
  onDataFimChange,
  filtroStatus,
  onFiltroStatusChange,
  onAplicar,
  onLimpar,
}) {
  return (
    <div
      className="agenda-filters"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      {/* Período */}
      <div className="form-field">
        <label htmlFor="periodoAgenda">Período</label>
        <select
          id="periodoAgenda"
          value={periodo}
          onChange={(e) => onPeriodoChange(e.target.value)}
        >
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
          <option value="intervalo">Intervalo personalizado</option>
        </select>
      </div>

      {/* Data início */}
      <div className="form-field">
        <label htmlFor="dataInicioAgenda">Data início</label>
        <input
          type="date"
          id="dataInicioAgenda"
          value={dataInicio}
          onChange={(e) => onDataInicioChange(e.target.value)}
        />
      </div>

      {/* Data fim */}
      <div className="form-field">
        <label htmlFor="dataFimAgenda">Data fim</label>
        <input
          type="date"
          id="dataFimAgenda"
          value={dataFim}
          onChange={(e) => onDataFimChange(e.target.value)}
        />
      </div>

      {/* Filtro por status */}
      <div className="form-field">
        <label htmlFor="filtroStatusAgenda">Mostrar</label>
        <select
          id="filtroStatusAgenda"
          value={filtroStatus}
          onChange={(e) => onFiltroStatusChange(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="disponivel">Apenas disponíveis</option>
          <option value="reservada">Apenas reservadas</option>
          <option value="bloqueada">Apenas bloqueadas</option>
        </select>
      </div>

      {/* Botões */}
      <div
        className="form-field"
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <button type="button" className="btn" onClick={onAplicar}>
          Aplicar filtros
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onLimpar}
          style={{ whiteSpace: "nowrap" }}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
