import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DetalhesReservaModalDashboard from "../modals/DetalhesReservaModalDashboard";
import { formatarMoeda, formatarDataBR } from "../../utils/formatters";
import { mockQuadrasConfig } from "../../mocks/mockDashboard";

// ─── Slot Item ───────────────────────────────────────────────

const SlotItem = ({ slotAgregado, grupo, onSlotClick }) => {
  const pagas = slotAgregado.reservadasPagas || 0;
  const pendentes = slotAgregado.reservadasPendentes || 0;
  const disponiveis = slotAgregado.disponiveis || 0;
  const totalReservadas = pagas + pendentes;
  const isBloqueado = slotAgregado.bloqueadas === grupo.totalQuadras;

  let status = "DISPONIVEL";
  if (isBloqueado) status = "BLOQUEADO";
  else if (totalReservadas > 0) status = "RESERVADO";

  const handleClick = () => {
    if (!isBloqueado) onSlotClick(status, slotAgregado, grupo);
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
            {grupo.totalQuadras > 1
              ? `${disponiveis} de ${grupo.totalQuadras} disponíveis`
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

// ─── Dashboard Reservas ──────────────────────────────────────

/**
 * Painel de reservas do Dashboard do Gestor.
 *
 * Props:
 *  - dataSelecionada: string (YYYY-MM-DD)
 *  - onDataChange: fn(novaData)
 *  - quadraSelecionadaId: string
 *  - onQuadraChange: fn(novoId)
 *  - gruposComSlots: array — resultado de agregarSlotsGrupo() calculado pelo pai
 *  - carregandoReservas: bool
 *  - quadras: array — lista de quadras carregadas (para lookups no modal)
 *  - onReservaChanged: fn() — chamado após criar ou cancelar reserva para o pai recarregar dados
 */
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
                      <SlotItem key={i} slotAgregado={slot} grupo={grupo} onSlotClick={handleSlotClick} />
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
