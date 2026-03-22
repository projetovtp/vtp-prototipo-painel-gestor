import { formatarDataBR as formatDateBR } from "../../utils/formatters";

const PainelHorariosBloqueio = ({
  dataBloqueioSelecionada,
  horariosBloqueio,
  horariosBloqueados,
  toggleHorarioBloqueio,
  diaEstaBloqueado,
  temMultiplasQuadras,
  totalQuadrasNoGrupo,
  bloquearTodasQuadras,
  setBloquearTodasQuadras,
  quantidadeQuadrasBloquear,
  setQuantidadeQuadrasBloquear,
  salvandoBloqueio,
  removendoBloqueio,
  isOperando,
  handleBloquear,
  handleDesbloquear,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 12,
        flexWrap: "wrap",
      }}
    >
      <label
        style={{
          fontSize: "var(--font-base)",
          fontWeight: 600,
          color: "var(--color-text)",
        }}
      >
        Selecione os horários em {formatDateBR(dataBloqueioSelecionada)}:
      </label>

      {temMultiplasQuadras && (
        <div className="rh-quadras-badge">
          <span
            style={{
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            {totalQuadrasNoGrupo} quadras:
          </span>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: "var(--font-sm)",
            }}
          >
            <input
              type="checkbox"
              checked={bloquearTodasQuadras}
              onChange={(e) => {
                setBloquearTodasQuadras(e.target.checked);
                if (e.target.checked) {
                  setQuantidadeQuadrasBloquear(totalQuadrasNoGrupo);
                }
              }}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
              Todas
            </span>
          </label>

          {!bloquearTodasQuadras && (
            <select
              value={quantidadeQuadrasBloquear}
              onChange={(e) =>
                setQuantidadeQuadrasBloquear(Number(e.target.value))
              }
              style={{
                padding: "6px 10px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-sm)",
                outline: "none",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                minWidth: 90,
              }}
            >
              {Array.from(
                { length: totalQuadrasNoGrupo },
                (_, i) => i + 1,
              ).map((num) => (
                <option key={num} value={num}>
                  {num} quadra{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>

    {diaEstaBloqueado && (
      <div className="rh-blocked-alert">
        <div className="rh-blocked-alert-title">Este dia possui bloqueios</div>
        <button
          type="button"
          className="btn-danger-solid"
          onClick={() => handleDesbloquear({ diaInteiro: true })}
          disabled={removendoBloqueio}
          style={{ padding: "8px 16px", fontSize: "var(--font-sm)" }}
        >
          {removendoBloqueio ? "Desbloqueando..." : "Desbloquear Dia Inteiro"}
        </button>
      </div>
    )}

    <div className="rh-horarios-grid">
      {Array.from({ length: 18 }, (_, i) => {
        const hora = i + 6;
        const horario = String(hora).padStart(2, "0") + ":00";
        const isSelecionado = horariosBloqueio.includes(horario);
        const isBloqueado = horariosBloqueados.includes(horario);

        let cls = "rh-horario-btn";
        if (isBloqueado) cls += " rh-horario-btn--blocked";
        else if (isSelecionado) cls += " rh-horario-btn--selected";

        return (
          <button
            key={horario}
            type="button"
            className={cls}
            onClick={() => toggleHorarioBloqueio(horario)}
            disabled={isOperando}
          >
            {horario}
            {isBloqueado && !isSelecionado && " (bloqueado)"}
          </button>
        );
      })}
    </div>

    <div className="rh-action-bar">
      {horariosBloqueio.length > 0 && (
        <>
          {horariosBloqueio.some((h) => horariosBloqueados.includes(h)) ? (
            <button
              type="button"
              className="btn-danger-solid"
              onClick={() => handleDesbloquear()}
              disabled={isOperando}
              style={{ padding: "10px 20px" }}
            >
              {removendoBloqueio
                ? "Desbloqueando..."
                : `Desbloquear ${horariosBloqueio.length} horário(s)`}
            </button>
          ) : (
            <button
              type="button"
              className="btn-brand"
              onClick={() => handleBloquear()}
              disabled={isOperando}
              style={{ padding: "10px 20px" }}
            >
              {salvandoBloqueio
                ? "Bloqueando..."
                : `Bloquear ${horariosBloqueio.length} horário(s)`}
            </button>
          )}
        </>
      )}

      {!diaEstaBloqueado && (
        <button
          type="button"
          className="btn-danger-solid"
          onClick={() => handleBloquear({ diaInteiro: true })}
          disabled={isOperando}
          style={{ padding: "10px 20px" }}
        >
          {salvandoBloqueio ? "Bloqueando..." : "Bloquear Dia Inteiro"}
        </button>
      )}
    </div>
  </div>
);

export default PainelHorariosBloqueio;
