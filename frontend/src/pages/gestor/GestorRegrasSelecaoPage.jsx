import React from "react";
import { useNavigate } from "react-router-dom";

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
    variante: "brand",
    cor: "var(--color-brand)"
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
    variante: "danger",
    cor: "#b91c1c"
  }
];

const GestorRegrasSelecaoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Regra de Horários</h1>
        <p style={{ fontSize: "var(--font-lg)", color: "var(--color-text-secondary)", margin: 0 }}>
          Escolha o que você deseja gerenciar: regras da agenda ou bloqueios de horário
        </p>
      </div>

      <div className="rh-selecao-grid">
        {opcoes.map((opcao) => (
          <div
            key={opcao.id}
            className={`rh-selecao-card rh-selecao-card--${opcao.variante}`}
            onClick={() => navigate(opcao.rota)}
          >
            <div
              className="rh-selecao-icon"
              style={{ backgroundColor: `${opcao.cor}15`, color: opcao.cor }}
            >
              {opcao.icone}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "var(--font-xl)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8, marginTop: 0 }}>
                {opcao.titulo}
              </h3>
              <p style={{ fontSize: "var(--font-base)", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {opcao.descricao}
              </p>
            </div>

            <div className="rh-selecao-link" style={{ color: opcao.cor }}>
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

export default GestorRegrasSelecaoPage;
