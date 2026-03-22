export const CalendarioNav = ({ onMesAnterior, onProximoMes, labelMes }) => (
    <div className="rh-calendar-nav">
      <button type="button" className="rh-calendar-nav-btn" onClick={onMesAnterior}>
        ← Anterior
      </button>
      <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600 }}>
        {labelMes}
      </h4>
      <button type="button" className="rh-calendar-nav-btn" onClick={onProximoMes}>
        Próximo →
      </button>
    </div>
  );
  