// src/pages/gestor/GestorConfiguracoesSelecaoPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/useDevice";

export default function GestorConfiguracoesSelecaoPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();

  const opcoes = [
    {
      id: "complexo",
      titulo: "Configurações do Complexo",
      descricao: "Gerencie os dados do complexo, endereço e informações financeiras",
      rota: "/gestor/configuracoes/complexo",
      icone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21h18M5 21V7l8-4v14M19 21V11l-6-4M9 9v0M9 15v0M15 11v0M15 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      cor: "#37648c"
    },
    {
      id: "quadras",
      titulo: "Configurações das Quadras",
      descricao: "Gerencie as quadras do complexo, estruturas, materiais e modalidades",
      rota: "/gestor/configuracoes/quadras",
      icone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      cor: "#1c7c54"
    }
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ 
          fontSize: (isMobile || isTablet) ? 20 : 24, 
          fontWeight: 700, 
          color: "#111827",
          marginBottom: 8
        }}>
          Configurações
        </h1>
        <p style={{ 
          fontSize: (isMobile || isTablet) ? 14 : 16, 
          color: "#6b7280",
          margin: 0
        }}>
          Escolha o tipo de configuração que deseja gerenciar
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "repeat(2, 1fr)",
        gap: (isMobile || isTablet) ? 16 : 24,
        marginTop: 24
      }}>
        {opcoes.map((opcao) => (
          <div
            key={opcao.id}
            onClick={() => navigate(opcao.rota)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: (isMobile || isTablet) ? 20 : 32,
              border: "2px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = opcao.cor;
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.1)`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: `${opcao.cor}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: opcao.cor,
              flexShrink: 0
            }}>
              {opcao.icone}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: (isMobile || isTablet) ? 18 : 20,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 8,
                marginTop: 0
              }}>
                {opcao.titulo}
              </h3>
              <p style={{
                fontSize: (isMobile || isTablet) ? 13 : 14,
                color: "#6b7280",
                margin: 0,
                lineHeight: 1.5
              }}>
                {opcao.descricao}
              </p>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              color: opcao.cor,
              fontWeight: 600,
              fontSize: 14,
              gap: 8
            }}>
              <span>Acessar</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
