import "./ui.css";

export default function ErrorMessage({
  mensagem,
  onRetry,
  retryLabel = "Tentar novamente",
  tipo = "banner",
  onDismiss,
}) {
  if (!mensagem) return null;

  if (tipo === "fullPage") {
    return (
      <div className="page">
        <div className="card vtp-error-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="#ef4444"
            />
          </svg>
          <div className="vtp-error-card-text">{mensagem}</div>
          {onRetry && (
            <button className="vtp-error-retry-btn" onClick={onRetry}>
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vtp-error-banner" role="alert">
      <div className="vtp-error-banner-content">
        <svg
          className="vtp-error-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            fill="currentColor"
          />
        </svg>
        <span>{mensagem}</span>
      </div>
      <div className="vtp-error-banner-actions">
        {onRetry && (
          <button className="vtp-error-retry-link" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        {onDismiss && (
          <button
            className="vtp-error-dismiss"
            onClick={onDismiss}
            aria-label="Fechar"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
