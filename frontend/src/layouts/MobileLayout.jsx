import React, { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoVaiTerPlay from "../assets/Design sem nome (4).png";
import {
  mockContatos,
  mockNovaReserva,
  gerarNotificacoes,
  contarNotificacoesPendentes
} from "../mocks/mockNotificacoes";

const NAV_ITEMS = [
  { key: "mensagens", label: "Mensagens", path: "/gestor/mensagens", match: ["/mensagens", "/chat"] },
  { key: "reservas", label: "Reservas", path: "/gestor/reservas", match: ["/reservas"] },
  { key: "relatorios", label: "Relatórios", path: "/gestor/relatorios", match: ["/relatorios"] },
];

const MORE_ITEMS = [
  {
    label: "Financeiro",
    path: "/gestor/financeiro",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Clientes",
    path: "/gestor/clientes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Regras de Horários",
    path: "/gestor/regras-de-horarios",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Configurações",
    path: "/gestor/configuracoes",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.38 9.08 21.24 8.86L19.24 5.82C19.1 5.6 18.84 5.54 18.62 5.68L16.26 7.26C15.78 6.87 15.25 6.55 14.66 6.33L14.36 3.72C14.32 3.5 14.14 3.34 13.92 3.34H10.08C9.86 3.34 9.68 3.5 9.64 3.72L9.34 6.33C8.75 6.55 8.22 6.87 7.74 7.26L5.38 5.68C5.16 5.54 4.9 5.6 4.76 5.82L2.76 8.86C2.62 9.08 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.62 14.92 2.76 15.14L4.76 18.18C4.9 18.4 5.16 18.46 5.38 18.32L7.74 16.74C8.22 17.13 8.75 17.45 9.34 17.67L9.64 20.28C9.68 20.5 9.86 20.66 10.08 20.66H13.92C14.14 20.66 14.32 20.5 14.36 20.28L14.66 17.67C15.25 17.45 15.78 17.13 16.26 16.74L18.62 18.32C18.84 18.46 19.1 18.4 19.24 18.18L21.24 15.14C21.38 14.92 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Ajuda",
    path: "/gestor/ajuda",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const NAV_ICONS = {
  mensagens: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  reservas: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  relatorios: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
    </svg>
  ),
  mais: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2"/>
      <circle cx="12" cy="12" r="2"/>
      <circle cx="12" cy="19" r="2"/>
    </svg>
  ),
};

const MobileLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);

  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const notificacoesRef = useRef(null);

  const [headerHeight, setHeaderHeight] = useState(56);
  const [footerHeight, setFooterHeight] = useState(56);

  const notificacoesPendentes = contarNotificacoesPendentes(mockContatos, mockNovaReserva);
  const notificacoes = gerarNotificacoes(mockContatos, mockNovaReserva);

  const isChat = location.pathname.includes("/mensagens/chat/");

  const abaAtiva = NAV_ITEMS.find((item) =>
    item.match.some((m) => location.pathname.includes(m))
  )?.key || "mensagens";

  const updateHeights = useCallback(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    if (footerRef.current) setFooterHeight(footerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, [updateHeights]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target)) {
        setMostrarNotificacoes(false);
      }
    }
    if (mostrarNotificacoes) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mostrarNotificacoes]);

  function handleNavegar(path) {
    navigate(path);
    setMenuAberto(false);
    setMostrarNotificacoes(false);
  }

  return (
    <div className={`mobile-root${isChat ? " mobile-root--chat" : ""}`}>
      {/* Header */}
      {!isChat && <header ref={headerRef} className="mobile-header">
        <div className="mobile-header-left">
          <div className="mobile-header-logo">
            <img src={logoVaiTerPlay} alt="VaiTerPlay" />
          </div>
          <div className="mobile-header-info">
            <div className="mobile-header-label">Painel do Gestor</div>
            <div className="mobile-header-name">{usuario?.nome || "Gestor"}</div>
          </div>
        </div>

        <div className="mobile-header-actions" ref={notificacoesRef}>
          <button
            type="button"
            className="mobile-bell"
            onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
            aria-label={
              notificacoesPendentes > 0
                ? `${notificacoesPendentes} notificações pendentes`
                : "Notificações"
            }
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                fill="currentColor"
              />
            </svg>
            {notificacoesPendentes > 0 && (
              <span className="mobile-bell-badge">
                {notificacoesPendentes > 9 ? "9+" : notificacoesPendentes}
              </span>
            )}
          </button>

          {mostrarNotificacoes && (
            <div className="mobile-notif-popup">
              <div className="mobile-notif-header">
                <span className="mobile-notif-title">Notificações</span>
                <button
                  type="button"
                  className="mobile-notif-close"
                  onClick={() => setMostrarNotificacoes(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              <div className="mobile-notif-list">
                {notificacoes.length === 0 ? (
                  <div className="mobile-notif-empty">Nenhuma notificação pendente</div>
                ) : (
                  notificacoes.map((notif) => (
                    <div
                      key={notif.id}
                      className="mobile-notif-item"
                      onClick={() => {
                        if (notif.tipo === "mensagem" && notif.contatoId !== undefined) {
                          handleNavegar(`/gestor/mensagens/chat/${notif.contatoId}`);
                        }
                        setMostrarNotificacoes(false);
                      }}
                    >
                      <div className="mobile-notif-item-title">{notif.titulo}</div>
                      <div className="mobile-notif-item-msg">{notif.mensagem}</div>
                      <div className="mobile-notif-item-time">{notif.hora}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>}

      {/* Content */}
      <div
        className="mobile-content"
        style={isChat ? { top: 0, bottom: 0 } : { top: headerHeight, bottom: footerHeight }}
      >
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      {!isChat && <nav ref={footerRef} className="mobile-bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`mobile-nav-btn${abaAtiva === item.key ? " mobile-nav-btn--active" : ""}`}
            onClick={() => handleNavegar(item.path)}
          >
            {NAV_ICONS[item.key](abaAtiva === item.key)}
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`mobile-nav-btn${menuAberto ? " mobile-nav-btn--active" : ""}`}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {NAV_ICONS.mais()}
          <span className="mobile-nav-label">Mais</span>
        </button>
      </nav>}

      {/* Overlay + More Menu */}
      {menuAberto && !isChat && (
        <>
          <div className="mobile-overlay" onClick={() => setMenuAberto(false)} />
          <div className="mobile-more-menu">
            <div className="mobile-more-handle" />
            {MORE_ITEMS.map((item) => (
              <button
                key={item.path}
                type="button"
                className="mobile-more-item"
                onClick={() => handleNavegar(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="mobile-more-divider" />
            <button
              type="button"
              className="mobile-more-item mobile-more-item--danger"
              onClick={() => {
                setMenuAberto(false);
                logout();
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MobileLayout;
