import React from "react";
import PropTypes from "prop-types";

const AgendaRegrasBox = ({
  regras = [],
  quadras = [],
  quadraSelecionadaId,
  selectedQuadraIds = [],
  setSelectedQuadraIds,
  diasSelecionados = [],
  setDiasSelecionados,
  regraForm,
  setRegraForm,
  regraEditandoId,
  setRegraEditandoId,
  setEditingQuadraId,
  salvandoRegra,
  excluindoRegraId,
  onSalvarRegra,
  onExcluirRegra,
  onAplicarLote,
  onResetForm,
}) => {
  function toggleQuadra(id) {
    if (!setSelectedQuadraIds) return;
    setSelectedQuadraIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleDia(d) {
    if (!setDiasSelecionados) return;
    setDiasSelecionados((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function editarRegra(r) {
    setRegraEditandoId?.(r.id);
    setEditingQuadraId?.(r.id_quadra || quadraSelecionadaId || null);

    setRegraForm?.({
      diaSemana: r.dia_da_semana ?? "",
      horaInicio: (r.hora_inicio || "").slice(0, 5),
      horaFim: (r.hora_fim || "").slice(0, 5),
      precoHora: r.valor ?? "",
      ativo: true,
    });
  }

  const dias = [
    { valor: 1, label: "Seg" },
    { valor: 2, label: "Ter" },
    { valor: 3, label: "Qua" },
    { valor: 4, label: "Qui" },
    { valor: 5, label: "Sex" },
    { valor: 6, label: "Sáb" },
    { valor: 0, label: "Dom" },
  ];

  return (
    <div className="card">
      <h3>Regras de horários da quadra</h3>

      {/* LOTE: seleção de quadras */}
      <div style={{ marginTop: 10 }}>
        <label style={{ fontWeight: 700, fontSize: 13 }}>
          Quadras para aplicar esta regra (lote)
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          {quadras.map((q) => (
            <label key={q.id} style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={selectedQuadraIds.includes(q.id)}
                onChange={() => toggleQuadra(q.id)}
              />
              {q.nome_dinamico || q.nome || q.tipo || q.id}
            </label>
          ))}
        </div>

        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
          Dica: se não selecionar nenhuma, aplica só na quadra atual.
        </p>
      </div>

      {/* FORM */}
      <form
        style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          onSalvarRegra?.();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Dia da semana</label>
          <select
            value={regraForm?.diaSemana ?? ""}
            onChange={(e) => setRegraForm?.((p) => ({ ...p, diaSemana: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="">Selecione</option>
            {dias.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Preço/hora (R$)</label>
          <input
            value={regraForm?.precoHora ?? ""}
            onChange={(e) => setRegraForm?.((p) => ({ ...p, precoHora: e.target.value }))}
            placeholder="Ex: 120"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Hora início</label>
          <input
            value={regraForm?.horaInicio ?? ""}
            onChange={(e) => setRegraForm?.((p) => ({ ...p, horaInicio: e.target.value }))}
            placeholder="18:00"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Hora fim</label>
          <input
            value={regraForm?.horaFim ?? ""}
            onChange={(e) => setRegraForm?.((p) => ({ ...p, horaFim: e.target.value }))}
            placeholder="23:00"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </div>

        {/* dias selecionados (para lote) */}
        <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Dias (para lote)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {dias.map((d) => (
              <button
                type="button"
                key={d.valor}
                className="btn btn-outline-secondary"
                onClick={() => toggleDia(d.valor)}
                style={{ opacity: diasSelecionados.includes(d.valor) ? 1 : 0.6 }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <button className="btn btn-success" type="submit" disabled={salvandoRegra}>
            {salvandoRegra ? "Salvando..." : regraEditandoId ? "Salvar edição" : "Salvar regra"}
          </button>

          <button className="btn btn-outline-secondary" type="button" onClick={onResetForm}>
            Limpar
          </button>

          <button className="btn btn-primary" type="button" onClick={onAplicarLote}>
            Aplicar em lote
          </button>
        </div>
      </form>

      {/* LISTA */}
      <div style={{ marginTop: 14 }}>
        <h4 style={{ margin: 0 }}>Regras cadastradas</h4>

        {(!regras || regras.length === 0) && (
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>Nenhuma regra cadastrada.</p>
        )}

        {regras?.map((r) => (
          <div
            key={r.id}
            style={{
              marginTop: 10,
              border: "1px solid #e6e6e6",
              borderRadius: 10,
              padding: 10,
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 800 }}>
                {String(r.dia_da_semana)} — {(r.hora_inicio || "").slice(0, 5)} → {(r.hora_fim || "").slice(0, 5)}
              </div>
              <div style={{ opacity: 0.8 }}>R$ {Number(r.valor || 0).toFixed(2)}</div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-outline-secondary" type="button" onClick={() => editarRegra(r)}>
                Editar
              </button>
              <button
                className="btn btn-danger"
                type="button"
                disabled={excluindoRegraId === r.id}
                onClick={() => onExcluirRegra?.(r.id)}
              >
                {excluindoRegraId === r.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

AgendaRegrasBox.propTypes = {
  regras: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dia_da_semana: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      hora_inicio: PropTypes.string,
      hora_fim: PropTypes.string,
      valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id_quadra: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  quadras: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nome_dinamico: PropTypes.string,
      nome: PropTypes.string,
      tipo: PropTypes.string,
    })
  ),
  quadraSelecionadaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedQuadraIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  setSelectedQuadraIds: PropTypes.func,
  diasSelecionados: PropTypes.arrayOf(PropTypes.number),
  setDiasSelecionados: PropTypes.func,
  regraForm: PropTypes.shape({
    diaSemana: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    horaInicio: PropTypes.string,
    horaFim: PropTypes.string,
    precoHora: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ativo: PropTypes.bool,
  }),
  setRegraForm: PropTypes.func,
  regraEditandoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setRegraEditandoId: PropTypes.func,
  setEditingQuadraId: PropTypes.func,
  salvandoRegra: PropTypes.bool,
  excluindoRegraId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSalvarRegra: PropTypes.func,
  onExcluirRegra: PropTypes.func,
  onAplicarLote: PropTypes.func,
  onResetForm: PropTypes.func,
};

export default AgendaRegrasBox;
