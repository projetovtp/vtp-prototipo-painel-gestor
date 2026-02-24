// src/pages/gestor/mobile/GestorMobileChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GestorMobileChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");
  const mensagensContainerRef = useRef(null);

  // Mock de dados do contato
  const contato = {
    id: parseInt(chatId),
    nome: "João Silva",
    avatar: null,
    online: true
  };

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
      overflow: "hidden"
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
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    </div>
  );
}
