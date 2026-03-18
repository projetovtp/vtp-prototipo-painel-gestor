import React from "react";
import { useNavigate } from "react-router-dom";

const GestorMobileRegrasSelecaoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mhr">
      <div className="mhr-sel-list">
        <button className="mhr-sel-card" onClick={() => navigate("/gestor/regras-de-horarios/regras")}>
          <div className="mhr-sel-icon mhr-sel-icon--brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 7h8M8 12h5M8 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <div className="mhr-sel-body">
            <div className="mhr-sel-title">Regra de Horários</div>
            <div className="mhr-sel-desc">Defina horários disponíveis e preços da agenda</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <button className="mhr-sel-card mhr-sel-card--danger" onClick={() => navigate("/gestor/regras-de-horarios/bloqueios")}>
          <div className="mhr-sel-icon mhr-sel-icon--danger">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <div className="mhr-sel-body">
            <div className="mhr-sel-title">Bloqueio de Horários</div>
            <div className="mhr-sel-desc">Bloqueie horários para eventos ou manutenção</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

export default GestorMobileRegrasSelecaoPage;
