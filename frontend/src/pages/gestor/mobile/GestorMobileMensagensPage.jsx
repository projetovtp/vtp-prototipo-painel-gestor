// src/pages/gestor/mobile/GestorMobileMensagensPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GestorMobileMensagensPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("tudo");

  // Mock de conversas/contatos
  const conversas = [
    {
      id: 1,
      nome: "João Silva",
      telefone: "(11) 98765-4321",
      ultimaMensagem: "Obrigado pela reserva!",
      hora: "14:30",
      naoLidas: 2,
      avatar: null,
      tipo: "cliente"
    },
    {
      id: 2,
      nome: "Maria Santos",
      telefone: "(11) 91234-5678",
      ultimaMensagem: "Posso cancelar minha reserva?",
      hora: "13:15",
      naoLidas: 0,
      avatar: null,
      tipo: "cliente"
    },
    {
      id: 3,
      nome: "Pedro Costa",
      telefone: "(11) 99876-5432",
      ultimaMensagem: "Qual o horário disponível?",
      hora: "12:00",
      naoLidas: 1,
      avatar: null,
      tipo: "cliente"
    },
    {
      id: 4,
      nome: "Ana Lima",
      telefone: "(11) 97654-3210",
      ultimaMensagem: "Confirmado para amanhã",
      hora: "Ontem",
      naoLidas: 0,
      avatar: null,
      tipo: "cliente"
    },
    {
      id: 5,
      nome: "Carlos Souza",
      telefone: "(11) 94567-8901",
      ultimaMensagem: "Preciso de mais informações",
      hora: "Ontem",
      naoLidas: 3,
      avatar: null,
      tipo: "cliente"
    }
  ];
  

  const conversasFiltradas = conversas.filter(conv => {
    const matchBusca = conv.nome.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro = filtro === "tudo" || (filtro === "nao-lidas" && conv.naoLidas > 0);
    return matchBusca && matchFiltro;
  });

  // Contar conversas não lidas
  const totalNaoLidas = conversas.filter(conv => conv.naoLidas > 0).length;

  function formatarHora(data) {
    if (!data) return "";
    if (data === "Ontem") return "Ontem";
    return data;
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      minHeight: 0
    }}>
      {/* Barra de busca */}
      <div style={{
        padding: "8px 16px",
        backgroundColor: "#f0f2f5",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "8px 16px",
          border: "1px solid #e5e7eb",
          marginBottom: 12
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280" }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar conversas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              backgroundColor: "transparent"
            }}
          />
        </div>
        
        {/* Filtros Tudo e Não Lidas */}
        <div style={{
          display: "flex",
          gap: 8
        }}>
          <button
            onClick={() => setFiltro("tudo")}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: "none",
              backgroundColor: filtro === "tudo" ? "#37648c" : "#fff",
              color: filtro === "tudo" ? "#fff" : "#6b7280",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Tudo
          </button>
          <button
            onClick={() => setFiltro("nao-lidas")}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: "none",
              backgroundColor: filtro === "nao-lidas" ? "#37648c" : "#fff",
              color: filtro === "nao-lidas" ? "#fff" : "#6b7280",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            Não Lidas
            {totalNaoLidas > 0 && (
              <span style={{
                backgroundColor: filtro === "nao-lidas" ? "rgba(255,255,255,0.3)" : "#37648c",
                color: filtro === "nao-lidas" ? "#fff" : "#fff",
                borderRadius: 10,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 600,
                minWidth: 20,
                textAlign: "center"
              }}>
                {totalNaoLidas}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Lista de conversas */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        backgroundColor: "#fff"
      }}>
        {conversasFiltradas.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: "center",
            color: "#6b7280"
          }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>Nenhuma conversa encontrada</div>
            <div style={{ fontSize: 14 }}>Tente buscar com outros termos</div>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <div
              key={conversa.id}
              onClick={() => navigate(`/gestor/mensagens/chat/${conversa.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #f0f2f5",
                cursor: "pointer",
                backgroundColor: "#fff",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f6f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#37648c",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 600,
                marginRight: 12,
                flexShrink: 0
              }}>
                {conversa.nome.charAt(0).toUpperCase()}
              </div>

              {/* Informações da conversa */}
              <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#111827"
                  }}>
                    {conversa.nome}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#6b7280",
                    whiteSpace: "nowrap",
                    marginLeft: 8
                  }}>
                    {formatarHora(conversa.hora)}
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8
                }}>
                  <div style={{
                    fontSize: 14,
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                    {conversa.ultimaMensagem}
                  </div>
                  {conversa.naoLidas > 0 && (
                    <div style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#37648c",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "0 6px"
                    }}>
                      {conversa.naoLidas}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
