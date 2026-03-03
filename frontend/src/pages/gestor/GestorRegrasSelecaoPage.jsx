// src/pages/gestor/GestorRegrasSelecaoPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/useDevice";

export default function GestorRegrasSelecaoPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();

  const opcoes = [
    {
      id: "regras",
      titulo: "Regra de Horários",
      descricao: "Defina as regras de funcionamento, horários disponíveis e padrões da agenda",
      rota: "/gestor/regras-de-horarios/regras",
      icone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 7h8M8 12h5M8 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      cor: "#37648c"
    },
    {
      id: "bloqueios",
      titulo: "Bloqueio de Horários",
      descricao: "Crie bloqueios para eventos, manutenção ou períodos indisponíveis",
      rota: "/gestor/regras-de-horarios/bloqueios",
      icone: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      cor: "#b91c1c"
    }
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: (isMobile || isTablet) ? 20 : 24,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 8
          }}
        >
          Regra de Horários
        </h1>
        <p
          style={{
            fontSize: (isMobile || isTablet) ? 14 : 16,
            color: "#6b7280",
            margin: 0
          }}
        >
          Escolha o que você deseja gerenciar: regras da agenda ou bloqueios de horário
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "repeat(2, 1fr)",
          gap: (isMobile || isTablet) ? 16 : 24,
          marginTop: 24
        }}
      >
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
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: `${opcao.cor}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: opcao.cor,
                flexShrink: 0
              }}
            >
              {opcao.icone}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: (isMobile || isTablet) ? 18 : 20,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 8,
                  marginTop: 0
                }}
              >
                {opcao.titulo}
              </h3>
              <p
                style={{
                  fontSize: (isMobile || isTablet) ? 13 : 14,
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.5
                }}
              >
                {opcao.descricao}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: opcao.cor,
                fontWeight: 600,
                fontSize: 14,
                gap: 8
              }}
            >
              <span>Acessar</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

