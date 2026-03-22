import React from "react";

const CampoSenha = ({
  id,
  label = "Senha",
  value,
  onChange,
  mostrar,
  setMostrar,
  placeholder = "Digite sua senha",
  autoComplete = "current-password",
  disabled = false,
}) => {
  const handleChange = (e) => {
    const v = e.target.value;
    if (typeof onChange === "function" && onChange.length <= 1) {
      onChange(v);
    } else {
      onChange?.(e);
    }
  };

  return (
    <div className="auth-campo-senha">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="auth-campo-senha-input-wrap">
        <input
          id={id}
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="auth-input"
        />
        <button
          type="button"
          className="auth-btn-toggle-senha"
          onClick={() => setMostrar?.(!mostrar)}
          disabled={disabled}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
        >
          {mostrar ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
};

export default CampoSenha;