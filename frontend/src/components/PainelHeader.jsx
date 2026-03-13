import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import logoVaiTerPlay from "../assets/Design sem nome (4).png";

function PainelHeader({ notificacoesPendentes = 0, contatos = [], novaReserva = null }) {
  const { usuario, logout } = useAuth();
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const popupRef = useRef(null);

  const gerarNotificacoes = () => {
    const notificacoes = [];

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

    if (novaReserva) {
      notificacoes.push({
        id: `reserva-${novaReserva.id || "new"}`,
        titulo: "Nova reserva",
        mensagem: novaReserva.mensagem || "Uma nova reserva foi criada",
        hora: novaReserva.hora || "Agora",
        tipo: "reserva"
      });
    }

    return notificacoes.sort((a, b) => {
      try {
        const horaA = a.hora.split(":").map(Number);
        const horaB = b.hora.split(":").map(Number);
        if (horaA.length >= 2 && horaB.length >= 2) {
          if (horaA[0] !== horaB[0]) return horaB[0] - horaA[0];
          return horaB[1] - horaA[1];
        }
      } catch {
        /* manter ordem original */
      }
      return 0;
    });
  };

  const notificacoes = gerarNotificacoes();

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
    <header className="layout-header">
      <div className="header-left">
        <div className="header-logo">
          <img src={logoVaiTerPlay} alt="VaiTerPlay" />
        </div>
        <div>
          <div className="header-label">Painel do Gestor</div>
          <div className="header-user-name">{usuario?.nome || "Usuário"}</div>
          {usuario?.email && (
            <div className="header-user-email">{usuario.email}</div>
          )}
        </div>
      </div>

      <div className="header-actions">

        <button
          type="button"
          className="header-bell"
          onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
          title={
            notificacoesPendentes > 0
              ? `${notificacoesPendentes} notificação${notificacoesPendentes > 1 ? "ões" : ""} pendente${notificacoesPendentes > 1 ? "s" : ""}`
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
            <span className="header-bell-badge">
              {notificacoesPendentes > 9 ? "9+" : notificacoesPendentes}
            </span>
          )}
        </button>

        {mostrarNotificacoes && (
          <div ref={popupRef} className="notif-popup">
            <div className="notif-popup-header">
              <span className="notif-popup-title">Notificações</span>
              <button
                className="notif-popup-close"
                onClick={() => setMostrarNotificacoes(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className="notif-popup-list">
              {notificacoes.length === 0 ? (
                <div className="notif-empty">Nenhuma notificação pendente</div>
              ) : (
                notificacoes.map((notif) => (
                  <div key={notif.id} className="notif-item">
                    <div className="notif-item-title">{notif.titulo}</div>
                    <div className="notif-item-msg">{notif.mensagem}</div>
                    <div className="notif-item-time">{notif.hora}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button type="button" onClick={logout} className="btn-logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}

export default PainelHeader;
