import React from "react";
import { useNavigate } from "react-router-dom";
import IconBuilding from "../../components/icons/IconBuilding";
import IconArrowRight from "../../components/icons/IconArrowRight";
import IconCourtField from "../../components/icons/IconCourtField";

const opcoes = [
  {
    id: "complexo",
    titulo: "Configurações do Complexo",
    descricao: "Gerencie os dados do complexo, endereço e informações financeiras",
    rota: "/gestor/configuracoes/complexo",
    icone: <IconBuilding width={32} height={32} />,
    colorClass: "blue"
  },
  {
    id: "quadras",
    titulo: "Configurações das Quadras",
    descricao: "Gerencie as quadras do complexo, estruturas, materiais e modalidades",
    rota: "/gestor/configuracoes/quadras",
    icone: <IconCourtField width={32} height={32} />,
    colorClass: "green"
  }
];

const GestorConfiguracoesSelecaoPage = () => {
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
              <IconArrowRight width={20} height={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GestorConfiguracoesSelecaoPage;
