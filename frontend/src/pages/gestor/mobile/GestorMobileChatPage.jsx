// src/pages/gestor/mobile/GestorMobileChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGestorMensagens } from "../../../hooks/api";
import { LoadingSpinner, EmptyState } from "../../../components/ui";
import { mockContatos } from "../../../data/mockContatos";
import {
  formatarMoeda,
  formatarDataBR,
  formatarHoraStr,
  formatarStatus,
} from "../../../utils/formatters";

const MOCK_CONTATOS_MAP = Object.fromEntries(
  mockContatos
    .filter((c) => !c.fixo)
    .map((c) => [c.id, { nome: c.nome, telefone: c.telefone, online: false }])
);

const MOCK_MENSAGENS = [
  { id: 1, texto: "Olá, gostaria de fazer uma reserva", enviada: false, hora: "14:20" },
  { id: 2, texto: "Olá! Claro, qual horário você prefere?", enviada: true, hora: "14:22" },
  { id: 3, texto: "Prefiro no período da tarde, entre 14h e 16h", enviada: false, hora: "14:25" },
  { id: 4, texto: "Perfeito! Tenho disponível às 15h. Confirma?", enviada: true, hora: "14:26" },
  { id: 5, texto: "Sim, confirma! Obrigado pela reserva!", enviada: false, hora: "14:30" },
];

const MOCK_HISTORICO = (() => {
  const agora = new Date();
  const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
  return [
    { id: 1, data: agora.toISOString().split("T")[0], hora: "18:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 2, data: agora.toISOString().split("T")[0], hora: "20:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "pending", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 3, data: "2024-01-05", hora: "19:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
  ];
})();

const IconBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDoc = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
  </svg>
);

const IconMenu = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" />
  </svg>
);

const IconSend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
  </svg>
);

const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function GestorMobileChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [novaMensagem, setNovaMensagem] = useState("");
  const mensagensContainerRef = useRef(null);

  const {
    mensagens: mensagensApi,
    loading,
    obterMensagens,
    enviarMensagem: enviarMensagemApi,
    obterHistoricoReservas,
  } = useGestorMensagens();

  const [mensagens, setMensagens] = useState([]);
  const [carregado, setCarregado] = useState(false);

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const contato = MOCK_CONTATOS_MAP[chatId] || {
    nome: `Contato #${chatId}`,
    telefone: "",
    online: false,
  };

  useEffect(() => {
    async function carregar() {
      try {
        await obterMensagens(chatId);
      } catch {
        // Backend indisponível - mock será usado
      } finally {
        setCarregado(true);
      }
    }
    carregar();
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mensagensApi.length > 0) {
      setMensagens(mensagensApi);
    } else if (carregado) {
      setMensagens(MOCK_MENSAGENS);
    }
  }, [mensagensApi, carregado]);

  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);

  function scrollToBottom(behavior = "smooth") {
    if (mensagensContainerRef.current) {
      mensagensContainerRef.current.scrollTo({
        top: mensagensContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    const container = mensagensContainerRef.current;
    if (!container) return;

    function handleScroll() {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setMostrarScrollBtn(distFromBottom > 120);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  async function abrirHistoricoContato() {
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);

    try {
      const data = await obterHistoricoReservas(chatId);
      setHistoricoReservas(data && data.length > 0 ? data : MOCK_HISTORICO);
    } catch {
      setHistoricoReservas(MOCK_HISTORICO);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setHistoricoReservas([]);
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;

    const msgLocal = {
      id: mensagens.length + 1,
      texto: novaMensagem,
      enviada: true,
      hora: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMensagens((prev) => [...prev, msgLocal]);
    setNovaMensagem("");

    try {
      await enviarMensagemApi(chatId, { texto: novaMensagem });
    } catch {
      // Mensagem já adicionada localmente - falha silenciosa
    }
  }

  const [acoesPanelAberto, setAcoesPanelAberto] = useState(false);
  const temTexto = novaMensagem.trim().length > 0;

  return (
    <div className="mob-chat">
      {/* Header */}
      <div className="mob-chat-header">
        <button
          className="mob-chat-back"
          onClick={() => navigate("/gestor/mensagens")}
          aria-label="Voltar"
        >
          <IconBack />
        </button>

        <div className="mob-chat-header-avatar">
          {contato.nome.charAt(0).toUpperCase()}
        </div>

        <div className="mob-chat-header-info">
          <div className="mob-chat-header-name">{contato.nome}</div>
          <div className="mob-chat-header-status">
            {contato.online ? "online" : "offline"}
          </div>
        </div>

        <button
          className="mob-chat-history-btn"
          onClick={abrirHistoricoContato}
          aria-label="Ver histórico de reservas"
        >
          <IconDoc />
        </button>
      </div>

      {/* Mensagens */}
      <div ref={mensagensContainerRef} className="mob-chat-messages">
        {loading && !carregado ? (
          <LoadingSpinner mensagem="Carregando mensagens..." tamanho={24} />
        ) : mensagens.length === 0 ? (
          <EmptyState
            titulo="Nenhuma mensagem ainda"
            descricao="Envie a primeira mensagem para iniciar a conversa"
            compact
          />
        ) : (
          mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`mob-chat-msg ${msg.enviada ? "mob-chat-msg--sent" : "mob-chat-msg--received"}`}
            >
              <div className={`mob-chat-bubble ${msg.enviada ? "mob-chat-bubble--sent" : "mob-chat-bubble--received"}`}>
                <div className="mob-chat-bubble-text">{msg.texto}</div>
                <div className="mob-chat-bubble-time">{msg.hora}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scroll to bottom */}
      {mostrarScrollBtn && (
        <button
          className="mob-chat-scroll-btn"
          onClick={() => scrollToBottom()}
          aria-label="Rolar para o final"
        >
          <IconChevronDown />
        </button>
      )}

      {/* Ações colapsáveis */}
      {acoesPanelAberto && (
        <div className="mob-chat-actions">
          <button className="mob-chat-action-btn mob-chat-action-btn--support" onClick={() => setAcoesPanelAberto(false)}>
            <IconInfo />
            <span>Transferir para suporte VaiTerPlay</span>
          </button>
          <button className="mob-chat-action-btn mob-chat-action-btn--menu" onClick={() => setAcoesPanelAberto(false)}>
            <IconMenu />
            <span>Enviar Menu Inicial</span>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mob-chat-input-area">
        <button
          className={`mob-chat-plus-btn${acoesPanelAberto ? " mob-chat-plus-btn--active" : ""}`}
          onClick={() => setAcoesPanelAberto(!acoesPanelAberto)}
          aria-label={acoesPanelAberto ? "Fechar ações" : "Abrir ações"}
        >
          <IconPlus />
        </button>
        <input
          type="text"
          className="mob-chat-input"
          placeholder="Digite uma mensagem"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviarMensagem();
            }
          }}
          onFocus={() => setAcoesPanelAberto(false)}
          aria-label="Mensagem"
        />
        <button
          className={`mob-chat-send-btn ${temTexto ? "mob-chat-send-btn--active" : "mob-chat-send-btn--disabled"}`}
          onClick={enviarMensagem}
          disabled={!temTexto}
          aria-label="Enviar mensagem"
        >
          <IconSend />
        </button>
      </div>

      {/* Modal de Histórico */}
      {modalHistoricoAberto && (
        <div
          className="mob-chat-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModalHistorico();
          }}
        >
          <div className="mob-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mob-chat-modal-handle" />

            <div className="mob-chat-modal-header">
              <div>
                <h2 className="mob-chat-modal-title">Histórico de Reservas</h2>
                <div className="mob-chat-modal-subtitle">
                  {contato.nome} • {contato.telefone}
                </div>
              </div>
              <button className="mob-chat-modal-close" onClick={fecharModalHistorico} aria-label="Fechar">
                <IconClose />
              </button>
            </div>

            {carregandoHistorico ? (
              <LoadingSpinner mensagem="Carregando histórico..." tamanho={24} />
            ) : historicoReservas.length === 0 ? (
              <EmptyState titulo="Nenhuma reserva encontrada." compact />
            ) : (
              <div className="mob-chat-reservas-list">
                {historicoReservas.map((reserva) => (
                  <div key={reserva.id} className="mob-chat-reserva-card">
                    <div className="mob-chat-reserva-top">
                      <div>
                        <div className="mob-chat-reserva-quadra">{reserva.tipoQuadra}</div>
                        <div className="mob-chat-reserva-date">
                          {formatarDataBR(reserva.data)} às {formatarHoraStr(reserva.hora)}
                        </div>
                      </div>
                      <span className={`mob-chat-status-tag mob-chat-status-tag--${reserva.status}`}>
                        {formatarStatus(reserva.status)}
                      </span>
                    </div>
                    <div className="mob-chat-reserva-valor">
                      {formatarMoeda(reserva.valor)}
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
