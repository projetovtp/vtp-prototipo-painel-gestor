import React from "react";
import SlotCard from "../ui/SlotCard";

const GrupoQuadras = ({ nomeGrupo, quadrasGrupo, slotsAgregados, dataISO, quadras, onAbrirModal }) => {
  const totalQuadras = quadrasGrupo.length;

  const handleClickDisponivel = (horaSlot) => {
    const primeiraQuadra = quadrasGrupo[0];
    onAbrirModal({
      quadra_id: primeiraQuadra.id,
      data: dataISO,
      hora: horaSlot,
      preco_hora: slotsAgregados.find(s => s.hora === horaSlot)?.preco_hora || 0,
      quadra: primeiraQuadra,
      grupoQuadras: totalQuadras > 1 ? quadrasGrupo : null,
    });
  };

  const handleClickReservado = (horaSlot, reservasSlot) => {
    if (!reservasSlot || reservasSlot.length === 0) return;
    const reservasCompletas = reservasSlot.map((res) => {
      const quadraReserva = quadras.find(q => q.id === res.quadra_id) || quadrasGrupo[0];
      return {
        ...res,
        quadra: quadraReserva,
        data: res.data || dataISO,
        hora: res.hora || horaSlot,
        nome: res.nome || res.usuario_nome || res.user_name || "Cliente",
      };
    });
    onAbrirModal({
      ...reservasCompletas[0],
      todasReservas: reservasCompletas,
    });
  };

  return (
    <div className="rv-group">
      <h4 className="rv-group-title">{nomeGrupo}</h4>
      {totalQuadras > 1 && <p className="rv-group-count">{totalQuadras} quadras</p>}

      {slotsAgregados.length === 0 ? (
        <div className="rv-slot-empty">Nenhum horário disponível para esta data.</div>
      ) : (
        <div className="rv-slots">
          {slotsAgregados.map((slotAgregado, index) => (
            <SlotCard
              key={index}
              slotAgregado={slotAgregado}
              totalQuadras={totalQuadras}
              onSlotClick={(status, slot) => {
                if (status === "DISPONIVEL") handleClickDisponivel(slot.hora);
                else if (status === "RESERVADO") handleClickReservado(slot.hora, slot.reservas);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GrupoQuadras;
