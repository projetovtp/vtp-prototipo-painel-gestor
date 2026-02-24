// src/pages/gestor/mobile/GestorMobileConfiguracoesPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function GestorMobileConfiguracoesPage() {
  const navigate = useNavigate();

  const opcoes = [
    {
      id: 1,
      titulo: "Quadras",
      descricao: "Gerenciar quadras",
      icone: "🏟️",
      rota: "/gestor/configuracoes/quadras"
    },
    {
      id: 2,
      titulo: "Perfil",
      descricao: "Editar informações pessoais",
      icone: "👤",
      rota: "/gestor/configuracoes"
    },
    {
      id: 3,
      titulo: "Notificações",
      descricao: "Configurar notificações",
      icone: "🔔",
      rota: "/gestor/configuracoes"
    },
    {
      id: 4,
      titulo: "Ajuda",
      descricao: "Central de ajuda",
      icone: "❓",
      rota: "/gestor/ajuda"
    }
  ];

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f0f2f5",
      overflow: "hidden"
    }}>
      <div style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {opcoes.map((opcao) => (
          <div
            key={opcao.id}
            onClick={() => navigate(opcao.rota)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "#f0f9ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24
            }}>
              {opcao.icone}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4
              }}>
                {opcao.titulo}
              </div>
              <div style={{
                fontSize: 13,
                color: "#6b7280"
              }}>
                {opcao.descricao}
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#9ca3af" }}>
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
