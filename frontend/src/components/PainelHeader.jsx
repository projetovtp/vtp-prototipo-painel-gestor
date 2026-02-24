// src/components/PainelHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import logoVaiTerPlay from "../assets/Design sem nome (4).png";

function PainelHeader({ titulo, notificacoesPendentes = 0, contatos = [], novaReserva = null }) {
  const { usuario, logout } = useAuth();
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const popupRef = useRef(null);

  // Gerar notificações baseadas nas mensagens não lidas e nova reserva
  const gerarNotificacoes = () => {
    const notificacoes = [];

    // Notificações de mensagens não lidas
    contatos.forEach((contato) => {
      if (contato.naoLidas > 0 && !contato.fixo) {
        notificacoes.push({
          id: `msg-${contato.id}`,
          titulo: `Nova mensagem de ${contato.nome}`,
          mensagem: contato.ultimaMensagem || "Você tem mensagens não lidas",
          hora: contato.hora || "Agora",
          tipo: "mensagem",
          contatoId: contato.id
        });
      }
    });

    // Notificação de nova reserva
    if (novaReserva) {
      notificacoes.push({
        id: `reserva-${novaReserva.id || Date.now()}`,
        titulo: "Nova reserva",
        mensagem: novaReserva.mensagem || "Uma nova reserva foi criada",
        hora: novaReserva.hora || "Agora",
        tipo: "reserva"
      });
    }

    // Ordenar por hora (mais recentes primeiro)
    return notificacoes.sort((a, b) => {
      try {
        const horaA = a.hora.split(":").map(Number);
        const horaB = b.hora.split(":").map(Number);
        if (horaA.length >= 2 && horaB.length >= 2) {
          if (horaA[0] !== horaB[0]) return horaB[0] - horaA[0];
          return horaB[1] - horaA[1];
        }
      } catch (e) {
        // Se não conseguir ordenar, manter ordem original
      }
      return 0;
    });
  };

  const notificacoes = gerarNotificacoes();

  // Fechar pop-up ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setMostrarNotificacoes(false);
      }
    }

    if (mostrarNotificacoes) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarNotificacoes]);

  return (
    <header
      className="layout-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        color: "#111827",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Logo VaiTerPlay */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}
        >
          <img
            src={logoVaiTerPlay}
            alt="VaiTerPlay"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "6px"
            }}
          />
        </div>
        
        {/* Informações do usuário */}
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 2 }}>
            {titulo}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 2 }}>
            Lorenzo
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            lorenzo@vaiterplay.com.br
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        {/* Badge de notificações */}
        <div
          style={{
            position: "relative",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
          title={notificacoesPendentes > 0 ? `${notificacoesPendentes} notificação${notificacoesPendentes > 1 ? "ões" : ""} pendente${notificacoesPendentes > 1 ? "s" : ""}` : "Notificações"}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "#6b7280" }}
          >
            <path
              d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
              fill="currentColor"
            />
          </svg>
          {notificacoesPendentes > 0 && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                backgroundColor: "#ef4444",
                color: "#fff",
                borderRadius: "50%",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                border: "2px solid #ffffff",
                padding: "0 4px"
              }}
            >
              {notificacoesPendentes > 9 ? "9+" : notificacoesPendentes}
            </div>
          )}
        </div>

        {/* Pop-up de notificações */}
        {mostrarNotificacoes && (
              <div
                ref={popupRef}
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "320px",
                  maxHeight: "400px",
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #e5e7eb",
                  zIndex: 1000,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Header do pop-up */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#f9fafb"
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    Notificações
                  </div>
                  <button
                    onClick={() => setMostrarNotificacoes(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      color: "#6b7280"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>

                {/* Lista de notificações */}
                <div style={{ overflowY: "auto", maxHeight: "320px" }}>
                  {notificacoes.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                      Nenhuma notificação pendente
                    </div>
                  ) : (
                    notificacoes.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f3f4f6",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                          {notif.titulo}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                          {notif.mensagem}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {notif.hora}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

        <button
          type="button"
          onClick={logout}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            color: "#6b7280",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f9fafb";
            e.target.style.borderColor = "#d1d5db";
            e.target.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#ffffff";
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.color = "#6b7280";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}

export default PainelHeader;
