import React from "react";
import { formatarMoeda } from "../../utils/formatters";

const SlotCard = ({ slotAgregado, totalQuadras, onSlotClick }) => {
  const pagas = slotAgregado.reservadasPagas || 0;
  const pendentes = slotAgregado.reservadasPendentes || 0;
  const disponiveis = slotAgregado.disponiveis || 0;
  const totalReservadas = pagas + pendentes;
  const isBloqueado = slotAgregado.bloqueadas === totalQuadras;

  let status = "DISPONIVEL";
  if (isBloqueado) status = "BLOQUEADO";
  else if (totalReservadas > 0) status = "RESERVADO";

  const handleClick = () => {
    if (!isBloqueado) onSlotClick(status, slotAgregado);
  };

  let cardClass = "dash-slot-card";
  if (isBloqueado) cardClass += " dash-slot-card--bloqueado";
  else if (totalReservadas > 0 && disponiveis === 0) cardClass += " dash-slot-card--ocupado";
  else if (totalReservadas > 0) cardClass += " dash-slot-card--misto";

  return (
    <div className={cardClass} onClick={handleClick}>
      <div className="dash-slot-card-hora">{slotAgregado.hora} - {slotAgregado.hora_fim}</div>
      {isBloqueado ? (
        <div className="dash-slot-card-status-text">Bloqueado</div>
      ) : (
        <>
          <div className="dash-slot-card-disp">
            {totalQuadras > 1
              ? `${disponiveis} de ${totalQuadras} disponíveis`
              : disponiveis > 0 ? "Disponível" : "Sem vagas"}
          </div>
          {pagas > 0 && (
            <div className="dash-slot-card-row dash-slot-card-row--pago">
              <span className="dash-slot-card-dot dash-slot-card-dot--pago" />
              <span>{pagas} pago{pagas > 1 ? "s" : ""}</span>
            </div>
          )}
          {pendentes > 0 && (
            <div className="dash-slot-card-row dash-slot-card-row--pendente">
              <span className="dash-slot-card-dot dash-slot-card-dot--pendente" />
              <span>{pendentes} pendente{pendentes > 1 ? "s" : ""}</span>
            </div>
          )}
          {slotAgregado.preco_hora > 0 && (
            <div className="dash-slot-card-preco">{formatarMoeda(slotAgregado.preco_hora)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default SlotCard;
