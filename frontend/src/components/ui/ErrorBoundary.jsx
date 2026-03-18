import React from "react";
import PropTypes from "prop-types";
import "./ui.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { temErro: false, erro: null };
    this.handleReload = this.handleReload.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(erro) {
    return { temErro: true, erro };
  }

  componentDidCatch(erro, infoErro) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Erro capturado:", erro, infoErro);
    }
  }

  handleReload() {
    window.location.reload();
  }

  handleReset() {
    this.setState({ temErro: false, erro: null });
  }

  render() {
    const { temErro, erro } = this.state;
    const { children, fallback } = this.props;

    if (!temErro) return children;

    if (fallback) return fallback;

    return (
      <div className="vtp-eb-page">
        <div className="vtp-eb-card">
          <div className="vtp-eb-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="#ef4444"
              />
            </svg>
          </div>

          <h2 className="vtp-eb-title">Algo deu errado</h2>

          <p className="vtp-eb-desc">
            Ocorreu um erro inesperado nesta página. Recarregue para tentar novamente
            ou volte para o início.
          </p>

          {process.env.NODE_ENV !== "production" && erro && (
            <details className="vtp-eb-details">
              <summary className="vtp-eb-details-summary">Detalhes do erro</summary>
              <pre className="vtp-eb-details-pre">{erro.message}</pre>
            </details>
          )}

          <div className="vtp-eb-actions">
            <button
              className="vtp-eb-btn-primary"
              onClick={this.handleReload}
            >
              Recarregar página
            </button>
            <button
              className="vtp-eb-btn-secondary"
              onClick={() => { window.location.href = "/"; }}
            >
              Ir para o início
            </button>
          </div>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ErrorBoundary;
