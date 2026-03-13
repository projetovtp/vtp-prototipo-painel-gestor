import React from "react";
import { useNavigate } from "react-router-dom";

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
    colorClass: "blue"
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
    colorClass: "green"
  }
];

export default function GestorConfiguracoesSelecaoPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="cfg-sel-subtitle">Escolha o tipo de configuração que deseja gerenciar</p>
      </div>

      <div className="cfg-sel-grid">
        {opcoes.map((opcao) => (
          <div
            key={opcao.id}
            className={`cfg-sel-card${opcao.colorClass === "green" ? " cfg-sel-card--green" : ""}`}
            onClick={() => navigate(opcao.rota)}
          >
            <div className={`cfg-sel-icon cfg-sel-icon--${opcao.colorClass}`}>
              {opcao.icone}
            </div>

            <div>
              <h3 className="cfg-sel-card-title">{opcao.titulo}</h3>
              <p className="cfg-sel-card-desc">{opcao.descricao}</p>
            </div>

            <div className={`cfg-sel-card-link cfg-sel-card-link--${opcao.colorClass}`}>
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
