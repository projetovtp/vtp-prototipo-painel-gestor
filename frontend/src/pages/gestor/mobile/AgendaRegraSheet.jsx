import React from "react";
import { DIAS_SEMANA_REGRAS } from "../../../utils/constants";
import { corrigirHora } from "../../../utils/formatters";
import { gerarHorarios } from "../../../utils/agenda";
import IconX from "../../../components/icons/IconX";

const AgendaRegraSheet = ({
  form,
  setForm,
  editId,
  salvando,
  onSalvar,
  onRemover,
  onFechar,
}) => {
  function toggleDia(val) {
    setForm((p) => ({
      ...p,
      diasSemana: p.diasSemana.includes(val)
        ? p.diasSemana.filter((d) => d !== val)
        : [...p.diasSemana, val],
    }));
  }

  return (
    <div
      className="mhr-sheet-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="mhr-sheet" onTouchMove={(e) => e.stopPropagation()}>
        <div className="mhr-sheet-handle" />
        <div className="mhr-sheet-hdr">
          <span className="mhr-sheet-title">
            {editId ? "Editar Regra" : "Nova Regra"}
          </span>
          <button className="mhr-sheet-close" onClick={onFechar}>
            <IconX size={20} />
          </button>
        </div>

        <div className="mhr-sheet-body">
          <label className="mhr-form-label">Dias da Semana</label>
          <div className="mhr-day-chips">
            {DIAS_SEMANA_REGRAS.map((d) => {
              const sel = form.diasSemana.includes(d.valor);
              const dis = !!editId && !sel;
              return (
                <button
                  key={d.valor}
                  className={`mhr-day-chip${sel ? " mhr-day-chip--sel" : ""}${dis ? " mhr-day-chip--dis" : ""}`}
                  onClick={() => !dis && toggleDia(d.valor)}
                  disabled={dis}
                >
                  {d.abreviacao}
                </button>
              );
            })}
          </div>

          <div className="mhr-form-row">
            <div className="mhr-form-field">
              <label className="mhr-form-label">Hora Início</label>
              <input
                className="mhr-form-input"
                type="time"
                step="3600"
                value={form.horaInicio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    horaInicio: corrigirHora(e.target.value),
                  })
                }
              />
            </div>
            <div className="mhr-form-field">
              <label className="mhr-form-label">Hora Fim</label>
              <input
                className="mhr-form-input"
                type="time"
                step="3600"
                value={form.horaFim}
                onChange={(e) =>
                  setForm({
                    ...form,
                    horaFim: corrigirHora(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <label className="mhr-form-label">Preço por Hora (R$)</label>
          <input
            className="mhr-form-input"
            type="number"
            step="0.01"
            min="0"
            value={form.precoHora}
            onChange={(e) =>
              setForm({ ...form, precoHora: e.target.value })
            }
            placeholder="Ex: 100.00"
          />

          {form.horaInicio &&
            form.horaFim &&
            parseInt(form.horaInicio) < parseInt(form.horaFim) && (
              <div className="mhr-preview">
                Horários:{" "}
                {gerarHorarios(form.horaInicio, form.horaFim).join(", ")}
              </div>
            )}

          <div className="mhr-form-actions">
            {editId && (
              <button
                className="mhr-btn-danger-full"
                onClick={() => onRemover(editId)}
              >
                Remover
              </button>
            )}
            <button
              className="mhr-btn-brand-full"
              onClick={onSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : editId ? "Salvar" : "Criar Regra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaRegraSheet;
