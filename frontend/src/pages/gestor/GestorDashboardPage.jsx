import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import logoVaiTerPlay from "../../assets/Design sem nome (4).png";
import { useNavigate } from "react-router-dom";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

// Dados mockados para ilustração
const mockContatos = [
  {
    id: 0,
    nome: "VaiTerPlay - Suporte",
    telefone: "(11) 99999-9999",
    ultimaMensagem: "Olá! Como posso ajudar você hoje?",
    hora: "15:00",
    naoLidas: 0,
    avatar: "VS",
    fixo: true
  },
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    ultimaMensagem: "Tenho uma dúvida: qual o valor por hora?",
    hora: "14:30",
    naoLidas: 0,
    avatar: "JS"
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 91234-5678",
    ultimaMensagem: "Confirmado! Obrigada",
    hora: "13:15",
    naoLidas: 0,
    avatar: "MS"
  },
  {
    id: 3,
    nome: "Pedro Costa",
    telefone: "(11) 99876-5432",
    ultimaMensagem: "Qual o valor da quadra?",
    hora: "12:45",
    naoLidas: 1,
    avatar: "PC"
  },
  {
    id: 4,
    nome: "Ana Oliveira",
    telefone: "(11) 97654-3210",
    ultimaMensagem: "Posso cancelar minha reserva?",
    hora: "11:20",
    naoLidas: 1,
    avatar: "AO"
  }
];

// Mensagens por contato
const mensagensPorContato = {
  1: [ // João Silva
    { id: 1, texto: "Tenho uma dúvida: qual o valor por hora?", enviada: false, hora: "14:30" },
    { id: 2, texto: "Olá! O valor varia conforme o horário, vou te enviar o menu para fazer a reserva.", enviada: true, hora: "14:32" },
    { id: 3, tipo: "menu", enviada: true, hora: "14:33" }
  ],
  2: [ // Maria Santos
    { id: 1, texto: "Olá, quero confirmar minha reserva", enviada: false, hora: "13:10" },
    { id: 2, texto: "Claro! Qual o número da sua reserva?", enviada: true, hora: "13:12" },
    { id: 3, texto: "É a reserva #12345", enviada: false, hora: "13:13" },
    { id: 4, texto: "Confirmado! Obrigada", enviada: false, hora: "13:15" }
  ],
  3: [ // Pedro Costa
    { id: 1, texto: "Qual o valor da quadra?", enviada: false, hora: "12:45" },
    { id: 2, texto: "Depende do horário. Qual período você precisa?", enviada: true, hora: "12:47" }
  ],
  4: [ // Ana Oliveira
    { id: 1, texto: "Posso cancelar minha reserva?", enviada: false, hora: "11:20" },
    { id: 2, texto: "Sim, qual o número da reserva?", enviada: true, hora: "11:22" }
  ],
  0: [ // VaiTerPlay Suporte
    { id: 1, texto: "Olá! Como posso ajudar você hoje?", enviada: true, hora: "15:00" }
  ]
};


// Funções auxiliares para Reservas
const formatarDataBR = (isoDate) => {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
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

const formatarMoeda = (valor) => {
  if (!valor && valor !== 0) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

// Modal simplificado para Reservas no Dashboard
const DetalhesReservaModalDashboard = ({ aberto, onFechar, reserva, reservas, onCancelado, onCriada }) => {
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [reservaAtualIndex, setReservaAtualIndex] = useState(0);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");

  // Se há múltiplas reservas, usar a lista; senão, usar a reserva única
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
        quadraId: reserva.quadra_id,
        data: reserva.data,
        hora: reserva.hora,
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

  const statusPagamento = reserva.pago_via_pix ? "Reservado" : "Pendente";
  const nomeQuadra = reserva.quadra
    ? `${reserva.quadra.tipo || "Quadra"}${reserva.quadra.modalidade ? ` - ${reserva.quadra.modalidade}` : ""}`
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
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
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

        {/* Navegação entre múltiplas reservas */}
        {temMultiplasReservas && !isNovaReserva && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "8px 12px", backgroundColor: "#f3f4f6", borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setReservaAtualIndex(Math.max(0, reservaAtualIndex - 1))}
              disabled={reservaAtualIndex === 0}
              style={{
                padding: "4px 8px",
                backgroundColor: reservaAtualIndex === 0 ? "#e5e7eb" : "#37648c",
                color: reservaAtualIndex === 0 ? "#9ca3af" : "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: reservaAtualIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
              {reservaAtualIndex + 1} de {listaReservas.length}
            </span>
            <button
              type="button"
              onClick={() => setReservaAtualIndex(Math.min(listaReservas.length - 1, reservaAtualIndex + 1))}
              disabled={reservaAtualIndex === listaReservas.length - 1}
              style={{
                padding: "4px 8px",
                backgroundColor: reservaAtualIndex === listaReservas.length - 1 ? "#e5e7eb" : "#37648c",
                color: reservaAtualIndex === listaReservas.length - 1 ? "#9ca3af" : "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: reservaAtualIndex === listaReservas.length - 1 ? "not-allowed" : "pointer",
              }}
            >
              Próxima →
            </button>
          </div>
        )}

        {/* Se há múltiplas reservas, mostrar todas em lista */}
        {temMultiplasReservas && !isNovaReserva ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
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
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Quadra
                      </label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                        {nomeQuadraItem}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Data e Horário
                      </label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginTop: 4 }}>
                        {formatarDataBR(reservaItem.data)} às {reservaItem.hora}
                      </div>
                    </div>

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

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Valor
                      </label>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 4 }}>
                        {formatarMoeda(reservaItem.preco_total || 0)}
                      </div>
                    </div>

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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quadra
            </label>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#111827", marginTop: 4 }}>
              {nomeQuadra}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Data e Horário
            </label>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#111827", marginTop: 4 }}>
              {formatarDataBR(reserva.data)} às {reserva.hora}
            </div>
          </div>

          {!isNovaReserva ? (
            <>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Dados do Cliente
                </label>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(reserva.usuario_nome || reserva.nome) && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>Nome: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {reserva.usuario_nome || reserva.nome}
                      </span>
                    </div>
                  )}
                  {reserva.user_cpf && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>CPF: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {formatarCPF(reserva.user_cpf)}
                      </span>
                    </div>
                  )}
                  {reserva.phone && (
                    <div>
                      <span style={{ fontSize: 13, color: "#6b7280" }}>Telefone: </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                        {formatarTelefone(reserva.phone)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Valor
                  </label>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {formatarMoeda(reserva.preco_total || 0)}
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
            </>
          ) : (
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

export default function GestorDashboardPage() {
  const navigate = useNavigate();
  const [contatoSelecionado, setContatoSelecionado] = useState(mockContatos.find(c => c.fixo) || mockContatos[0]);
  const [reservasHoje] = useState(5); // Mock
  const [pixHoje] = useState(1250.00); // Mock
  const [taxaOcupacao] = useState(68); // Mock - porcentagem
  const [notificacoesPendentes] = useState(2); // Mock
  const [filtroMensagens, setFiltroMensagens] = useState("tudo"); // "tudo" ou "nao-lidas"
  
  // Estados para Reservas
  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({});
  const [carregandoReservas, setCarregandoReservas] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  });
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  // Carregar reservas e quadras
  useEffect(() => {
    carregarReservas();
    carregarRegrasHorarios();
  }, []);

  // Carregar slots quando a data mudar
  useEffect(() => {
    if (dataSelecionada) {
      carregarSlotsTodasQuadras(dataSelecionada);
    }
  }, [dataSelecionada, quadras, reservas, regrasHorarios]);

  const carregarReservas = async () => {
    try {
      setCarregandoReservas(true);
      const response = await api.get("/gestor/reservas");
      const dados = response.data || {};
      setReservas(dados.reservas || []);
      let quadrasCarregadas = dados.quadras || [];

      // Adicionar quadras de exemplo para grupos específicos (igual à página de Reservas)
      const quadrasExpandidas = [];

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
      const todasQuadras = [...quadrasCarregadas, ...quadrasExpandidas];
      setQuadras(todasQuadras);
      
      if (todasQuadras.length > 0 && !quadraSelecionadaId) {
        setQuadraSelecionadaId(todasQuadras[0].id);
      }
    } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
    } finally {
      setCarregandoReservas(false);
    }
  };

  const carregarRegrasHorarios = async () => {
    try {
      const responseQuadras = await api.get("/gestor/quadras");
      const quadrasData = Array.isArray(responseQuadras.data)
        ? responseQuadras.data
        : responseQuadras.data?.quadras || [];
      const todasRegras = [];
      for (const quadra of quadrasData) {
        try {
          const responseRegras = await api.get("/gestor/agenda/regras", {
            params: { quadraId: quadra.id }
          });
          const regras = responseRegras.data?.regras || [];
          regras.forEach(regra => {
            todasRegras.push({
              ...regra,
              quadra_id: quadra.id
            });
          });
        } catch (error) {
          console.error(`[REGRAS] Erro ao carregar regras da quadra ${quadra.id}:`, error);
        }
      }
      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro ao carregar regras:", error);
    }
  };

  // Gerar reservas de exemplo (mock) para demonstração (igual à página de Reservas)
  const gerarReservasExemplo = (quadraId, dataISO, horaStr) => {
    if (!quadras || quadras.length === 0) {
      return {
        status: "DISPONIVEL",
        reserva: null,
        bloqueio: null,
      };
    }
    
    const quadra = quadras.find(q => q.id === quadraId);
    if (!quadra) {
      return {
        status: "DISPONIVEL",
        reserva: null,
        bloqueio: null,
      };
    }
    
    const nomeQuadra = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
    const hora = parseInt(horaStr.split(":")[0]);
    
    // Padrão para "Indoor - Beach tennis" (6 quadras)
    if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
      const hash = quadraId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const quadraNoGrupo = hash % 6; // 0 a 5 (6 quadras)
      
      // Horário específico: 14:00 - 1 Reserva paga, 1 Pendência, 4 Disponíveis
      if (hora === 14) {
        if (quadraNoGrupo === 0) {
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
    
    return {
      status: "DISPONIVEL",
      reserva: null,
      bloqueio: null,
    };
  };

  const carregarSlotsTodasQuadras = async (dataISO) => {
    if (!dataISO || quadras.length === 0) return;
    try {
      const slotsAgrupados = {};
      const data = new Date(`${dataISO}T12:00:00`);
      const diaSemana = data.getDay();
      const horarios = [];
      for (let hora = 8; hora <= 22; hora++) {
        horarios.push({
          hora: `${String(hora).padStart(2, "0")}:00`,
          hora_fim: `${String(hora + 1).padStart(2, "0")}:00`,
        });
      }
      for (const quadra of quadras) {
        const regrasQuadra = regrasHorarios.filter((r) => r.quadra_id === quadra.id && r.dia_semana === diaSemana);
        const slotsDoDia = [];
        for (const horario of horarios) {
          const regra = regrasQuadra.find((r) => {
            const horaInicio = parseInt(r.hora_inicio?.split(":")[0] || 0);
            const horaFim = parseInt(r.hora_fim?.split(":")[0] || 0);
            const horaSlot = parseInt(horario.hora.split(":")[0]);
            return horaSlot >= horaInicio && horaSlot < horaFim;
          });
          if (regra) {
            // Primeiro verificar reserva real
            const reservaReal = reservas.find((r) => {
              const reservaData = r.data?.split("T")[0] || r.data;
              const reservaHora = r.hora || "";
              return (
                r.quadra_id === quadra.id &&
                reservaData === dataISO &&
                reservaHora.startsWith(horario.hora.split(":")[0])
              );
            });
            
            // Se não houver reserva real, usar exemplo
            const exemploReserva = reservaReal ? null : gerarReservasExemplo(quadra.id, dataISO, horario.hora);
            
            const statusFinal = reservaReal 
              ? "RESERVADO" 
              : (exemploReserva?.status || "DISPONIVEL");
            
            const reservaFinal = reservaReal 
              ? {
                  ...reservaReal,
                  quadra: quadra,
                  nome: reservaReal.nome || reservaReal.usuario_nome || reservaReal.user_name || "Cliente",
                }
              : (exemploReserva?.reserva ? {
                  ...exemploReserva.reserva,
                  quadra: quadra,
                } : null);
            
            slotsDoDia.push({
              ...horario,
              quadra_id: quadra.id,
              preco_hora: regra.valor || 0,
              status: statusFinal,
              reserva: reservaFinal,
            });
          }
        }
        if (slotsDoDia.length > 0) {
          slotsAgrupados[quadra.id] = slotsDoDia;
        }
      }
      setSlotsPorQuadra(slotsAgrupados);
    } catch (error) {
      console.error("[SLOTS] Erro ao carregar slots:", error);
    }
  };

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

  // Obter todos os grupos de quadras e seus slots agregados (igual à página de Reservas)
  const gruposQuadras = useMemo(() => agruparQuadrasPorNome(), [quadras]);
  
  // Filtrar grupos baseado na quadra selecionada
  const gruposFiltrados = useMemo(() => {
    if (!quadraSelecionadaId) return gruposQuadras;
    
    const quadraSelecionada = quadras.find(q => q.id === quadraSelecionadaId);
    if (!quadraSelecionada) return gruposQuadras;
    
    const nomeGrupoSelecionado = getNomeQuadra(quadraSelecionada.id);
    return { [nomeGrupoSelecionado]: gruposQuadras[nomeGrupoSelecionado] || [] };
  }, [quadraSelecionadaId, gruposQuadras, quadras]);
  
  // Calcular slots agregados para cada grupo
  const gruposComSlots = useMemo(() => {
    if (!dataSelecionada || Object.keys(gruposFiltrados).length === 0) return [];
    
    return Object.entries(gruposFiltrados).map(([nomeGrupo, quadrasGrupo]) => {
      if (!quadrasGrupo || quadrasGrupo.length === 0) return null;
      const slotsAgregados = agregarSlotsGrupo(quadrasGrupo, dataSelecionada);
      return {
        nomeGrupo,
        quadrasGrupo,
        totalQuadras: quadrasGrupo.length,
        slotsAgregados,
      };
    }).filter(Boolean);
  }, [gruposFiltrados, dataSelecionada, slotsPorQuadra]);
  
  // Separar contato fixo dos demais
  const contatoFixo = mockContatos.find(c => c.fixo);
  let outrosContatos = mockContatos.filter(c => !c.fixo);
  
  // Calcular quantidade de contatos com mensagens não lidas
  const contatosComNaoLidas = mockContatos.filter(contato => (contato.naoLidas || 0) > 0).length;
  
  // Aplicar filtro de mensagens não lidas
  if (filtroMensagens === "nao-lidas") {
    outrosContatos = outrosContatos.filter(c => c.naoLidas > 0);
  }

  return (
    <div className="page" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Layout principal em grid - tudo na mesma tela */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridTemplateRows: "auto 1fr",
          gap: 12,
          flex: 1,
          overflow: "hidden",
          minHeight: 0
        }}
      >
        {/* Cards de informações de hoje - ocupam 3 colunas no topo */}
        <div className="card" style={{ gridColumn: "1 / 2", marginTop: 0, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Reservas para hoje</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#37648c" }}>
            {reservasHoje}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "2 / 3", marginTop: 0, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Total Recebido Hoje</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#37648c" }}>
            {formatBRL(pixHoje)}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "3 / 4", marginTop: 0, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Taxa de ocupação das quadras</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#37648c" }}>
            {taxaOcupacao}%
          </div>
        </div>

        {/* Reservas estilo blocos verticais - ocupa 1 coluna no topo */}
        <div className="card" style={{ gridColumn: "4 / 5", gridRow: "1 / 3", marginTop: 0, padding: "12px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Reservas</h3>
            <button
              onClick={() => navigate("/gestor/reservas")}
              style={{
                padding: "4px 8px",
                fontSize: 11,
                backgroundColor: "#37648c",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Ver todas
            </button>
          </div>
          
          {/* Filtros */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {/* Filtro de Data */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>Data</label>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                style={{
                  padding: "6px 8px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 12,
                  outline: "none"
                }}
              />
            </div>
            
            {/* Filtro de Quadra */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>Quadra</label>
              <select
                value={quadraSelecionadaId}
                onChange={(e) => setQuadraSelecionadaId(e.target.value)}
                style={{
                  padding: "6px 8px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 12,
                  outline: "none",
                  backgroundColor: "#fff",
                  cursor: "pointer"
                }}
                disabled={quadras.length === 0}
              >
                <option value="">Todas as quadras</option>
                {quadras.map((quadra) => (
                  <option key={quadra.id} value={quadra.id}>
                    {quadra.tipo || "Quadra"}{quadra.modalidade ? ` - ${quadra.modalidade}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#333" }}>
            {formatarDataBR(dataSelecionada)}
          </div>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {carregandoReservas ? (
              <div style={{ textAlign: "center", padding: 20, color: "#666", fontSize: 12 }}>
                Carregando...
              </div>
            ) : gruposComSlots.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#666", fontSize: 12 }}>
                Nenhum horário disponível
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {gruposComSlots.map((grupo) => (
                  <div key={grupo.nomeGrupo} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ marginBottom: 4 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
                        {grupo.nomeGrupo}
                      </h4>
                      {grupo.totalQuadras > 1 && (
                        <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0 0" }}>
                          {grupo.totalQuadras} quadras
                        </p>
                      )}
                    </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {grupo.slotsAgregados.map((slotAgregado, index) => {
                  const totalReservadas = (slotAgregado.reservadasPagas || 0) + (slotAgregado.reservadasPendentes || 0);
                  const temDisponivel = slotAgregado.disponiveis > 0;
                  const temReservadaPaga = slotAgregado.reservadasPagas > 0;
                  const temReservadaPendente = slotAgregado.reservadasPendentes > 0;
                  const temBloqueada = slotAgregado.bloqueadas > 0;
                  const statusCount = [temDisponivel, temReservadaPaga, temReservadaPendente].filter(Boolean).length;
                  const temMultiplosStatus = statusCount > 1;
                  
                  let status = "DISPONIVEL";
                  let descricao = "";
                  
                  if (slotAgregado.bloqueadas === grupo.totalQuadras) {
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
                    descricao = grupo.totalQuadras > 1 
                      ? `${slotAgregado.disponiveis} de ${grupo.totalQuadras} disponíveis`
                      : "Disponível";
                  }

                  const horaSlot = slotAgregado.hora;
                  
                  // Se tem múltiplos status, criar divisão visual (igual à página de Reservas)
                  if (temMultiplosStatus && !temBloqueada) {
                    const totalAtivo = slotAgregado.disponiveis + totalReservadas;
                    const porcentagemDisponivel = (slotAgregado.disponiveis / totalAtivo) * 100;
                    const porcentagemPaga = (slotAgregado.reservadasPagas / totalAtivo) * 100;
                    const porcentagemPendente = (slotAgregado.reservadasPendentes / totalAtivo) * 100;

                    const horaFim = slotAgregado.hora_fim;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (status === "DISPONIVEL" || status === "LIVRE") {
                            const primeiraQuadra = grupo.quadrasGrupo[0];
                            setReservaSelecionada({
                              quadra_id: primeiraQuadra.id,
                              data: dataSelecionada,
                              hora: horaSlot,
                              preco_hora: slotAgregado.preco_hora || 0,
                              quadra: primeiraQuadra,
                              grupoQuadras: grupo.totalQuadras > 1 ? grupo.quadrasGrupo : null,
                            });
                            setModalAberto(true);
                          } else if (status === "RESERVADO" || status === "RESERVADA") {
                            if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                              const reservasCompletas = slotAgregado.reservas.map((res) => {
                                const quadraReserva = quadras.find(q => q.id === res.quadra_id) || grupo.quadrasGrupo[0];
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
                          e.currentTarget.style.transform = "scale(1.02)";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Divisão visual horizontal (igual à página de Reservas) */}
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
                  
                  // Status único - cor sólida
                  let bgColor = "#c8e6c9";
                let borderColor = "#2e7d32";
                let textColor = "#1b5e20";
                
                  if (slotAgregado.bloqueadas === slotAgregado.total) {
                    bgColor = "#ffcdd2";
                  borderColor = "#c62828";
                  textColor = "#b71c1c";
                  } else if (totalReservadas > 0) {
                    if (slotAgregado.reservadasPagas > 0) {
                      bgColor = "#90caf9";
                      borderColor = "#1976d2";
                      textColor = "#0d47a1";
                    } else {
                      bgColor = "#fff9c4";
                      borderColor = "#fbc02d";
                      textColor = "#f57f17";
                    }
                }
                
                return (
                  <div
                    key={index}
                        onClick={() => {
                          if (status === "DISPONIVEL" || status === "LIVRE") {
                            const primeiraQuadra = grupo.quadrasGrupo[0];
                            setReservaSelecionada({
                              quadra_id: primeiraQuadra.id,
                              data: dataSelecionada,
                              hora: horaSlot,
                              preco_hora: slotAgregado.preco_hora || 0,
                              quadra: primeiraQuadra,
                              grupoQuadras: grupo.totalQuadras > 1 ? grupo.quadrasGrupo : null,
                            });
                            setModalAberto(true);
                          } else if (status === "RESERVADO" || status === "RESERVADA") {
                            if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
                              const reservasCompletas = slotAgregado.reservas.map((res) => {
                                const quadraReserva = quadras.find(q => q.id === res.quadra_id) || grupo.quadrasGrupo[0];
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
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      flexDirection: "column",
                        gap: 4,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: 14 }}>
                        {slotAgregado.hora} - {slotAgregado.hora_fim}
                    </div>
                    <div style={{ fontSize: 12 }}>
                        {descricao}
                    </div>
                      {slotAgregado.preco_hora && (
                        <div style={{ fontSize: 11, opacity: 0.8 }}>
                          {formatarMoeda(slotAgregado.preco_hora)}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inbox estilo WhatsApp - ocupa 3 colunas embaixo */}
        <div className="card" style={{ gridColumn: "1 / 4", gridRow: "2 / 3", marginTop: 0, padding: "12px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Inbox de Mensagens</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 0,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              overflow: "hidden",
              flex: 1,
              minHeight: 0,
              backgroundColor: "#f5f5f5"
            }}
          >
            {/* Lista de contatos (lado esquerdo) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#f0f0f0",
                  borderBottom: "1px solid #e0e0e0",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar..."
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 16,
                    fontSize: 12,
                    outline: "none"
                  }}
                />
                
                {/* Filtros */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setFiltroMensagens("tudo")}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: filtroMensagens === "tudo" ? "#1c7c54" : "#fff",
                      color: filtroMensagens === "tudo" ? "#fff" : "#333",
                      transition: "all 0.2s"
                    }}
                  >
                    Tudo
                  </button>
                  <button
                    onClick={() => setFiltroMensagens("nao-lidas")}
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: filtroMensagens === "nao-lidas" ? "#1c7c54" : "#fff",
                      color: filtroMensagens === "nao-lidas" ? "#fff" : "#333",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      position: "relative"
                    }}
                  >
                    <span>Não lidas</span>
                    {contatosComNaoLidas > 0 && (
                      <span
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          borderRadius: "50%",
                          minWidth: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "0 4px"
                        }}
                      >
                        {contatosComNaoLidas > 9 ? "9+" : contatosComNaoLidas}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {/* Contato fixo - VaiTerPlay Suporte */}
                {contatoFixo && (
                  <div
                    onClick={() => setContatoSelecionado(contatoFixo)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: contatoSelecionado?.id === contatoFixo.id ? "#e8f5e9" : "#ffffff",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      position: "sticky",
                      top: 0,
                      zIndex: 10
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                        border: "1px solid #e0e0e0"
                      }}
                    >
                      <img
                        src={logoVaiTerPlay}
                        alt="VaiTerPlay"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "4px"
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>
                            {contatoFixo.nome}
                          </div>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#1c7c54"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ flexShrink: 0 }}
                            title="Fixado"
                          >
                            <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 10, color: "#666" }}>{contatoFixo.hora}</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1
                          }}
                        >
                          {contatoFixo.ultimaMensagem}
                        </div>
                        {contatoFixo.naoLidas > 0 && (
                          <div
                            style={{
                              backgroundColor: "#1c7c54",
                              color: "#fff",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 600,
                              marginLeft: 6,
                              flexShrink: 0
                            }}
                          >
                            {contatoFixo.naoLidas}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Outros contatos */}
                {outrosContatos.map((contato) => (
                  <div
                    key={contato.id}
                    onClick={() => setContatoSelecionado(contato)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: contatoSelecionado?.id === contato.id ? "#e8f5e9" : "#ffffff",
                      display: "flex",
                      gap: 10,
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#1c7c54",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 14,
                        flexShrink: 0
                      }}
                    >
                      {contato.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>
                          {contato.nome}
                        </div>
                        <div style={{ fontSize: 10, color: "#666" }}>{contato.hora}</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1
                          }}
                        >
                          {contato.ultimaMensagem}
                        </div>
                        {contato.naoLidas > 0 && (
                          <div
                            style={{
                              backgroundColor: "#1c7c54",
                              color: "#fff",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 600,
                              marginLeft: 6,
                              flexShrink: 0
                            }}
                          >
                            {contato.naoLidas}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Área de chat (lado direito) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ece5dd",
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 100 0 L 0 0 0 100\" fill=\"none\" stroke=\"%23d4d4d4\" stroke-width=\"0.5\" opacity=\"0.3\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100\" height=\"100\" fill=\"url(%23grid)\" /%3E%3C/svg%3E')",
                minHeight: 0
              }}
            >
              {/* Header do chat */}
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#075e54",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}
                >
                  {contatoSelecionado?.fixo ? (
                    <img
                      src={logoVaiTerPlay}
                      alt="VaiTerPlay"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "3px"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: "#075e54",
                        fontWeight: 600,
                        fontSize: 13
                      }}
                    >
                      {contatoSelecionado?.avatar || "?"}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {contatoSelecionado?.nome || "Selecione um contato"}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>
                    {contatoSelecionado?.telefone || ""}
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 0
                }}
              >
                {(mensagensPorContato[contatoSelecionado?.id] || []).map((msg) => {
                  // Mensagem tipo menu
                  if (msg.tipo === "menu") {
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: "flex-end"
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "85%",
                            borderRadius: 8,
                            backgroundColor: "#dcf8c6",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            overflow: "hidden"
                          }}
                        >
                          {/* Conteúdo do menu */}
                          <div style={{ padding: "12px", backgroundColor: "#dcf8c6", color: "#333" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#333" }}>
                              Bem-vindo ao Vai Ter Play! 🎉
                            </div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                              Agende sua quadra com rapidez e segurança.
                            </div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                              Escolha uma opção para continuar 👇
                            </div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                              Estamos aqui para te ajudar! 💪
                            </div>
                            
                            {/* Botões do menu */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <button
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  backgroundColor: "#1c7c54",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textAlign: "left"
                                }}
                              >
                                Atendimento
                              </button>
                              <button
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  backgroundColor: "#1c7c54",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textAlign: "left"
                                }}
                              >
                                Agendar quadra
                              </button>
                              <button
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  backgroundColor: "#1c7c54",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textAlign: "left"
                                }}
                              >
                                Meus agendamentos
                              </button>
                            </div>
                            
                            <div
                              style={{
                                fontSize: 9,
                                color: "#666",
                                textAlign: "right",
                                marginTop: 8
                              }}
                            >
                              {msg.hora}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Mensagem normal
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: msg.enviada ? "flex-end" : "flex-start"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "6px 10px",
                          borderRadius: 8,
                          backgroundColor: msg.enviada ? "#dcf8c6" : "#ffffff",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          fontSize: 13,
                          color: "#333"
                        }}
                      >
                        {msg.texto}
                        <div
                          style={{
                            fontSize: 9,
                            color: "#666",
                            textAlign: "right",
                            marginTop: 3
                          }}
                        >
                          {msg.hora}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#f0f0f0",
                  borderTop: "1px solid #e0e0e0",
                  display: "flex",
                  gap: 10,
                  flexShrink: 0
                }}
              >
                <button
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    backgroundColor: "#1c7c54",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 2px 4px rgba(28, 124, 84, 0.2)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#155b3e";
                    e.target.style.boxShadow = "0 3px 6px rgba(28, 124, 84, 0.3)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#1c7c54";
                    e.target.style.boxShadow = "0 2px 4px rgba(28, 124, 84, 0.2)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                  </svg>
                  <span>Transferir para suporte VaiTerPlay</span>
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    backgroundColor: "#075e54",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 2px 4px rgba(7, 94, 84, 0.2)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#054d44";
                    e.target.style.boxShadow = "0 3px 6px rgba(7, 94, 84, 0.3)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#075e54";
                    e.target.style.boxShadow = "0 2px 4px rgba(7, 94, 84, 0.2)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
                  </svg>
                  <span>Enviar Menu Inicial</span>
                </button>
              </div>

              {/* Input de mensagem */}
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  flexShrink: 0
                }}
              >
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 18,
                    fontSize: 13,
                    outline: "none",
                    backgroundColor: "#fff"
                  }}
                />
                <button
                  style={{
                    backgroundColor: "#1c7c54",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 16,
                    flexShrink: 0
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Reserva */}
      <DetalhesReservaModalDashboard
        aberto={modalAberto}
        onFechar={() => {
          setModalAberto(false);
          setReservaSelecionada(null);
        }}
        reserva={reservaSelecionada}
        reservas={reservaSelecionada?.todasReservas}
        onCancelado={() => {
          carregarReservas();
          if (dataSelecionada) {
            carregarSlotsTodasQuadras(dataSelecionada);
          }
        }}
        onCriada={() => {
          carregarReservas();
          if (dataSelecionada) {
            carregarSlotsTodasQuadras(dataSelecionada);
          }
        }}
      />
    </div>
  );
}
