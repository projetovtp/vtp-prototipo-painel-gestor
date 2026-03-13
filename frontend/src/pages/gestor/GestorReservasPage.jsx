import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useGestorReservas, useGestorQuadras, useGestorAgenda } from "../../hooks/api";
import { ErrorMessage, LoadingSpinner, EmptyState } from "../../components/ui";

const formatarDataBR = (isoDate) => {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
};

const formatarMoeda = (valor) => {
  if (!valor && valor !== 0) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

const formatarCPF = (cpf) => {
  if (!cpf) return "";
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatarTelefone = (telefone) => {
  if (!telefone) return "";
  const telLimpo = telefone.replace(/\D/g, "");
  if (telLimpo.length === 11)
    return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (telLimpo.length === 10)
    return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return telefone;
};

const getNomeDiaSemana = (dataISO) => {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = new Date(`${dataISO}T12:00:00`);
  return dias[data.getDay()];
};

const getNomeMes = (mes) => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return meses[mes];
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const extrairNomeQuadra = (quadra) => {
  if (!quadra) return "Quadra não encontrada";
  if (quadra.nome) return quadra.nome;
  return `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
};

// ─── Componente de campo da reserva (label + value) ─────────────────────────

const CampoReserva = ({ label, children }) => (
  <div>
    <label className="rv-modal-field-label">{label}</label>
    <div className="rv-modal-field-value">{children}</div>
  </div>
);

// ─── Dados do cliente dentro do modal ────────────────────────────────────────

const DadosCliente = ({ reserva }) => {
  const nome = reserva.usuario_nome || reserva.nome;
  return (
    <div>
      <label className="rv-modal-field-label">Dados do Cliente</label>
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {nome && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">Nome: </span>
            <span className="rv-client-row-value">{nome}</span>
          </div>
        )}
        {reserva.user_cpf && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">CPF: </span>
            <span className="rv-client-row-value">{formatarCPF(reserva.user_cpf)}</span>
          </div>
        )}
        {reserva.phone && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">Telefone: </span>
            <span className="rv-client-row-value">{formatarTelefone(reserva.phone)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Card de reserva individual (usado na lista múltipla) ────────────────────

const ReservaCard = ({ reserva, index, onCancelar, cancelando }) => {
  const statusPg = reserva.pago_via_pix ? "Reservado" : "Pendente";
  const nomeQuadra = extrairNomeQuadra(reserva.quadra);

  return (
    <div className="rv-reserva-item">
      <div className="rv-reserva-item-header">
        <h4 className="rv-reserva-item-title">Reserva {index + 1}</h4>
        <span className={`rv-modal-status rv-modal-status--${statusPg === "Reservado" ? "reservado" : "pendente"}`}>
          {statusPg}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CampoReserva label="Quadra">{nomeQuadra}</CampoReserva>
        <CampoReserva label="Data e Horário">
          {formatarDataBR(reserva.data)} às {reserva.hora}
        </CampoReserva>
        <DadosCliente reserva={reserva} />
        <CampoReserva label="Valor">
          <span className="rv-modal-field-value--lg">
            {formatarMoeda(reserva.preco_total || 0)}
          </span>
        </CampoReserva>

        <button
          type="button"
          className="dash-btn--cancel-sm"
          onClick={() => onCancelar(reserva.id)}
          disabled={cancelando}
        >
          {cancelando ? "Cancelando..." : "Cancelar Reserva"}
        </button>
      </div>
    </div>
  );
};

// ─── Modal de detalhes / criar reserva ───────────────────────────────────────

const DetalhesReservaModal = ({ aberto, onFechar, reserva, reservas, onCancelado, onCriada }) => {
  const { cancelar: cancelarReserva, criar: criarReserva } = useGestorReservas();
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");

  const reservasDoSlot = reserva?.todasReservas || reservas || [];
  const listaReservas = reservasDoSlot.length > 0 ? reservasDoSlot : (reserva ? [reserva] : []);
  const reservaAtual = listaReservas[0] || reserva;
  const temMultiplasReservas = listaReservas.length > 1;
  const isNovaReserva = reservaAtual && !reservaAtual.id;

  useEffect(() => {
    if (aberto && isNovaReserva) {
      setValor(reservaAtual.preco_hora ? String(reservaAtual.preco_hora) : "");
      setNome("");
      setCpf("");
      setPhone("");
      setErro("");
    }
  }, [aberto, isNovaReserva, reservaAtual]);

  if (!aberto || !reservaAtual) return null;

  const handleCancelar = async (reservaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      setCancelando(true);
      setErro("");
      await cancelarReserva(reservaId);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao cancelar reserva.");
    } finally {
      setCancelando(false);
    }
  };

  const handleCriarReserva = async () => {
    try {
      setSalvando(true);
      setErro("");
      if (!cpf || !nome) {
        setErro("Informe pelo menos CPF e nome do cliente.");
        setSalvando(false);
        return;
      }
      const body = {
        quadraId: reservaAtual.quadra_id,
        data: reservaAtual.data,
        hora: reservaAtual.hora,
        nome,
        cpf,
        phone,
      };
      if (valor !== "") body.valor = Number(valor);
      await criarReserva(body);
      if (onCriada) onCriada();
      onFechar();
    } catch (error) {
      console.error("[CRIAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao criar reserva.");
    } finally {
      setSalvando(false);
    }
  };

  const statusPagamento = reservaAtual.pago_via_pix ? "Reservado" : "Pendente";
  const nomeQuadra = extrairNomeQuadra(reservaAtual.quadra);

  const tituloModal = isNovaReserva
    ? "Nova Reserva"
    : temMultiplasReservas
      ? `Detalhe das reservas (${listaReservas.length})`
      : "Detalhes da Reserva";

  return (
    <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div
        className="vt-modal"
        style={{ maxWidth: temMultiplasReservas ? 700 : 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vt-modal-header">
          <h3 className="dash-modal-title">{tituloModal}</h3>
          <button type="button" className="vt-modal-close" onClick={onFechar}>×</button>
        </div>

        <div className="vt-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

          {temMultiplasReservas && !isNovaReserva ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
              {listaReservas.map((reservaItem, index) => (
                <ReservaCard
                  key={reservaItem.id || index}
                  reserva={reservaItem}
                  index={index}
                  onCancelar={handleCancelar}
                  cancelando={cancelando}
                />
              ))}
            </div>
          ) : (
            <>
              <CampoReserva label="Quadra">{nomeQuadra}</CampoReserva>
              <CampoReserva label="Data e Horário">
                {formatarDataBR(reservaAtual.data)} às {reservaAtual.hora}
              </CampoReserva>

              {!isNovaReserva ? (
                <>
                  <DadosCliente reserva={reservaAtual} />
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      <CampoReserva label="Valor">
                        <span className="rv-modal-field-value--lg">
                          {formatarMoeda(reservaAtual.preco_total || 0)}
                        </span>
                      </CampoReserva>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="rv-modal-field-label">Status do Pagamento</label>
                      <div style={{ marginTop: 4 }}>
                        <span className={`rv-modal-status rv-modal-status--${statusPagamento === "Reservado" ? "reservado" : "pendente"}`}>
                          {statusPagamento}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label>Nome do Cliente *</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="form-field">
                    <label>CPF *</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="form-field">
                    <label>Telefone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="form-field">
                    <label>Valor</label>
                    <input
                      type="number"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn--secondary" onClick={onFechar}>
            Fechar
          </button>
          {!isNovaReserva && !temMultiplasReservas && (
            <button
              type="button"
              className="dash-btn dash-btn--danger"
              onClick={() => handleCancelar(reservaAtual.id)}
              disabled={cancelando}
            >
              {cancelando ? "Cancelando..." : "Cancelar Reserva"}
            </button>
          )}
          {isNovaReserva && (
            <button
              type="button"
              className="dash-btn dash-btn--primary"
              onClick={handleCriarReserva}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Criar Reserva"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Slot de horário individual (mesmo estilo do Dashboard) ──────────────────

const SlotCard = ({ slotAgregado, totalQuadras, onClickDisponivel, onClickReservado }) => {
  const pagas = slotAgregado.reservadasPagas || 0;
  const pendentes = slotAgregado.reservadasPendentes || 0;
  const disponiveis = slotAgregado.disponiveis || 0;
  const totalReservadas = pagas + pendentes;
  const isBloqueado = slotAgregado.bloqueadas === totalQuadras;

  let status = "DISPONIVEL";
  if (isBloqueado) status = "BLOQUEADO";
  else if (totalReservadas > 0) status = "RESERVADO";

  const handleClick = () => {
    if (isBloqueado) return;
    if (status === "DISPONIVEL") {
      onClickDisponivel(slotAgregado.hora);
    } else if (status === "RESERVADO") {
      onClickReservado(slotAgregado.hora, slotAgregado.reservas);
    }
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

// ─── Grupo de quadras (ex: "Indoor - Beach Tennis") ──────────────────────────

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
              onClickDisponivel={handleClickDisponivel}
              onClickReservado={handleClickReservado}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Página principal ────────────────────────────────────────────────────────

const GestorReservasPage = () => {
  const { listar: listarReservasApi } = useGestorReservas();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras } = useGestorAgenda();

  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erro, setErro] = useState("");

  const [modoVisualizacao, setModoVisualizacao] = useState("dia");
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [diaClicado, setDiaClicado] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  useEffect(() => {
    carregarReservas();
    carregarRegrasHorarios();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modoVisualizacao === "dia") {
      carregarSlotsTodasQuadras(dataSelecionada);
    } else if (diaClicado) {
      carregarSlotsTodasQuadras(diaClicado);
    }
  }, [modoVisualizacao, dataSelecionada, diaClicado, quadras, reservas, regrasHorarios]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarReservas = async () => {
    try {
      setCarregando(true);
      setErro("");
      const dados = await listarReservasApi() || {};
      setReservas(dados.reservas || []);
      let quadrasCarregadas = dados.quadras || [];

      const quadrasExpandidas = [];
      const quadrasPorNome = {};
      quadrasCarregadas.forEach((quadra) => {
        const nome = extrairNomeQuadra(quadra);
        if (!quadrasPorNome[nome]) quadrasPorNome[nome] = [];
        quadrasPorNome[nome].push(quadra);
      });

      Object.entries(quadrasPorNome).forEach(([nomeQuadra, quadrasGrupo]) => {
        if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 6; i++) {
            quadrasExpandidas.push({ ...primeira, id: `beach-tennis-${i + 1}-${primeira.id}` });
          }
        }
        if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 3; i++) {
            quadrasExpandidas.push({ ...primeira, id: `padel-${i + 1}-${primeira.id}` });
          }
        }
      });

      setQuadras([...quadrasCarregadas, ...quadrasExpandidas]);

      if (!dados.reservas || dados.reservas.length === 0) {
        setDataSelecionada(new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
      setErro(error?.response?.data?.error || "Erro ao carregar reservas.");
    } finally {
      setCarregando(false);
    }
  };

  const carregarRegrasHorarios = async () => {
    try {
      const dataQuadras = await listarQuadrasApi();
      const quadrasData = Array.isArray(dataQuadras) ? dataQuadras : dataQuadras?.quadras || [];
      const todasRegras = [];

      for (const quadra of quadrasData) {
        try {
          const dataRegras = await listarRegras({ quadraId: quadra.id });
          const regras = dataRegras?.regras || [];
          regras.forEach(regra => todasRegras.push({ ...regra, quadra_id: quadra.id }));
        } catch {
          // continua para próxima quadra
        }
      }
      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro ao carregar regras:", error);
    }
  };

  const dataTemRegras = useCallback((dataISO) => {
    if (!dataISO || regrasHorarios.length === 0) return false;
    const data = new Date(`${dataISO}T12:00:00`);
    return regrasHorarios.some(regra => regra.dia_semana === data.getDay());
  }, [regrasHorarios]);

  const gerarReservasExemplo = useCallback((quadraId, dataISO, horaStr) => {
    if (!quadras || quadras.length === 0) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

    const quadra = quadras.find(q => q.id === quadraId);
    if (!quadra) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

    const nomeQuadra = extrairNomeQuadra(quadra);
    const hora = parseInt(horaStr.split(":")[0]);
    const hash = quadraId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
      const idx = hash % 6;
      if (hora === 14) {
        if (idx === 0) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "123.456.789-00", phone: "(11) 98765-4321", preco_total: 150, pago_via_pix: true, nome: "João Silva", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
        if (idx === 1) return { status: "RESERVADO", reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "987.654.321-00", phone: "(11) 91234-5678", preco_total: 150, pago_via_pix: false, nome: "Maria Santos", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      }
      if (idx === 0 && (hora === 9 || hora === 10)) return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bloqueio-${quadraId}-${dataISO}-${horaStr}` }, reserva: null };
      if (idx === 3 && (hora === 18 || hora === 19)) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "111.222.333-44", phone: "(11) 99876-5432", preco_total: 150, pago_via_pix: true, nome: "Pedro Oliveira", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }

    if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
      const idx = hash % 3;
      if (idx === 0 && (hora === 11 || hora === 12)) return { status: "BLOQUEADO", bloqueio: { motivo: "Bloqueado", id: `bloqueio-${quadraId}-${dataISO}-${horaStr}` }, reserva: null };
      if (idx === 1 && (hora === 18 || hora === 19)) return { status: "RESERVADO", reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "555.666.777-88", phone: "(11) 97654-3210", preco_total: 200, pago_via_pix: true, nome: "Ana Costa", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
      if (idx === 2 && (hora === 20 || hora === 21)) return { status: "RESERVADO", reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "999.888.777-66", phone: "(11) 96543-2109", preco_total: 200, pago_via_pix: false, nome: "Carlos Mendes", quadra_id: quadraId, data: dataISO, hora: horaStr }, bloqueio: null };
    }

    const reservaReal = reservas.find((r) => {
      const reservaData = r.data?.split("T")[0] || r.data;
      const reservaHora = r.hora || r.hora_inicio || "";
      return r.quadra_id === quadraId && reservaData === dataISO && reservaHora.startsWith(horaStr.split(":")[0]);
    });

    if (reservaReal) {
      return {
        status: "RESERVADO",
        reserva: { id: reservaReal.id, user_cpf: reservaReal.user_cpf, phone: reservaReal.phone, preco_total: reservaReal.preco_total, pago_via_pix: reservaReal.pago_via_pix, nome: reservaReal.nome || reservaReal.user_name },
        bloqueio: null,
      };
    }

    return { status: "DISPONIVEL", reserva: null, bloqueio: null };
  }, [quadras, reservas]);

  const gerarSlotsMock = useCallback((dataISO) => {
    if (!dataISO || quadras.length === 0) return {};

    const slotsAgrupados = {};
    const data = new Date(`${dataISO}T12:00:00`);
    const diaSemana = data.getDay();

    quadras.forEach((quadra) => {
      const regrasQuadra = regrasHorarios.filter(r => r.quadra_id === quadra.id && r.dia_semana === diaSemana);
      const slotsDoDia = [];

      const gerarSlots = (horaInicio, horaFim, precoHora) => {
        for (let hora = horaInicio; hora < horaFim; hora++) {
          const horaStr = `${String(hora).padStart(2, "0")}:00`;
          const horaFimStr = `${String(hora + 1).padStart(2, "0")}:00`;
          const ex = gerarReservasExemplo(quadra.id, dataISO, horaStr);
          slotsDoDia.push({
            data: dataISO,
            hora: horaStr,
            hora_fim: horaFimStr,
            status: ex.status,
            preco_hora: precoHora,
            reserva: ex.reserva,
            bloqueio: ex.bloqueio,
          });
        }
      };

      if (regrasQuadra.length === 0) {
        gerarSlots(8, 22, 100);
      } else {
        regrasQuadra.forEach((regra) => {
          const hi = parseInt(regra.hora_inicio.split(":")[0]);
          const hf = parseInt(regra.hora_fim.split(":")[0]);
          gerarSlots(hi, hf, regra.preco_hora || 100);
        });
      }

      slotsAgrupados[quadra.id] = slotsDoDia.sort((a, b) => a.hora.localeCompare(b.hora));
    });

    return slotsAgrupados;
  }, [quadras, regrasHorarios, gerarReservasExemplo]);

  const carregarSlotsTodasQuadras = useCallback((dataISO) => {
    if (!dataISO || quadras.length === 0) {
      setSlotsPorQuadra({});
      return;
    }
    setCarregandoSlots(true);
    setSlotsPorQuadra(gerarSlotsMock(dataISO));
    setCarregandoSlots(false);
  }, [quadras, gerarSlotsMock]);

  const getNomeQuadra = (quadraId) => {
    const quadra = quadras.find(q => q.id === quadraId);
    return extrairNomeQuadra(quadra);
  };

  const gruposQuadras = useMemo(() => {
    const grupos = {};
    quadras.forEach((quadra) => {
      const nome = getNomeQuadra(quadra.id);
      if (!grupos[nome]) grupos[nome] = [];
      grupos[nome].push(quadra);
    });
    return grupos;
  }, [quadras]); // eslint-disable-line react-hooks/exhaustive-deps

  const agregarSlotsGrupo = useCallback((quadrasGrupo) => {
    const slotsAgregados = {};

    quadrasGrupo.forEach((quadra) => {
      const slots = slotsPorQuadra[quadra.id] || [];
      slots.forEach((slot) => {
        const hora = slot.hora || slot.hora_inicio || "";
        if (!slotsAgregados[hora]) {
          slotsAgregados[hora] = {
            hora,
            hora_fim: slot.hora_fim || `${String(parseInt(hora.split(":")[0]) + 1).padStart(2, "0")}:00`,
            disponiveis: 0,
            reservadasPagas: 0,
            reservadasPendentes: 0,
            bloqueadas: 0,
            total: quadrasGrupo.length,
            reservas: [],
            bloqueios: [],
            preco_hora: slot.preco_hora || 100,
          };
        }

        const status = (slot.status || "").toUpperCase();
        if (status === "DISPONIVEL" || status === "LIVRE") {
          slotsAgregados[hora].disponiveis++;
        } else if (status === "RESERVADO" || status === "RESERVADA") {
          if (slot.reserva?.pago_via_pix === true) slotsAgregados[hora].reservadasPagas++;
          else slotsAgregados[hora].reservadasPendentes++;
          if (slot.reserva) slotsAgregados[hora].reservas.push(slot.reserva);
        } else if (status === "BLOQUEADO" || status === "BLOQUEADA") {
          slotsAgregados[hora].bloqueadas++;
          if (slot.bloqueio) slotsAgregados[hora].bloqueios.push(slot.bloqueio);
        }
      });
    });

    return Object.values(slotsAgregados).sort((a, b) => a.hora.localeCompare(b.hora));
  }, [slotsPorQuadra]);

  // ─── Navegação ─────────────────────────────────────────────────────────────

  const avancarMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  const retrocederMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));

  const avancarDia = () => {
    const d = new Date(`${dataSelecionada}T12:00:00`);
    d.setDate(d.getDate() + 1);
    setDataSelecionada(d.toISOString().split("T")[0]);
  };

  const retrocederDia = () => {
    const d = new Date(`${dataSelecionada}T12:00:00`);
    d.setDate(d.getDate() - 1);
    setDataSelecionada(d.toISOString().split("T")[0]);
  };

  const avancarSemana = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() + 7);
    setDataSelecionada(d.toISOString().split("T")[0]);
  };

  const retrocederSemana = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() - 7);
    setDataSelecionada(d.toISOString().split("T")[0]);
  };

  const irParaHoje = () => {
    const hoje = new Date();
    setDataSelecionada(hoje.toISOString().split("T")[0]);
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaClicado(null);
  };

  // ─── Handlers do modal ─────────────────────────────────────────────────────

  const abrirModal = (dadosReserva) => {
    setReservaSelecionada(dadosReserva);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setReservaSelecionada(null);
  };

  const handleMudanca = () => {
    carregarReservas();
    const dataSlots = modoVisualizacao === "dia" ? dataSelecionada : diaClicado;
    if (dataSlots) carregarSlotsTodasQuadras(dataSlots);
  };

  // ─── Visualização de slots de um dia (compartilhada por dia/semana/mês) ────

  const renderSlotsDoDia = (dataISO) => {
    if (carregandoSlots) return <LoadingSpinner mensagem="Carregando horários..." />;

    return (
      <div className="rv-groups">
        {Object.entries(gruposQuadras).map(([nomeGrupo, quadrasGrupo]) => (
          <GrupoQuadras
            key={nomeGrupo}
            nomeGrupo={nomeGrupo}
            quadrasGrupo={quadrasGrupo}
            slotsAgregados={agregarSlotsGrupo(quadrasGrupo)}
            dataISO={dataISO}
            quadras={quadras}
            onAbrirModal={abrirModal}
          />
        ))}
      </div>
    );
  };

  // ─── Detalhes de um dia (usado em semana/mês ao clicar um dia) ─────────────

  const renderDetalhesDoDia = (dataISO) => (
    <div>
      <button type="button" className="rv-back-btn" onClick={() => setDiaClicado(null)}>
        ← Voltar
      </button>
      <h3 className="rv-day-title">Horários de {formatarDataBR(dataISO)}</h3>
      {renderSlotsDoDia(dataISO)}
    </div>
  );

  // ─── Visualização semanal ──────────────────────────────────────────────────

  const renderVisualizacaoSemanal = () => {
    if (diaClicado) return renderDetalhesDoDia(diaClicado);

    const ref = new Date(`${dataSelecionada}T12:00:00`);
    const diaSemana = ref.getDay();
    const inicioSemana = new Date(ref);
    inicioSemana.setDate(ref.getDate() - diaSemana);

    const diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const dataISO = dia.toISOString().split("T")[0];
      const reservasDoDia = reservas.filter(r => r.data === dataISO);
      diasSemana.push({
        dia: dia.getDate(),
        data: dataISO,
        nomeDia: getNomeDiaSemana(dataISO),
        temRegras: dataTemRegras(dataISO),
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }

    return (
      <div>
        <div className="rv-calendar-header">
          {DIAS_SEMANA.map(d => <div key={d} className="rv-calendar-header-cell">{d}</div>)}
        </div>
        <div className="rv-calendar-grid">
          {diasSemana.map((dia) => {
            if (!dia.temRegras) {
              return (
                <div key={dia.data} className="rv-calendar-day rv-calendar-day--disabled">
                  <div className="rv-calendar-day-label">{dia.nomeDia}</div>
                  <div className="rv-calendar-day-num" style={{ color: "var(--color-text-muted)" }}>{dia.dia}</div>
                  <div className="rv-calendar-day-sub">Sem regras</div>
                </div>
              );
            }
            return (
              <button
                key={dia.data}
                type="button"
                className={`rv-calendar-day${dia.temReservas ? " rv-calendar-day--has-reservas" : ""}`}
                onClick={() => setDiaClicado(dia.data)}
              >
                <div className="rv-calendar-day-label">{dia.nomeDia}</div>
                <div className="rv-calendar-day-num">{dia.dia}</div>
                {dia.temReservas && (
                  <div className="rv-calendar-day-count">
                    {dia.quantidadeReservas} reserva{dia.quantidadeReservas !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Visualização mensal ───────────────────────────────────────────────────

  const renderVisualizacaoMensal = () => {
    if (diaClicado) return renderDetalhesDoDia(diaClicado);

    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicialSemana; i++) dias.push(null);
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const reservasDoDia = reservas.filter(r => r.data === dataISO);
      dias.push({
        dia,
        data: dataISO,
        temRegras: dataTemRegras(dataISO),
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }

    return (
      <div>
        <div className="rv-calendar-header">
          {DIAS_SEMANA.map(d => <div key={d} className="rv-calendar-header-cell">{d}</div>)}
        </div>
        <div className="rv-calendar-grid">
          {dias.map((dia, index) => {
            if (!dia) return <div key={`empty-${index}`} />;

            if (!dia.temRegras) {
              return (
                <div key={dia.data} className="rv-calendar-day rv-calendar-day--disabled">
                  <div className="rv-calendar-day-num" style={{ color: "var(--color-text-muted)" }}>{dia.dia}</div>
                  <div className="rv-calendar-day-sub">Sem regras</div>
                </div>
              );
            }

            return (
              <button
                key={dia.data}
                type="button"
                className={`rv-calendar-day${dia.temReservas ? " rv-calendar-day--has-reservas" : ""}`}
                onClick={() => setDiaClicado(dia.data)}
              >
                <div className="rv-calendar-day-num">{dia.dia}</div>
                {dia.temReservas && (
                  <div className="rv-calendar-day-count">{dia.quantidadeReservas}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <h2 className="page-title">Reservas</h2>
      <p className="rv-subtitle">
        Visualize e gerencie todas as reservas de todas as suas quadras
      </p>
      <div className="rv-wrapper">

        <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

        <div className="rv-controls">
          <div className="rv-mode-tabs">
            {["dia", "semana", "mes"].map((modo) => (
              <button
                key={modo}
                type="button"
                className={`rv-mode-tab${modoVisualizacao === modo ? " rv-mode-tab--active" : ""}`}
                onClick={() => { setModoVisualizacao(modo); setDiaClicado(null); }}
              >
                {modo === "dia" ? "Dia" : modo === "semana" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          <div className="rv-nav">
            {modoVisualizacao === "dia" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={retrocederDia}>←</button>
                <input
                  type="date"
                  className="rv-date-input"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                />
                <button type="button" className="rv-nav-btn" onClick={avancarDia}>→</button>
              </>
            )}

            {modoVisualizacao === "semana" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={retrocederSemana}>←</button>
                <button type="button" className="rv-nav-btn" onClick={irParaHoje}>Hoje</button>
                <button type="button" className="rv-nav-btn" onClick={avancarSemana}>→</button>
              </>
            )}

            {modoVisualizacao === "mes" && (
              <>
                <button type="button" className="rv-nav-btn" onClick={retrocederMes}>←</button>
                <div className="rv-nav-label">
                  {getNomeMes(mesAtual.getMonth())} {mesAtual.getFullYear()}
                </div>
                <button type="button" className="rv-nav-btn" onClick={avancarMes}>→</button>
                <button type="button" className="rv-nav-btn" onClick={irParaHoje}>Hoje</button>
              </>
            )}
          </div>
        </div>

        {carregando ? (
          <LoadingSpinner mensagem="Carregando reservas..." />
        ) : (
          <>
            {modoVisualizacao === "dia" && renderSlotsDoDia(dataSelecionada)}
            {modoVisualizacao === "semana" && renderVisualizacaoSemanal()}
            {modoVisualizacao === "mes" && renderVisualizacaoMensal()}
          </>
        )}
      </div>

      {modalAberto && (
        <DetalhesReservaModal
          aberto={modalAberto}
          onFechar={fecharModal}
          reserva={reservaSelecionada}
          reservas={reservaSelecionada?.todasReservas}
          onCancelado={handleMudanca}
          onCriada={handleMudanca}
        />
      )}
    </div>
  );
};

export default GestorReservasPage;
