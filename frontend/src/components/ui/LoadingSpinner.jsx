import PropTypes from "prop-types";
import "./ui.css";

const LoadingSpinner = ({
  mensagem = "Carregando...",
  tamanho = 32,
  fullPage = false,
  inline = false,
}) => {
  if (inline) {
    return (
      <span className="vtp-loading-inline">
        <span
          className="vtp-spinner"
          style={{ width: 16, height: 16, borderWidth: 2 }}
        />
        {mensagem && <span>{mensagem}</span>}
      </span>
    );
  }

  const content = (
    <div className="vtp-loading">
      <span
        className="vtp-spinner"
        style={{
          width: tamanho,
          height: tamanho,
          borderWidth: tamanho > 24 ? 3 : 2,
        }}
      />
      {mensagem && <div className="vtp-loading-text">{mensagem}</div>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="page">
        <div className="card vtp-loading-card">{content}</div>
      </div>
    );
  }

  return content;
}

LoadingSpinner.propTypes = {
  mensagem: PropTypes.string,
  tamanho: PropTypes.number,
  fullPage: PropTypes.bool,
  inline: PropTypes.bool,
};

export default LoadingSpinner;
