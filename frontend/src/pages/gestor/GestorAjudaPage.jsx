// src/pages/gestor/GestorAjudaPage.jsx
import React from "react";

export default function GestorAjudaPage() {
  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Ajuda</h1>
      </div>

      <div className="card" style={{ marginTop: 0, padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
          Bem-vindo à Central de Ajuda
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
          Aqui você encontra informações e respostas para as dúvidas mais frequentes sobre o uso da plataforma VaiTerPlay.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              Como criar uma reserva?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
              Acesse a página de Reservas, selecione a data e horário desejados, escolha a quadra e confirme a reserva.
            </p>
          </div>

          <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              Como cancelar uma reserva?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
              Você pode cancelar reservas pendentes ou pagas que foram criadas há menos de 24 horas. Acesse o histórico do cliente e clique no botão "Cancelar".
            </p>
          </div>

          <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              Como configurar regras de horários?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
              Acesse "Regras de Horários" no menu lateral para definir os horários disponíveis e valores para cada quadra.
            </p>
          </div>

          <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
              Precisa de mais ajuda?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
              Entre em contato com nosso suporte através do WhatsApp ou email.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#37648c" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span style={{ fontSize: 14, color: "#111827" }}>(11) 99999-9999</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#37648c" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span style={{ fontSize: 14, color: "#111827" }}>suporte@vaiterplay.com.br</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
