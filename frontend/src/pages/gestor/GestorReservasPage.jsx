import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

// Funções auxiliares
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
  if (telLimpo.length === 11) {
    return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (telLimpo.length === 10) {
    return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
};

// Obter nome do dia da semana
const getNomeDiaSemana = (dataISO) => {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = new Date(`${dataISO}T12:00:00`);
  return dias[data.getDay()];
};

// Obter nome do mês
const getNomeMes = (mes) => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return meses[mes];
};

// Modal para visualizar detalhes da reserva ou criar nova reserva
const DetalhesReservaModal = ({ aberto, onFechar, reserva, reservas, onCancelado, onCriada }) => {
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [reservaAtualIndex, setReservaAtualIndex] = useState(0);
  
  // Campos para criar nova reserva
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");

  // Se há múltiplas reservas, usar a lista; senão, usar a reserva única
  // Verificar se a reserva tem todasReservas (vem do slot agregado)
  const reservasDoSlot = reserva?.todasReservas || reservas || [];
  const listaReservas = reservasDoSlot.length > 0 ? reservasDoSlot : (reserva ? [reserva] : []);
  const reservaAtual = listaReservas[reservaAtualIndex] || reserva;
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
    setReservaAtualIndex(0);
  }, [aberto, isNovaReserva, reservaAtual]);

  if (!aberto || !reservaAtual) return null;

  const handleCancelar = async (reservaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    try {
      setCancelando(true);
      setErro("");
      await api.delete(`/gestor/reservas/${reservaId}`);
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

      if (valor !== "") {
        body.valor = Number(valor);
      }

      await api.post("/gestor/reservas", body);

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
  const nomeQuadra = reservaAtual.quadra
    ? `${reservaAtual.quadra.tipo || "Quadra"}${reservaAtual.quadra.modalidade ? ` - ${reservaAtual.quadra.modalidade}` : ""}`
    : "Quadra não encontrada";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: temMultiplasReservas ? 700 : 500,
          width: "100%",
          maxHeight: "90vh",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>
            {isNovaReserva ? "Nova Reserva" : temMultiplasReservas ? `Detalhe das reservas (${listaReservas.length})` : "Detalhes da Reserva"}
          </h3>
            <button 
                type="button" 
                onClick={onFechar}
                style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.5rem",
                    color: "#9ca3af",
                    cursor: "pointer",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
            </button>
          </div>

            {erro && (
          <div style={{ padding: 12, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 8, marginBottom: 16 }}>
                {erro}
              </div>
            )}

        {/* Se há múltiplas reservas, mostrar todas em lista */}
        {temMultiplasReservas && !isNovaReserva ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>
            {listaReservas.map((reservaItem, index) => {
              const statusPagamentoItem = reservaItem.pago_via_pix ? "Reservado" : "Pendente";
              const nomeQuadraItem = reservaItem.quadra
                ? `${reservaItem.quadra.tipo || "Quadra"}${reservaItem.quadra.modalidade ? ` - ${reservaItem.quadra.modalidade}` : ""}`
                : "Quadra não encontrada";

              return (
                <div
                  key={reservaItem.id || index}
              style={{
                    padding: 16,
                    backgroundColor: "#f9fafb",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>
                      Reserva {index + 1}
                    </h4>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusPagamentoItem === "Reservado" ? "#0d47a1" : "#f57f17",
                        padding: "4px 10px",
                        borderRadius: 6,
                        backgroundColor: statusPagamentoItem === "Reservado" ? "#90caf9" : "#fff9c4",
                      }}
                    >
                      {statusPagamentoItem}
                    </div>
            </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Quadra */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Quadra
                      </label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                        {nomeQuadraItem}
                </div>
              </div>
              
                    {/* Data e Horário */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Data e Horário
                      </label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                        {formatarDataBR(reservaItem.data)} às {reservaItem.hora}
                      </div>
              </div>

                    {/* Dados do Cliente */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Dados do Cliente
                      </label>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        {(reservaItem.usuario_nome || reservaItem.nome) && (
                          <div>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>Nome: </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                              {reservaItem.usuario_nome || reservaItem.nome}
                            </span>
              </div>
                        )}
                        {reservaItem.user_cpf && (
                          <div>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>CPF: </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                              {formatarCPF(reservaItem.user_cpf)}
                            </span>
              </div>
                        )}
                        {reservaItem.phone && (
                          <div>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>Telefone: </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                              {formatarTelefone(reservaItem.phone)}
                            </span>
                </div>
                        )}
              </div>
              </div>

                    {/* Valor */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Valor
                      </label>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 4 }}>
                        {formatarMoeda(reservaItem.preco_total || 0)}
            </div>
          </div>

                    {/* Botão Cancelar */}
            <button
              type="button"
                      onClick={async () => {
                        if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      setCancelando(true);
      setErro("");
                          await api.delete(`/gestor/reservas/${reservaItem.id}`);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
                          console.error("[CANCELAR RESERVA] Erro:", error);
                          setErro(error?.response?.data?.error || "Erro ao cancelar reserva.");
    } finally {
      setCancelando(false);
    }
                      }}
                      disabled={cancelando}
                style={{
                        padding: "8px 16px",
                        backgroundColor: cancelando ? "#9ca3af" : "#dc2626",
                        color: "#fff",
                    border: "none",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: cancelando ? "not-allowed" : "pointer",
                        alignSelf: "flex-start",
                      }}
                    >
                      {cancelando ? "Cancelando..." : "Cancelar Reserva"}
            </button>
          </div>
                </div>
              );
            })}
              </div>
            ) : (
          /* Reserva única ou nova reserva */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quadra */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quadra
              </label>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                {nomeQuadra}
              </div>
            </div>

            {/* Data e Horário */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Data e Horário
              </label>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                {formatarDataBR(reservaAtual.data)} às {reservaAtual.hora}
              </div>
                   </div>
                   
            {/* Dados do Cliente */}
            {!isNovaReserva ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Dados do Cliente
                </label>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(reservaAtual.usuario_nome || reservaAtual.nome) && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>Nome: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {reservaAtual.usuario_nome || reservaAtual.nome}
                      </span>
                   </div>
                  )}
                  {reservaAtual.user_cpf && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>CPF: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {formatarCPF(reservaAtual.user_cpf)}
                      </span>
                </div>
                  )}
                  {reservaAtual.phone && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>Telefone: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {formatarTelefone(reservaAtual.phone)}
                      </span>
                    </div>
                  )}
                  </div>
                  </div>
            ) : (
              /* Formulário para nova reserva */
              <>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                    Nome do Cliente *
                  </label>
                    <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    />
                  </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                    CPF *
                  </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    />
                  </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                    Telefone
                  </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    />
                  </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                    Valor
                  </label>
                     <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                    placeholder="0.00"
                        step="0.01"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </>
            )}

            {/* Valor e Status */}
            {!isNovaReserva && (
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Valor
                  </label>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {formatarMoeda(reservaAtual.preco_total || 0)}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Status do Pagamento
                  </label>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: statusPagamento === "Reservado" ? "#0d47a1" : "#f57f17",
                      marginTop: 4,
                      padding: "4px 12px",
                      borderRadius: 6,
                      backgroundColor: statusPagamento === "Reservado" ? "#90caf9" : "#fff9c4",
                      display: "inline-block",
                    }}
                  >
                    {statusPagamento}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
             <button
                type="button"
                onClick={onFechar}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
             >
                Fechar
             </button>
          {!isNovaReserva && !temMultiplasReservas && (
             <button
                type="button"
              onClick={() => handleCancelar(reservaAtual.id)}
              disabled={cancelando}
              style={{
                padding: "10px 20px",
                backgroundColor: cancelando ? "#9ca3af" : "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: cancelando ? "not-allowed" : "pointer",
              }}
            >
              {cancelando ? "Cancelando..." : "Cancelar Reserva"}
             </button>
          )}
          {isNovaReserva && (
            <button
              type="button"
              onClick={handleCriarReserva}
              disabled={salvando}
              style={{
                padding: "10px 20px",
                backgroundColor: salvando ? "#9ca3af" : "#37648c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: salvando ? "not-allowed" : "pointer",
              }}
            >
              {salvando ? "Salvando..." : "Criar Reserva"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const GestorReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]); // Regras de todas as quadras
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({}); // Slots de todas as quadras por data
  const [carregando, setCarregando] = useState(false);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erro, setErro] = useState("");

  // Estados do calendário
  const [modoVisualizacao, setModoVisualizacao] = useState("dia"); // "dia", "semana", "mes"
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0];
  });
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [diaClicado, setDiaClicado] = useState(null); // Para visualização semanal/mensal

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  // Carregar reservas e regras ao montar o componente
  useEffect(() => {
    carregarReservas();
    carregarRegrasHorarios();
  }, []);

  // Carregar slots quando a data selecionada mudar (modo dia) ou quando diaClicado mudar
  useEffect(() => {
    if (modoVisualizacao === "dia") {
      carregarSlotsTodasQuadras(dataSelecionada);
    } else if (diaClicado) {
      carregarSlotsTodasQuadras(diaClicado);
    }
  }, [modoVisualizacao, dataSelecionada, diaClicado, quadras, reservas, regrasHorarios]);

  const carregarReservas = async () => {
    try {
      setCarregando(true);
        setErro("");

      const response = await api.get("/gestor/reservas");
      const dados = response.data || {};

      setReservas(dados.reservas || []);
      let quadrasCarregadas = dados.quadras || [];

      // Adicionar quadras de exemplo para grupos específicos
      const quadrasExpandidas = [];
      const gruposProcessados = new Set();

      // Agrupar quadras por nome primeiro
      const quadrasPorNome = {};
      quadrasCarregadas.forEach((quadra) => {
        const nomeQuadra = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
        if (!quadrasPorNome[nomeQuadra]) {
          quadrasPorNome[nomeQuadra] = [];
        }
        quadrasPorNome[nomeQuadra].push(quadra);
      });

      // Processar cada grupo
      Object.entries(quadrasPorNome).forEach(([nomeQuadra, quadrasGrupo]) => {
        // Indoor - Beach tennis: garantir 6 quadras
        if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
          const primeiraQuadra = quadrasGrupo[0];
          // Se há menos de 6, criar quadras adicionais
          for (let i = quadrasGrupo.length; i < 6; i++) {
            quadrasExpandidas.push({
              ...primeiraQuadra,
              id: `beach-tennis-${i + 1}-${primeiraQuadra.id}`,
            });
          }
        }
        
        // Indoor - Pádel: garantir 3 quadras
        if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
          const primeiraQuadra = quadrasGrupo[0];
          // Se há menos de 3, criar quadras adicionais
          for (let i = quadrasGrupo.length; i < 3; i++) {
            quadrasExpandidas.push({
              ...primeiraQuadra,
              id: `padel-${i + 1}-${primeiraQuadra.id}`,
            });
          }
        }
      });

      // Combinar quadras originais com as expandidas
      setQuadras([...quadrasCarregadas, ...quadrasExpandidas]);

      // Se não houver reservas, definir data selecionada como hoje
      if (!dados.reservas || dados.reservas.length === 0) {
        const hoje = new Date();
        setDataSelecionada(hoje.toISOString().split("T")[0]);
        }
      } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
      setErro(error?.response?.data?.error || "Erro ao carregar reservas.");
    } finally {
      setCarregando(false);
    }
  };

  // Carregar regras de horários de todas as quadras
  const carregarRegrasHorarios = async () => {
    try {
      // Primeiro, buscar todas as quadras do gestor
      const responseQuadras = await api.get("/gestor/quadras");
      const quadrasData = Array.isArray(responseQuadras.data) 
        ? responseQuadras.data 
        : responseQuadras.data?.quadras || [];

      // Buscar regras para cada quadra
      const todasRegras = [];
      for (const quadra of quadrasData) {
        try {
          const responseRegras = await api.get("/gestor/agenda/regras", {
            params: { quadraId: quadra.id }
          });
          const regras = responseRegras.data?.regras || [];
          // Adicionar quadra_id a cada regra para facilitar o filtro
          regras.forEach(regra => {
            todasRegras.push({
              ...regra,
              quadra_id: quadra.id
            });
          });
        } catch (error) {
          console.error(`[REGRAS] Erro ao carregar regras da quadra ${quadra.id}:`, error);
          // Continua para próxima quadra mesmo se houver erro
        }
      }

      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro ao carregar regras:", error);
      // Não bloqueia a página se houver erro ao carregar regras
    }
  };

  // Verificar se uma data tem regras configuradas (baseado no dia da semana)
  const dataTemRegras = (dataISO) => {
    if (!dataISO || regrasHorarios.length === 0) return false;
    
    const data = new Date(`${dataISO}T12:00:00`);
    const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Verificar se existe pelo menos uma regra para este dia da semana
    return regrasHorarios.some(regra => regra.dia_semana === diaSemana);
  };

  // Gerar reservas de exemplo (mock) para demonstração
  const gerarReservasExemplo = (quadraId, dataISO, horaStr) => {
    if (!quadras || quadras.length === 0) {
      return {
        status: "DISPONIVEL",
        reserva: null,
        bloqueio: null,
      };
    }
    
    // Obter nome da quadra
    const quadra = quadras.find(q => q.id === quadraId);
    if (!quadra) {
      return {
        status: "DISPONIVEL",
        reserva: null,
        bloqueio: null,
      };
    }
    
    // Construir nome da quadra (mesma lógica de getNomeQuadra)
    const nomeQuadra = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
    const hora = parseInt(horaStr.split(":")[0]);
    
    // Padrão para "Indoor - Beach tennis" (6 quadras)
    if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
      // Usar um hash simples baseado no ID da quadra para distribuir os padrões
      const hash = quadraId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const quadraNoGrupo = hash % 6; // 0 a 5 (6 quadras)
      
      // Horário específico: 14:00 - 1 Reserva paga, 1 Pendência, 4 Disponíveis
      if (hora === 14) {
        if (quadraNoGrupo === 0) {
          // Primeira quadra: reserva paga
          return {
            status: "RESERVADO",
            reserva: {
              id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,
              user_cpf: "123.456.789-00",
              phone: "(11) 98765-4321",
              preco_total: 150,
              pago_via_pix: true,
              nome: "João Silva",
              quadra_id: quadraId,
              data: dataISO,
              hora: horaStr,
            },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 1) {
          // Segunda quadra: reserva pendente
          return {
            status: "RESERVADO",
            reserva: {
              id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`,
              user_cpf: "987.654.321-00",
              phone: "(11) 91234-5678",
              preco_total: 150,
              pago_via_pix: false,
              nome: "Maria Santos",
              quadra_id: quadraId,
              data: dataISO,
              hora: horaStr,
            },
            bloqueio: null,
          };
        }
        // Quadras 2, 3, 4, 5: disponíveis (não retorna nada, fica disponível)
      }
      
      // Outros horários com padrões diferentes
      if (quadraNoGrupo === 0 && (hora === 9 || hora === 10)) {
        // Primeira quadra: bloqueada
        return {
          status: "BLOQUEADO",
          bloqueio: {
            motivo: "Bloqueado",
            id: `bloqueio-${quadraId}-${dataISO}-${horaStr}`,
          },
          reserva: null,
        };
      }
      if (quadraNoGrupo === 3 && (hora === 18 || hora === 19)) {
        // Quarta quadra: reserva paga
        return {
          status: "RESERVADO",
          reserva: {
            id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,
            user_cpf: "111.222.333-44",
            phone: "(11) 99876-5432",
            preco_total: 150,
            pago_via_pix: true,
            nome: "Pedro Oliveira",
            quadra_id: quadraId,
            data: dataISO,
            hora: horaStr,
          },
          bloqueio: null,
        };
      }
    }
    
    // Padrão para "Indoor - Pádel" (3 quadras)
    if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
      const hash = quadraId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const quadraNoGrupo = hash % 3; // 0 a 2 (3 quadras)
      
      if (quadraNoGrupo === 0 && (hora === 11 || hora === 12)) {
        // Primeira quadra: bloqueada
        return {
          status: "BLOQUEADO",
          bloqueio: {
            motivo: "Bloqueado",
            id: `bloqueio-${quadraId}-${dataISO}-${horaStr}`,
          },
          reserva: null,
        };
      }
      if (quadraNoGrupo === 1 && (hora === 18 || hora === 19)) {
        // Segunda quadra: reserva paga
        return {
          status: "RESERVADO",
          reserva: {
            id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`,
            user_cpf: "555.666.777-88",
            phone: "(11) 97654-3210",
            preco_total: 200,
            pago_via_pix: true,
            nome: "Ana Costa",
            quadra_id: quadraId,
            data: dataISO,
            hora: horaStr,
          },
          bloqueio: null,
        };
      }
      if (quadraNoGrupo === 2 && (hora === 20 || hora === 21)) {
        // Terceira quadra: reserva pendente
        return {
          status: "RESERVADO",
          reserva: {
            id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`,
            user_cpf: "999.888.777-66",
            phone: "(11) 96543-2109",
            preco_total: 200,
            pago_via_pix: false,
            nome: "Carlos Mendes",
            quadra_id: quadraId,
            data: dataISO,
            hora: horaStr,
          },
          bloqueio: null,
        };
      }
    }
    
    // Para outras quadras ou horários, verificar se há reserva real
    const reservaReal = reservas.find((r) => {
      const reservaData = r.data?.split("T")[0] || r.data;
      const reservaHora = r.hora || r.hora_inicio || "";
      return (
        r.quadra_id === quadraId &&
        reservaData === dataISO &&
        reservaHora.startsWith(horaStr.split(":")[0])
      );
    });
    
    if (reservaReal) {
      return {
        status: "RESERVADO",
        reserva: {
          id: reservaReal.id,
          user_cpf: reservaReal.user_cpf,
          phone: reservaReal.phone,
          preco_total: reservaReal.preco_total,
          pago_via_pix: reservaReal.pago_via_pix,
          nome: reservaReal.nome || reservaReal.user_name,
        },
        bloqueio: null,
      };
    }
    
    // Disponível (verde)
    return {
      status: "DISPONIVEL",
      reserva: null,
      bloqueio: null,
    };
  };

  // Gerar slots de exemplo (mock) para uma data específica
  const gerarSlotsMock = (dataISO) => {
    if (!dataISO || quadras.length === 0) return {};

    const slotsAgrupados = {};
    const data = new Date(`${dataISO}T12:00:00`);
    const diaSemana = data.getDay();

    // Gerar horários de 08:00 até 22:00 (hora em hora)
    const horarios = [];
    for (let hora = 8; hora <= 22; hora++) {
      horarios.push({
        hora: `${String(hora).padStart(2, "0")}:00`,
        hora_fim: `${String(hora + 1).padStart(2, "0")}:00`,
      });
    }

    // Para cada quadra, gerar slots baseado nas regras
    quadras.forEach((quadra) => {
      const regrasQuadra = regrasHorarios.filter((r) => r.quadra_id === quadra.id && r.dia_semana === diaSemana);
      
      const slotsDoDia = [];
      
      if (regrasQuadra.length === 0) {
        // Se não há regras, gerar horários de exemplo (08:00 até 22:00)
        for (let hora = 8; hora < 22; hora++) {
          const horaStr = `${String(hora).padStart(2, "0")}:00`;
          const horaFimStr = `${String(hora + 1).padStart(2, "0")}:00`;
          
          // Gerar reserva de exemplo
          const exemploReserva = gerarReservasExemplo(quadra.id, dataISO, horaStr);

          slotsDoDia.push({
            data: dataISO,
            hora: horaStr,
            hora_fim: horaFimStr,
            status: exemploReserva.status,
            preco_hora: 100,
            reserva: exemploReserva.reserva,
            bloqueio: exemploReserva.bloqueio,
          });
        }
      } else {
        // Para cada regra, gerar slots de hora em hora
        regrasQuadra.forEach((regra) => {
          const horaInicio = parseInt(regra.hora_inicio.split(":")[0]);
          const horaFim = parseInt(regra.hora_fim.split(":")[0]);
          
          for (let hora = horaInicio; hora < horaFim; hora++) {
            const horaStr = `${String(hora).padStart(2, "0")}:00`;
            const horaFimStr = `${String(hora + 1).padStart(2, "0")}:00`;
            
            // Gerar reserva de exemplo
            const exemploReserva = gerarReservasExemplo(quadra.id, dataISO, horaStr);

            slotsDoDia.push({
              data: dataISO,
              hora: horaStr,
              hora_fim: horaFimStr,
              status: exemploReserva.status,
              preco_hora: regra.preco_hora || 100,
              reserva: exemploReserva.reserva,
              bloqueio: exemploReserva.bloqueio,
            });
          }
        });
      }

      slotsAgrupados[quadra.id] = slotsDoDia.sort((a, b) => a.hora.localeCompare(b.hora));
    });

    return slotsAgrupados;
  };

  // Carregar slots de todas as quadras para uma data específica (usando mock)
  const carregarSlotsTodasQuadras = (dataISO) => {
    if (!dataISO || quadras.length === 0) {
      setSlotsPorQuadra({});
      return;
    }
    
    setCarregandoSlots(true);
    
    // Gerar slots mockados imediatamente (sem delay)
    const slotsAgrupados = gerarSlotsMock(dataISO);
    setSlotsPorQuadra(slotsAgrupados);
    setCarregandoSlots(false);
  };

  // Filtrar reservas por data
  const reservasFiltradas = useMemo(() => {
    if (modoVisualizacao === "dia") {
      return reservas.filter((r) => r.data === dataSelecionada);
    } else if (modoVisualizacao === "semana") {
      if (!diaClicado) return [];
      return reservas.filter((r) => r.data === diaClicado);
    } else if (modoVisualizacao === "mes") {
      if (!diaClicado) return [];
      return reservas.filter((r) => r.data === diaClicado);
    }
    return [];
  }, [reservas, modoVisualizacao, dataSelecionada, diaClicado]);

  // Agrupar reservas por quadra
  const reservasPorQuadra = useMemo(() => {
    const agrupadas = {};
    reservasFiltradas.forEach((reserva) => {
      const quadraId = reserva.quadra_id;
      if (!agrupadas[quadraId]) {
        agrupadas[quadraId] = [];
      }
      agrupadas[quadraId].push(reserva);
    });
    return agrupadas;
  }, [reservasFiltradas]);

  // Obter nome da quadra
  const getNomeQuadra = (quadraId) => {
    const quadra = quadras.find((q) => q.id === quadraId);
    if (!quadra) return "Quadra não encontrada";
    return `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
  };

  // Agrupar quadras por nome (tipo + modalidade)
  const agruparQuadrasPorNome = () => {
    const grupos = {};
    
    quadras.forEach((quadra) => {
      const nomeGrupo = getNomeQuadra(quadra.id);
      if (!grupos[nomeGrupo]) {
        grupos[nomeGrupo] = [];
      }
      grupos[nomeGrupo].push(quadra);
    });
    
    return grupos;
  };

  // Agregar slots de um grupo de quadras
  const agregarSlotsGrupo = (quadrasGrupo, dataISO) => {
    const slotsAgregados = {};
    
    // Para cada horário, contar quantas quadras estão disponíveis/reservadas/bloqueadas
    quadrasGrupo.forEach((quadra) => {
      const slots = slotsPorQuadra[quadra.id] || [];
      slots.forEach((slot) => {
        const hora = slot.hora || slot.hora_inicio || "";
        if (!slotsAgregados[hora]) {
          slotsAgregados[hora] = {
            hora: hora,
            hora_fim: slot.hora_fim || (() => {
              const h = parseInt(hora.split(":")[0]);
              return `${String(h + 1).padStart(2, "0")}:00`;
            })(),
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
          // Separar reservas pagas de pendentes
          if (slot.reserva?.pago_via_pix === true) {
            slotsAgregados[hora].reservadasPagas++;
          } else {
            slotsAgregados[hora].reservadasPendentes++;
          }
          if (slot.reserva) {
            slotsAgregados[hora].reservas.push(slot.reserva);
          }
        } else if (status === "BLOQUEADO" || status === "BLOQUEADA") {
          slotsAgregados[hora].bloqueadas++;
          if (slot.bloqueio) {
            slotsAgregados[hora].bloqueios.push(slot.bloqueio);
          }
        }
      });
    });
    
    return Object.values(slotsAgregados).sort((a, b) => a.hora.localeCompare(b.hora));
  };

  // Gerar dias do mês para visualização mensal
  const gerarDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];

    // Dias vazios antes do primeiro dia
    for (let i = 0; i < diaInicialSemana; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const temRegras = dataTemRegras(dataISO);
      const reservasDoDia = reservas.filter((r) => r.data === dataISO);
      dias.push({
        dia,
        data: dataISO,
        temRegras,
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }

    return dias;
  };

  // Gerar dias da semana para visualização semanal
  const gerarDiasDaSemana = () => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaSemana);

    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const dataISO = dia.toISOString().split("T")[0];
      const temRegras = dataTemRegras(dataISO);
      const reservasDoDia = reservas.filter((r) => r.data === dataISO);
      dias.push({
        dia: dia.getDate(),
        data: dataISO,
        nomeDia: getNomeDiaSemana(dataISO),
        temRegras,
        temReservas: reservasDoDia.length > 0,
        quantidadeReservas: reservasDoDia.length,
      });
    }
    return dias;
  };

  // Navegação do calendário
  const avancarMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const retrocederMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const avancarSemana = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() + 7);
    setDataSelecionada(novaData.toISOString().split("T")[0]);
  };

  const retrocederSemana = () => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() - 7);
    setDataSelecionada(novaData.toISOString().split("T")[0]);
  };

  const avancarDia = () => {
    const novaData = new Date(`${dataSelecionada}T12:00:00`);
    novaData.setDate(novaData.getDate() + 1);
    setDataSelecionada(novaData.toISOString().split("T")[0]);
  };

  const retrocederDia = () => {
    const novaData = new Date(`${dataSelecionada}T12:00:00`);
    novaData.setDate(novaData.getDate() - 1);
    setDataSelecionada(novaData.toISOString().split("T")[0]);
  };

  const irParaHoje = () => {
    const hoje = new Date();
    setDataSelecionada(hoje.toISOString().split("T")[0]);
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaClicado(null);
  };

  // Renderizar visualização diária
  const renderVisualizacaoDiaria = () => {
    // Verificar se a data selecionada tem regras configuradas
    if (carregandoSlots) {
    return (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Carregando horários...
        </div>
      );
    }

    // Agrupar quadras por nome
    const gruposQuadras = agruparQuadrasPorNome();

    // Renderizar slots agrupados
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(gruposQuadras).map(([nomeGrupo, quadrasGrupo]) => {
          const slotsAgregados = agregarSlotsGrupo(quadrasGrupo, dataSelecionada);
          const totalQuadras = quadrasGrupo.length;

          return (
            <div key={nomeGrupo} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
              <h4 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                {nomeGrupo}
              </h4>
              {totalQuadras > 1 && (
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
                  {totalQuadras} quadras
                </p>
              )}
              {slotsAgregados.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                  Nenhum horário disponível para esta data.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {slotsAgregados.map((slotAgregado, index) => {
                  // Calcular quantidades
                  const totalReservadas = (slotAgregado.reservadasPagas || 0) + (slotAgregado.reservadasPendentes || 0);
                  const temDisponivel = slotAgregado.disponiveis > 0;
                  const temReservadaPaga = slotAgregado.reservadasPagas > 0;
                  const temReservadaPendente = slotAgregado.reservadasPendentes > 0;
                  const temBloqueada = slotAgregado.bloqueadas > 0;
                  
                  // Determinar quantos status diferentes existem
                  const statusCount = [temDisponivel, temReservadaPaga, temReservadaPendente].filter(Boolean).length;
                  const temMultiplosStatus = statusCount > 1;
                  
                  // Determinar status principal para interação
                  let status = "DISPONIVEL";
                  let descricao = "";
                  
                  if (slotAgregado.bloqueadas === totalQuadras) {
                    status = "BLOQUEADO";
                    descricao = "Bloqueado";
                  } else if (totalReservadas > 0) {
                    status = "RESERVADO";
                    const partes = [];
                    if (slotAgregado.reservadasPagas > 0) partes.push(`${slotAgregado.reservadasPagas} paga(s)`);
                    if (slotAgregado.reservadasPendentes > 0) partes.push(`${slotAgregado.reservadasPendentes} pendente(s)`);
                    if (slotAgregado.disponiveis > 0) partes.push(`${slotAgregado.disponiveis} disponível(eis)`);
                    descricao = partes.join(", ");
                  } else if (slotAgregado.disponiveis > 0) {
                    status = "DISPONIVEL";
                    descricao = totalQuadras > 1 
                      ? `${slotAgregado.disponiveis} de ${totalQuadras} disponíveis`
                      : "Disponível";
                  }

                  const horaFim = slotAgregado.hora_fim;
                  const horaSlot = slotAgregado.hora;

                  // Se tem múltiplos status, criar divisão visual
                  if (temMultiplosStatus && !temBloqueada) {
                    const totalAtivo = slotAgregado.disponiveis + totalReservadas;
                    const porcentagemDisponivel = (slotAgregado.disponiveis / totalAtivo) * 100;
                    const porcentagemPaga = (slotAgregado.reservadasPagas / totalAtivo) * 100;
                    const porcentagemPendente = (slotAgregado.reservadasPendentes / totalAtivo) * 100;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (status === "DISPONIVEL" || status === "LIVRE") {
                            const primeiraQuadra = quadrasGrupo[0];
                            setReservaSelecionada({
                              quadra_id: primeiraQuadra.id,
                              data: dataSelecionada,
                              hora: horaSlot,
                              preco_hora: slotAgregado.preco_hora || 0,
                              quadra: primeiraQuadra,
                              grupoQuadras: totalQuadras > 1 ? quadrasGrupo : null,
                            });
                            setModalAberto(true);
                          } else if (status === "RESERVADO" || status === "RESERVADA") {
                            if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                              const reservasCompletas = slotAgregado.reservas.map((res) => {
                                const quadraReserva = quadras.find(q => q.id === res.quadra_id) || quadrasGrupo[0];
                                return {
                                  ...res,
                                  quadra: quadraReserva,
                                  data: res.data || dataSelecionada,
                                  hora: res.hora || horaSlot,
                                  nome: res.nome || res.usuario_nome || res.user_name || "Cliente",
                                };
                              });
                              setReservaSelecionada({
                                ...reservasCompletas[0],
                                todasReservas: reservasCompletas,
                              });
                              setModalAberto(true);
                            }
                          }
                        }}
          style={{
                          border: "2px solid #d1d5db",
                          borderRadius: 8,
                          padding: 0,
                          minWidth: 120,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Divisão visual horizontal */}
                        <div style={{ display: "flex", width: "100%", height: "100%" }}>
                          {temDisponivel && (
              <div
                style={{
                                backgroundColor: "#c8e6c9",
                                borderRight: statusCount > 1 ? "1px solid #2e7d32" : "none",
                                flex: porcentagemDisponivel,
                                minHeight: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                padding: "8px 4px",
                              }}
                            >
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#1b5e20", marginBottom: 2 }}>
                                {horaSlot} - {horaFim}
              </div>
                              <div style={{ fontSize: 9, fontWeight: 500, color: "#1b5e20" }}>
                                {slotAgregado.disponiveis} disp.
                              </div>
                            </div>
                          )}
                          {temReservadaPaga && (
              <div
                style={{
                                backgroundColor: "#90caf9",
                                borderRight: temReservadaPendente ? "1px solid #42a5f5" : "none",
                                flex: porcentagemPaga,
                                minHeight: 60,
                  display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                padding: "8px 4px",
                              }}
                            >
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#0d47a1", marginBottom: 2 }}>
                                {!temDisponivel && `${horaSlot} - ${horaFim}`}
                              </div>
                              <div style={{ fontSize: 9, fontWeight: 500, color: "#0d47a1" }}>
                                {slotAgregado.reservadasPagas} paga(s)
                              </div>
                            </div>
                          )}
                          {temReservadaPendente && (
                            <div
                              style={{
                                backgroundColor: "#fff9c4",
                                flex: porcentagemPendente,
                                minHeight: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                padding: "8px 4px",
                              }}
                            >
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#f57f17", marginBottom: 2 }}>
                                {!temDisponivel && !temReservadaPaga && `${horaSlot} - ${horaFim}`}
                              </div>
                              <div style={{ fontSize: 9, fontWeight: 500, color: "#f57f17" }}>
                                {slotAgregado.reservadasPendentes} pend.
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Descrição completa abaixo */}
                        <div style={{ 
                          padding: "4px 8px", 
                          backgroundColor: "#f9fafb", 
                          fontSize: 9, 
                          color: "#6b7280",
                          textAlign: "center",
                          borderTop: "1px solid #e5e7eb"
                        }}>
                          {descricao}
                        </div>
                        {slotAgregado.preco_hora && (
                          <div style={{ 
                            padding: "2px 8px", 
                            fontSize: 8, 
                            color: "#9ca3af",
                            textAlign: "center"
                          }}>
                            {formatarMoeda(slotAgregado.preco_hora)}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Renderização normal (sem divisão)
                  let bgColor = "#c8e6c9";
                  let borderColor = "#2e7d32";
                  let textColor = "#1b5e20";
                  
                  if (slotAgregado.bloqueadas === totalQuadras) {
                    bgColor = "#ffcdd2";
                    borderColor = "#c62828";
                    textColor = "#b71c1c";
                  } else if (totalReservadas > 0 && !temDisponivel) {
                    bgColor = "#90caf9";
                    borderColor = "#42a5f5";
                    textColor = "#0d47a1";
                  }

                    return (
                      <div
                      key={index}
                      onClick={() => {
                        if (status === "DISPONIVEL" || status === "LIVRE") {
                          const primeiraQuadra = quadrasGrupo[0];
                          setReservaSelecionada({
                            quadra_id: primeiraQuadra.id,
                            data: dataSelecionada,
                            hora: horaSlot,
                            preco_hora: slotAgregado.preco_hora || 0,
                            quadra: primeiraQuadra,
                            grupoQuadras: totalQuadras > 1 ? quadrasGrupo : null,
                          });
                          setModalAberto(true);
                        } else if (status === "RESERVADO" || status === "RESERVADA") {
                          if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                            const reservasCompletas = slotAgregado.reservas.map((res) => {
                              const quadraReserva = quadras.find(q => q.id === res.quadra_id) || quadrasGrupo[0];
                              return {
                                ...res,
                                quadra: quadraReserva,
                                data: res.data || diaClicado,
                                hora: res.hora || horaSlot,
                                nome: res.nome || res.usuario_nome || res.user_name || "Cliente",
                              };
                            });
                            setReservaSelecionada({
                              ...reservasCompletas[0],
                              todasReservas: reservasCompletas,
                            });
                            setModalAberto(true);
                          }
                        }
                      }}
                        style={{
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 8,
                        padding: "12px 16px",
                        color: textColor,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: status === "BLOQUEADO" || status === "BLOQUEADA" ? "not-allowed" : "pointer",
                        minWidth: 120,
                          textAlign: "center",
                        transition: "all 0.2s",
                        opacity: status === "BLOQUEADO" || status === "BLOQUEADA" ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (status !== "BLOQUEADO" && status !== "BLOQUEADA") {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                        {horaSlot} - {horaFim}
                        </div>
                      <div style={{ fontSize: 11, fontWeight: 500 }}>
                        {descricao}
                      </div>
                      {slotAgregado.preco_hora && (
                        <div style={{ fontSize: 10, marginTop: 4 }}>
                          {formatarMoeda(slotAgregado.preco_hora)}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderVisualizacaoSemanal = () => {
    const diasSemana = gerarDiasDaSemana();

    if (diaClicado) {
      return renderDetalhesDoDia(diaClicado);
    }

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginBottom: 24 }}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", padding: 8 }}>
              {dia}
            </div>
          ))}
          {diasSemana.map((dia) => {
            // Só mostrar dias que têm regras configuradas
            if (!dia.temRegras) {
              return (
                <div
                  key={dia.data}
                          style={{
                    padding: 16,
                    backgroundColor: "#f9fafb",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    textAlign: "center",
                    opacity: 0.5,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{dia.nomeDia}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>
                    {dia.dia}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>Sem regras</div>
                </div>
              );
            }

            return (
              <button
                key={dia.data}
                type="button"
                onClick={() => setDiaClicado(dia.data)}
                              style={{
                  padding: 16,
                  backgroundColor: dia.temReservas ? "#dbeafe" : "#fff",
                  border: `2px solid ${dia.temReservas ? "#3b82f6" : "#e5e7eb"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = dia.temReservas ? "#bfdbfe" : "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = dia.temReservas ? "#dbeafe" : "#fff";
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{dia.nomeDia}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  {dia.dia}
                        </div>
                {dia.temReservas && (
                  <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>
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

  // Renderizar visualização mensal
  const renderVisualizacaoMensal = () => {
    const diasMes = gerarDiasDoMes();

    if (diaClicado) {
      return renderDetalhesDoDia(diaClicado);
    }

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", padding: 8 }}>
              {dia}
            </div>
          ))}
          {diasMes.map((dia, index) => {
            if (!dia) return <div key={index}></div>;
            
            // Se não tem regras, mostrar desabilitado
            if (!dia.temRegras) {
              return (
                <div
                  key={dia.dia}
                  style={{
                    padding: 12,
                    backgroundColor: "#f9fafb",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    textAlign: "center",
                    minHeight: 60,
                    opacity: 0.5,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>
                    {dia.dia}
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>Sem regras</div>
                </div>
              );
            }

            return (
              <button
                key={dia.dia}
                type="button"
                onClick={() => setDiaClicado(dia.data)}
                style={{
                  padding: 12,
                  backgroundColor: dia.temReservas ? "#dbeafe" : "#fff",
                  border: `2px solid ${dia.temReservas ? "#3b82f6" : "#e5e7eb"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "center",
                  minHeight: 60,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = dia.temReservas ? "#bfdbfe" : "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = dia.temReservas ? "#dbeafe" : "#fff";
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  {dia.dia}
                </div>
                {dia.temReservas && (
                  <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 600 }}>
                    {dia.quantidadeReservas}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar detalhes de um dia específico (usado na visualização semanal/mensal)
  const renderDetalhesDoDia = (dataISO) => {
    if (carregandoSlots) {
  return (
        <div>
          <button
            type="button"
            onClick={() => setDiaClicado(null)}
        style={{
              marginBottom: 16,
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
          <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
            Carregando horários...
          </div>
        </div>
      );
    }

    // Renderizar slots de todas as quadras (mesma lógica da visualização diária)
    return (
      <div>
        <button
          type="button"
          onClick={() => setDiaClicado(null)}
          style={{
            marginBottom: 16,
            padding: "8px 16px",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Voltar
        </button>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
          Horários de {formatarDataBR(dataISO)}
        </h3>
        {/* Agrupar quadras por nome */}
        {(() => {
          const gruposQuadras = agruparQuadrasPorNome();
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {Object.entries(gruposQuadras).map(([nomeGrupo, quadrasGrupo]) => {
                const slotsAgregados = agregarSlotsGrupo(quadrasGrupo, dataISO);
                const totalQuadras = quadrasGrupo.length;

                return (
                  <div key={nomeGrupo} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" }}>
                    <h4 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                      {nomeGrupo}
                    </h4>
                    {totalQuadras > 1 && (
                      <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
                        {totalQuadras} quadras
                      </p>
                    )}
                    {slotsAgregados.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 20, color: "#6b7280" }}>
                        Nenhum horário disponível para esta data.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        {slotsAgregados.map((slotAgregado, index) => {
                          // Calcular quantidades
                          const totalReservadas = (slotAgregado.reservadasPagas || 0) + (slotAgregado.reservadasPendentes || 0);
                          const temDisponivel = slotAgregado.disponiveis > 0;
                          const temReservadaPaga = slotAgregado.reservadasPagas > 0;
                          const temReservadaPendente = slotAgregado.reservadasPendentes > 0;
                          const temBloqueada = slotAgregado.bloqueadas > 0;
                          
                          // Determinar quantos status diferentes existem
                          const statusCount = [temDisponivel, temReservadaPaga, temReservadaPendente].filter(Boolean).length;
                          const temMultiplosStatus = statusCount > 1;
                          
                          // Determinar status principal para interação
                          let status = "DISPONIVEL";
                          let descricao = "";
                          
                          if (slotAgregado.bloqueadas === totalQuadras) {
                            status = "BLOQUEADO";
                            descricao = "Bloqueado";
                          } else if (totalReservadas > 0) {
                            status = "RESERVADO";
                            const partes = [];
                            if (slotAgregado.reservadasPagas > 0) partes.push(`${slotAgregado.reservadasPagas} paga(s)`);
                            if (slotAgregado.reservadasPendentes > 0) partes.push(`${slotAgregado.reservadasPendentes} pendente(s)`);
                            if (slotAgregado.disponiveis > 0) partes.push(`${slotAgregado.disponiveis} disponível(eis)`);
                            descricao = partes.join(", ");
                          } else if (slotAgregado.disponiveis > 0) {
                            status = "DISPONIVEL";
                            descricao = totalQuadras > 1 
                              ? `${slotAgregado.disponiveis} de ${totalQuadras} disponíveis`
                              : "Disponível";
                          }

                          const horaFim = slotAgregado.hora_fim;
                          const horaSlot = slotAgregado.hora;

                          // Se tem múltiplos status, criar divisão visual
                          if (temMultiplosStatus && !temBloqueada) {
                            const totalAtivo = slotAgregado.disponiveis + totalReservadas;
                            const porcentagemDisponivel = (slotAgregado.disponiveis / totalAtivo) * 100;
                            const porcentagemPaga = (slotAgregado.reservadasPagas / totalAtivo) * 100;
                            const porcentagemPendente = (slotAgregado.reservadasPendentes / totalAtivo) * 100;

                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  if (status === "DISPONIVEL" || status === "LIVRE") {
                                    const primeiraQuadra = quadrasGrupo[0];
                                    setReservaSelecionada({
                                      quadra_id: primeiraQuadra.id,
                                      data: dataISO,
                                      hora: horaSlot,
                                      preco_hora: slotAgregado.preco_hora || 0,
                                      quadra: primeiraQuadra,
                                      grupoQuadras: totalQuadras > 1 ? quadrasGrupo : null,
                                    });
                                    setModalAberto(true);
                                  } else if (status === "RESERVADO" || status === "RESERVADA") {
                                    if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                                      const reservasCompletas = slotAgregado.reservas.map((res) => {
                                        const quadraReserva = quadras.find(q => q.id === res.quadra_id) || quadrasGrupo[0];
                                        return {
                                          ...res,
                                          quadra: quadraReserva,
                                        };
                                      });
                                      setReservaSelecionada({
                                        ...reservasCompletas[0],
                                        todasReservas: reservasCompletas,
                                      });
                                      setModalAberto(true);
                                    }
                                  }
                                }}
            style={{
                                  border: "2px solid #d1d5db",
                                  borderRadius: 8,
                                  padding: 0,
                                  minWidth: 120,
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.05)";
                                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                {/* Divisão visual horizontal */}
                                <div style={{ display: "flex", width: "100%", height: "100%" }}>
                                  {temDisponivel && (
                                    <div
                                      style={{
                                        backgroundColor: "#c8e6c9",
                                        borderRight: statusCount > 1 ? "1px solid #2e7d32" : "none",
                                        flex: porcentagemDisponivel,
                                        minHeight: 60,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        padding: "8px 4px",
                                      }}
                                    >
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#1b5e20", marginBottom: 2 }}>
                                        {horaSlot} - {horaFim}
                                      </div>
                                      <div style={{ fontSize: 9, fontWeight: 500, color: "#1b5e20" }}>
                                        {slotAgregado.disponiveis} disp.
                                      </div>
          </div>
        )}
                                  {temReservadaPaga && (
                                    <div
                                      style={{
                                        backgroundColor: "#90caf9",
                                        borderRight: temReservadaPendente ? "1px solid #42a5f5" : "none",
                                        flex: porcentagemPaga,
                                        minHeight: 60,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        padding: "8px 4px",
                                      }}
                                    >
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0d47a1", marginBottom: 2 }}>
                                        {!temDisponivel && `${horaSlot} - ${horaFim}`}
                                      </div>
                                      <div style={{ fontSize: 9, fontWeight: 500, color: "#0d47a1" }}>
                                        {slotAgregado.reservadasPagas} paga(s)
                                      </div>
                                    </div>
                                  )}
                                  {temReservadaPendente && (
                                    <div
                                      style={{
                                        backgroundColor: "#fff9c4",
                                        flex: porcentagemPendente,
                                        minHeight: 60,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        padding: "8px 4px",
                                      }}
                                    >
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#f57f17", marginBottom: 2 }}>
                                        {!temDisponivel && !temReservadaPaga && `${horaSlot} - ${horaFim}`}
        </div>
                                      <div style={{ fontSize: 9, fontWeight: 500, color: "#f57f17" }}>
                                        {slotAgregado.reservadasPendentes} pend.
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Descrição completa abaixo */}
                                <div style={{ 
                                  padding: "4px 8px", 
                                  backgroundColor: "#f9fafb", 
                                  fontSize: 9, 
                                  color: "#6b7280",
                                  textAlign: "center",
                                  borderTop: "1px solid #e5e7eb"
                                }}>
                                  {descricao}
                                </div>
                                {slotAgregado.preco_hora && (
                                  <div style={{ 
                                    padding: "2px 8px", 
                                    fontSize: 8, 
                                    color: "#9ca3af",
                                    textAlign: "center"
                                  }}>
                                    {formatarMoeda(slotAgregado.preco_hora)}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Renderização normal (sem divisão)
                          let bgColor = "#c8e6c9";
                          let borderColor = "#2e7d32";
                          let textColor = "#1b5e20";
                          
                          if (slotAgregado.bloqueadas === totalQuadras) {
                            bgColor = "#ffcdd2";
                            borderColor = "#c62828";
                            textColor = "#b71c1c";
                          } else if (totalReservadas > 0 && !temDisponivel) {
                            bgColor = "#90caf9";
                            borderColor = "#42a5f5";
                            textColor = "#0d47a1";
                          }

                          return (
                            <div
                              key={index}
                              onClick={() => {
                                if (status === "DISPONIVEL" || status === "LIVRE") {
                                  const primeiraQuadra = quadrasGrupo[0];
                                  setReservaSelecionada({
                                    quadra_id: primeiraQuadra.id,
                                    data: dataISO,
                                    hora: horaSlot,
                                    preco_hora: slotAgregado.preco_hora || 0,
                                    quadra: primeiraQuadra,
                                    grupoQuadras: totalQuadras > 1 ? quadrasGrupo : null,
                                  });
                                  setModalAberto(true);
                                } else if (status === "RESERVADO" || status === "RESERVADA") {
                                  if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                                    const reservasCompletas = slotAgregado.reservas.map((res) => {
                                      const quadraReserva = quadras.find(q => q.id === res.quadra_id) || quadrasGrupo[0];
                                      return {
                                        ...res,
                                        quadra: quadraReserva,
                                      };
                                    });
                                    setReservaSelecionada({
                                      ...reservasCompletas[0],
                                      todasReservas: reservasCompletas,
                                    });
                                    setModalAberto(true);
                                  }
                                }
                              }}
                              style={{
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: 8,
                                padding: "12px 16px",
                                color: textColor,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: status === "BLOQUEADO" || status === "BLOQUEADA" ? "not-allowed" : "pointer",
                                minWidth: 120,
                                textAlign: "center",
                                transition: "all 0.2s",
                                opacity: status === "BLOQUEADO" || status === "BLOQUEADA" ? 0.7 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (status !== "BLOQUEADO" && status !== "BLOQUEADA") {
                                  e.currentTarget.style.transform = "scale(1.05)";
                                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                                {horaSlot} - {horaFim}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 500 }}>
                                {descricao}
                              </div>
                              {slotAgregado.preco_hora && (
                                <div style={{ fontSize: 10, marginTop: 4 }}>
                                  {formatarMoeda(slotAgregado.preco_hora)}
          </div>
        )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          Reservas
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
          Visualize e gerencie todas as reservas de todas as suas quadras
        </p>

        {erro && (
          <div style={{ padding: 12, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 8, marginBottom: 24 }}>
            {erro}
          </div>
        )}

        {/* Controles de visualização */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setModoVisualizacao("dia");
                setDiaClicado(null);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: modoVisualizacao === "dia" ? "#37648c" : "#f3f4f6",
                color: modoVisualizacao === "dia" ? "#fff" : "#374151",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => {
                setModoVisualizacao("semana");
                setDiaClicado(null);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: modoVisualizacao === "semana" ? "#37648c" : "#f3f4f6",
                color: modoVisualizacao === "semana" ? "#fff" : "#374151",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => {
                setModoVisualizacao("mes");
                setDiaClicado(null);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: modoVisualizacao === "mes" ? "#37648c" : "#f3f4f6",
                color: modoVisualizacao === "mes" ? "#fff" : "#374151",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Mês
            </button>
            </div>

          {/* Navegação */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {modoVisualizacao === "dia" && (
              <>
                <button
                  type="button"
                  onClick={retrocederDia}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
              <input
                type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  onClick={avancarDia}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
              </>
            )}

            {modoVisualizacao === "semana" && (
              <>
                <button
                  type="button"
                  onClick={retrocederSemana}
          style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={irParaHoje}
              style={{
                    padding: "8px 16px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={avancarSemana}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
              </>
            )}

            {modoVisualizacao === "mes" && (
              <>
                <button
                  type="button"
                  onClick={retrocederMes}
              style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", minWidth: 200, textAlign: "center" }}>
                  {getNomeMes(mesAtual.getMonth())} {mesAtual.getFullYear()}
                </div>
                <button
                  type="button"
                  onClick={avancarMes}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={irParaHoje}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginLeft: 8,
                  }}
                >
                  Hoje
                </button>
              </>
            )}
          </div>
        </div>

        {/* Conteúdo da visualização */}
        {carregando ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 16, color: "#6b7280" }}>Carregando reservas...</div>
          </div>
        ) : (
          <>
            {modoVisualizacao === "dia" && renderVisualizacaoDiaria()}
            {modoVisualizacao === "semana" && renderVisualizacaoSemanal()}
            {modoVisualizacao === "mes" && renderVisualizacaoMensal()}
          </>
        )}
      </div>

      {/* Modal de detalhes */}
      <DetalhesReservaModal
        aberto={modalAberto}
        onFechar={() => {
          setModalAberto(false);
          setReservaSelecionada(null);
        }}
        reserva={reservaSelecionada}
        reservas={reservaSelecionada?.todasReservas}
        onCancelado={() => {
          carregarReservas();
          if (modoVisualizacao === "dia") {
            carregarSlotsTodasQuadras(dataSelecionada);
          } else if (diaClicado) {
            carregarSlotsTodasQuadras(diaClicado);
          }
        }}
        onCriada={() => {
          carregarReservas();
          if (modoVisualizacao === "dia") {
            carregarSlotsTodasQuadras(dataSelecionada);
          } else if (diaClicado) {
            carregarSlotsTodasQuadras(diaClicado);
          }
        }}
      />
    </div>
  );
};

export default GestorReservasPage;
