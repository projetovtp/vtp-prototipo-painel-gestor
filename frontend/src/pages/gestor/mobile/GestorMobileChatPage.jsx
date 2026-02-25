// src/pages/gestor/mobile/GestorMobileChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function formatHora(hora) {
  if (!hora) return "—";
  return String(hora).slice(0, 5);
}

function formatStatus(status) {
  const statusMap = {
    paid: "Pago",
    pending: "Pendente",
    canceled: "Cancelado"
  };
  return statusMap[status] || status;
}

export default function GestorMobileChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");
  const mensagensContainerRef = useRef(null);
  
  // Estados para o modal de histórico
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Mock de dados do contato
  const contato = {
    id: parseInt(chatId),
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    avatar: null,
    online: true
  };
  
  // Função para abrir modal e carregar histórico do contato
  async function abrirHistoricoContato() {
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);

    try {
      // Mock de histórico de reservas
      const agora = new Date();
      const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);

      const mockHistorico = [
        {
          id: 1,
          data: agora.toISOString().split('T')[0],
          hora: "18:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "paid",
          empresa: "Complexo Esportivo ABC",
          created_at: duasHorasAtras.toISOString()
        },
        {
          id: 2,
          data: agora.toISOString().split('T')[0],
          hora: "20:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "pending",
          empresa: "Complexo Esportivo ABC",
          created_at: duasHorasAtras.toISOString()
        },
        {
          id: 3,
          data: "2024-01-05",
          hora: "19:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "paid",
          empresa: "Complexo Esportivo ABC",
          created_at: duasHorasAtras.toISOString()
        }
      ];

      setHistoricoReservas(mockHistorico);
    } catch (error) {
      console.error("[HISTÓRICO] Erro ao carregar:", error);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setHistoricoReservas([]);
  }

  // Mock de mensagens
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      texto: "Olá, gostaria de fazer uma reserva",
      enviada: false,
      hora: "14:20"
    },
    {
      id: 2,
      texto: "Olá! Claro, qual horário você prefere?",
      enviada: true,
      hora: "14:22"
    },
    {
      id: 3,
      texto: "Prefiro no período da tarde, entre 14h e 16h",
      enviada: false,
      hora: "14:25"
    },
    {
      id: 4,
      texto: "Perfeito! Tenho disponível às 15h. Confirma?",
      enviada: true,
      hora: "14:26"
    },
    {
      id: 5,
      texto: "Sim, confirma! Obrigado pela reserva!",
      enviada: false,
      hora: "14:30"
    }
  ]);

  useEffect(() => {
    // Scroll para o final das mensagens
    if (mensagensContainerRef.current) {
      mensagensContainerRef.current.scrollTop = mensagensContainerRef.current.scrollHeight;
    }
  }, [mensagens]);

  function enviarMensagem() {
    if (!mensagem.trim()) return;

    const novaMensagem = {
      id: mensagens.length + 1,
      texto: mensagem,
      enviada: true,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMensagens([...mensagens, novaMensagem]);
    setMensagem("");
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#efeae2",
      backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 100 0 L 0 0 0 100\" fill=\"none\" stroke=\"%23e5e7eb\" stroke-width=\"1\" opacity=\"0.3\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/%3E%3C/svg%3E')",
      minHeight: 0
    }}>
      {/* Header do chat */}
      <div style={{
        backgroundColor: "#37648c",
        color: "#fff",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <button
          onClick={() => navigate("/gestor/mensagens")}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 600
        }}>
          {contato.nome.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{contato.nome}</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {contato.online ? "online" : "offline"}
          </div>
        </div>
        <button
          onClick={abrirHistoricoContato}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Ver Histórico"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Área de mensagens */}
      <div
        ref={mensagensContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.enviada ? "flex-end" : "flex-start",
              width: "100%"
            }}
          >
            <div style={{
              maxWidth: "75%",
              padding: "8px 12px",
              borderRadius: msg.enviada ? "8px 8px 2px 8px" : "8px 8px 8px 2px",
              backgroundColor: msg.enviada ? "#dcf8c6" : "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              wordWrap: "break-word"
            }}>
              <div style={{
                fontSize: 15,
                color: "#111827",
                marginBottom: 4,
                lineHeight: 1.4
              }}>
                {msg.texto}
              </div>
              <div style={{
                fontSize: 11,
                color: "#6b7280",
                textAlign: "right",
                marginTop: 4
              }}>
                {msg.hora}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botões acima do input */}
      <div style={{
        backgroundColor: "#f0f2f5",
        padding: "8px 16px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: 8
      }}>
        <button
          style={{
            flex: 1,
            padding: "10px 14px",
            backgroundColor: "#37648c",
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
            boxShadow: "0 2px 4px rgba(55, 100, 140, 0.2)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2d4f6f";
            e.target.style.boxShadow = "0 3px 6px rgba(55, 100, 140, 0.3)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#37648c";
            e.target.style.boxShadow = "0 2px 4px rgba(55, 100, 140, 0.2)";
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
            backgroundColor: "#37648c",
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
            boxShadow: "0 2px 4px rgba(55, 100, 140, 0.2)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2d4f6f";
            e.target.style.boxShadow = "0 3px 6px rgba(55, 100, 140, 0.3)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#37648c";
            e.target.style.boxShadow = "0 2px 4px rgba(55, 100, 140, 0.2)";
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
      <div style={{
        backgroundColor: "#f0f2f5",
        padding: "8px 16px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <input
          type="text"
          placeholder="Digite uma mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              enviarMensagem();
            }
          }}
          style={{
            flex: 1,
            border: "none",
            borderRadius: 20,
            padding: "10px 16px",
            fontSize: 15,
            backgroundColor: "#fff",
            outline: "none"
          }}
        />
        <button
          onClick={enviarMensagem}
          disabled={!mensagem.trim()}
          style={{
            backgroundColor: mensagem.trim() ? "#37648c" : "#9ca3af",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            color: "#fff",
            cursor: mensagem.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            transition: "all 0.2s",
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (mensagem.trim()) {
              e.target.style.backgroundColor = "#2d4f6f";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = mensagem.trim() ? "#37648c" : "#9ca3af";
          }}
        >
          ➤
        </button>
      </div>

      {/* Modal de Histórico */}
      {modalHistoricoAberto && (
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
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModalHistorico();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              maxWidth: "90vw",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                  Histórico de Reservas
                </h2>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {contato.nome} • {contato.telefone}
                </div>
              </div>
              <button
                onClick={fecharModalHistorico}
                style={{
                  padding: "8px",
                  borderRadius: 6,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Lista de Reservas */}
            {carregandoHistorico ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div>Carregando histórico...</div>
              </div>
            ) : historicoReservas.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Nenhuma reserva encontrada.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {historicoReservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 8,
                      padding: 16,
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                          {reserva.tipoQuadra}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {formatDateBR(reserva.data)} às {formatHora(reserva.hora)}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          backgroundColor:
                            reserva.status === "paid"
                              ? "#d1fae5"
                              : reserva.status === "pending"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            reserva.status === "paid"
                              ? "#065f46"
                              : reserva.status === "pending"
                              ? "#92400e"
                              : "#991b1b"
                        }}
                      >
                        {formatStatus(reserva.status)}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      {formatBRL(reserva.valor)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
