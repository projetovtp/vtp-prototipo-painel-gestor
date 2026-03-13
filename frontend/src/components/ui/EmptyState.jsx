import "./ui.css";

const defaultIcon = (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"
      fill="#d1d5db"
    />
  </svg>
);

export default function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
  acaoLabel,
  compact = false,
}) {
  return (
    <div className={`vtp-empty ${compact ? "vtp-empty-compact" : ""}`}>
      <div className="vtp-empty-icon">{icone || defaultIcon}</div>
      {titulo && <div className="vtp-empty-title">{titulo}</div>}
      {descricao && <div className="vtp-empty-desc">{descricao}</div>}
      {acao && acaoLabel && (
        <button className="vtp-empty-action" onClick={acao}>
          {acaoLabel}
        </button>
      )}
    </div>
  );
}
