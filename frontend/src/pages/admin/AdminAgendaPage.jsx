import React from "react";

export default function AdminAgendaPage() {
  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">
            Agenda global (layout base).
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <p style={{ opacity: 0.8, margin: 0 }}>
            Em breve: seleção de empresa/quadra, visual cinema, bloqueios, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
