// src/layouts/MobileLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDevice } from "../hooks/useDevice";
import logoVaiTerPlay from "../assets/Design sem nome (4).png";

// Mock de contatos (mesmos dados do dashboard)
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

// Mock de nova reserva
const novaReserva = {
  id: 1,
  mensagem: "Nova reserva criada para hoje às 18h - Quadra 1",
  hora: "14:25"
};

export default function MobileLayout() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useDevice();
  const [abaAtiva, setAbaAtiva] = useState("mensagens");
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = React.useRef(null);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const notificacoesRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const footerRef = React.useRef(null);
  const [headerHeight, setHeaderHeight] = React.useState(80);
  const [footerHeight, setFooterHeight] = React.useState(60);

  // Determina aba ativa baseado na rota
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/mensagens") || path.includes("/chat")) {
      setAbaAtiva("mensagens");
    } else if (path.includes("/reservas")) {
      setAbaAtiva("reservas");
    } else if (path.includes("/relatorios")) {
      setAbaAtiva("relatorios");
    } else if (path.includes("/configuracoes")) {
      setAbaAtiva("configuracoes");
    } else {
      setAbaAtiva("mensagens");
    }
  }, [location.pathname]);

  // Calcular número de notificações pendentes
  const contatosComNaoLidas = mockContatos.filter(contato => (contato.naoLidas || 0) > 0 && !contato.fixo).length;
  const temNovaReserva = novaReserva !== null;
  const notificacoesPendentes = contatosComNaoLidas + (temNovaReserva ? 1 : 0);

  // Gerar notificações baseadas nas mensagens não lidas e nova reserva
  const gerarNotificacoes = () => {
    const notificacoes = [];

    // Notificações de mensagens não lidas
    mockContatos.forEach((contato) => {
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

  // Medir alturas do header e footer
  React.useEffect(() => {
    const updateHeights = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, []);

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target)) {
        setMostrarNotificacoes(false);
      }
    }

    if (menuAberto || mostrarNotificacoes) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuAberto, mostrarNotificacoes]);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f0f2f5",
      overflow: "hidden"
    }}>
      {/* Header fixo no topo */}
      <div 
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#37648c",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
          flexShrink: 0
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              border: "1px solid rgba(255,255,255,0.3)"
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
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>Painel do Gestor</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Lorenzo</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Lorenzoformenton@gmail.com</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, position: "relative" }} ref={notificacoesRef}>
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
            title={notificacoesPendentes > 0 ? `${notificacoesPendentes} notificação${notificacoesPendentes > 1 ? "ões" : ""} pendente${notificacoesPendentes > 1 ? "s" : ""}` : "Notificações"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#fff" }}
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
                  border: "2px solid #37648c",
                  padding: "0 4px"
                }}
              >
                {notificacoesPendentes > 9 ? "9+" : notificacoesPendentes}
              </div>
            )}

            {/* Pop-up de notificações */}
            {mostrarNotificacoes && (
              <div
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
                  zIndex: 1001,
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
                        onClick={() => {
                          if (notif.tipo === "mensagem" && notif.contatoId !== undefined) {
                            navigate(`/gestor/mensagens/chat/${notif.contatoId}`);
                          }
                          setMostrarNotificacoes(false);
                        }}
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
          </div>
        </div>
      </div>

      {/* Conteúdo principal - com padding para header e footer fixos */}
      <div style={{
        position: "fixed",
        top: `${headerHeight}px`, // Altura dinâmica do header fixo
        bottom: `${footerHeight}px`, // Altura dinâmica do footer fixo
        left: 0,
        right: 0,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        WebkitOverflowScrolling: "touch",
        backgroundColor: "#f0f2f5"
      }}>
        <Outlet />
      </div>

      {/* Bottom Navigation - Similar ao WhatsApp - FIXO */}
      <div 
        ref={footerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 0",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
          zIndex: 1000,
          flexShrink: 0
        }}>
        <button
          onClick={() => {
            navigate("/gestor/mensagens");
            setAbaAtiva("mensagens");
          }}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: "#37648c",
            transition: "all 0.2s"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={abaAtiva === "mensagens" ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Mensagens</span>
        </button>

        <button
          onClick={() => {
            navigate("/gestor/reservas");
            setAbaAtiva("reservas");
          }}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: "#37648c",
            transition: "all 0.2s"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={abaAtiva === "reservas" ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Reservas</span>
        </button>

        <button
          onClick={() => {
            navigate("/gestor/relatorios");
            setAbaAtiva("relatorios");
          }}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: "#37648c",
            transition: "all 0.2s"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={abaAtiva === "relatorios" ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 500 }}>Relatórios</span>
        </button>

        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: "#37648c",
              transition: "all 0.2s"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="19" r="2" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500 }}>Mais</span>
          </button>

          {/* Menu dropdown */}
          {menuAberto && (
            <div
              style={{
                position: "fixed",
                bottom: 70,
                right: 16,
                left: 16,
                backgroundColor: "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e5e7eb",
                zIndex: 1000,
                padding: "8px",
                maxHeight: "60vh",
                overflowY: "auto"
              }}
            >
              <div
                onClick={() => {
                  navigate("/gestor/financeiro");
                  setMenuAberto(false);
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderRadius: 12,
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Financeiro</span>
              </div>

              <div
                onClick={() => {
                  navigate("/gestor/clientes");
                  setMenuAberto(false);
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderRadius: 12,
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Clientes</span>
              </div>

              <div
                onClick={() => {
                  navigate("/gestor/regras-de-horarios");
                  setMenuAberto(false);
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderRadius: 12,
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Regras de Horários</span>
              </div>

              <div
                onClick={() => {
                  navigate("/gestor/configuracoes");
                  setMenuAberto(false);
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderRadius: 12,
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.38 9.08 21.24 8.86L19.24 5.82C19.1 5.6 18.84 5.54 18.62 5.68L16.26 7.26C15.78 6.87 15.25 6.55 14.66 6.33L14.36 3.72C14.32 3.5 14.14 3.34 13.92 3.34H10.08C9.86 3.34 9.68 3.5 9.64 3.72L9.34 6.33C8.75 6.55 8.22 6.87 7.74 7.26L5.38 5.68C5.16 5.54 4.9 5.6 4.76 5.82L2.76 8.86C2.62 9.08 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.62 14.92 2.76 15.14L4.76 18.18C4.9 18.4 5.16 18.46 5.38 18.32L7.74 16.74C8.22 17.13 8.75 17.45 9.34 17.67L9.64 20.28C9.68 20.5 9.86 20.66 10.08 20.66H13.92C14.14 20.66 14.32 20.5 14.36 20.28L14.66 17.67C15.25 17.45 15.78 17.13 16.26 16.74L18.62 18.32C18.84 18.46 19.1 18.4 19.24 18.18L21.24 15.14C21.38 14.92 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Configurações</span>
              </div>

              <div
                onClick={() => {
                  navigate("/gestor/ajuda");
                  setMenuAberto(false);
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderRadius: 12,
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>Ajuda</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
