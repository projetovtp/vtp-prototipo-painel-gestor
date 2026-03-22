import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DetalhesReservaModalDashboard from "../modals/DetalhesReservaModalDashboard";
import { formatarDataBR } from "../../utils/formatters";
import { mockQuadrasConfig } from "../../mocks/mockDashboard";
import SlotCard from "../ui/SlotCard";




const DashboardReservas = ({
  dataSelecionada,
  onDataChange,
  quadraSelecionadaId,
  onQuadraChange,
  gruposComSlots,
  carregandoReservas,
  quadras,
  onReservaChanged,
}) => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const handleSlotClick = (status, slotAgregado, grupo) => {
    if (status === "DISPONIVEL" || status === "LIVRE") {
      const primeiraQuadra = grupo.quadrasGrupo[0];
      setReservaSelecionada({
        quadra_id: primeiraQuadra.id,
        data: dataSelecionada,
        hora: slotAgregado.hora,
        preco_hora: slotAgregado.preco_hora || 0,
        quadra: primeiraQuadra,
        grupoQuadras: grupo.totalQuadras > 1 ? grupo.quadrasGrupo : null,
      });
      setModalAberto(true);
    } else if (status === "RESERVADO" || status === "RESERVADA") {
      if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
        const primeiraQuadra = grupo.quadrasGrupo[0];
        const completas = slotAgregado.reservas.map((res) => {
          const qr = quadras.find((q) => q.id === res.quadra_id) || primeiraQuadra;
          return {
            ...res,
            quadra: qr,
            data: res.data || dataSelecionada,
            hora: res.hora || slotAgregado.hora,
            nome: res.nome || res.usuario_nome || res.user_name || "Cliente",
          };
        });
        setReservaSelecionada({
          ...completas[0],
          todasReservas: completas,
          slotInfo: {
            quadra_id: primeiraQuadra.id,
            quadra: primeiraQuadra,
            data: dataSelecionada,
            hora: slotAgregado.hora,
            hora_fim: slotAgregado.hora_fim,
            preco_hora: slotAgregado.preco_hora || 0,
          },
        });
        setModalAberto(true);
      }
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setReservaSelecionada(null);
  };

  return (
    <>
      <div className="card dash-reservas">
        <div className="dash-reservas-header">
          <h3>Reservas</h3>
          <button className="dash-btn-sm" onClick={() => navigate("/gestor/reservas")}>
            Ver todas
          </button>
        </div>

        <div className="dash-filters">
          <div className="dash-filter-group">
            <label className="dash-filter-label">Data</label>
            <input
              type="date"
              className="dash-filter-input"
              value={dataSelecionada}
              onChange={(e) => onDataChange(e.target.value)}
            />
          </div>
          <div className="dash-filter-group">
            <label className="dash-filter-label">Quadra</label>
            <select
              className="dash-filter-select"
              value={quadraSelecionadaId}
              onChange={(e) => onQuadraChange(e.target.value)}
            >
              <option value="">Todas as quadras</option>
              {mockQuadrasConfig.map((q) => (
                <option key={q.id} value={q.id}>{q.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="dash-date-label">{formatarDataBR(dataSelecionada)}</div>

        <div className="dash-reservas-scroll">
          {carregandoReservas ? (
            <div className="dash-empty">Carregando...</div>
          ) : gruposComSlots.length === 0 ? (
            <div className="dash-empty">Nenhum horário disponível</div>
          ) : (
            <div className="dash-slot-groups">
              {gruposComSlots.map((grupo) => (
                <div key={grupo.nomeGrupo} className="dash-slot-group">
                  <div>
                    <h4 className="dash-slot-group-title">{grupo.nomeGrupo}</h4>
                    {grupo.totalQuadras > 1 && (
                      <p className="dash-slot-group-count">{grupo.totalQuadras} quadras</p>
                    )}
                  </div>
                  <div className="dash-slot-list">
                    {grupo.slotsAgregados.map((slot, i) => (
                     <SlotCard
                     key={i}
                     slotAgregado={slot}
                     totalQuadras={grupo.totalQuadras}
                     onSlotClick={(status, slot) => handleSlotClick(status, slot, grupo)}
                   />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <DetalhesReservaModalDashboard
          aberto={modalAberto}
          onFechar={fecharModal}
          reserva={reservaSelecionada}
          onCancelado={onReservaChanged}
          onCriada={onReservaChanged}
        />
      )}
    </>
  );
};

export default DashboardReservas;
