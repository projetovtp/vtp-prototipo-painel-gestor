import React, { useState } from "react";
import logoVaiTerPlay from "../../assets/Design sem nome (4).png";
import { mockContatos, mockMensagensPorContato } from "../../mocks/mockContatos";

// ─── SVG Icons ───────────────────────────────────────────────

const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1c7c54" style={{ flexShrink: 0 }}>
    <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z" />
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

const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ─── Contact Item ─────────────────────────────────────────────

const ContactItem = ({ contato, isActive, onClick, isBrand }) => (
  <div
    className={`dash-contact${isActive ? " dash-contact--active" : ""}${contato.fixo ? " dash-contact--pinned" : ""}`}
    onClick={onClick}
  >
    {isBrand ? (
      <div className="dash-contact-avatar dash-contact-avatar--brand">
        <img src={logoVaiTerPlay} alt="VaiTerPlay" />
      </div>
    ) : (
      <div className="dash-contact-avatar">{contato.avatar}</div>
    )}
    <div className="dash-contact-info">
      <div className="dash-contact-row">
        <div className="dash-contact-name-group">
          <div className="dash-contact-name">{contato.nome}</div>
          {contato.fixo && <IconPin />}
          {!contato.fixo && <div className="dash-contact-phone">{contato.telefone}</div>}
        </div>
        <div className="dash-contact-time">{contato.hora}</div>
      </div>
      <div className="dash-contact-preview-row">
        <div className="dash-contact-preview">{contato.ultimaMensagem}</div>
        {contato.naoLidas > 0 && <div className="dash-contact-unread">{contato.naoLidas}</div>}
      </div>
    </div>
  </div>
);

// ─── Dashboard Inbox ──────────────────────────────────────────

/**
 * Painel de inbox de mensagens do Dashboard do Gestor.
 *
 * Props:
 *  - onAbrirHistorico: fn(contato) — abre o modal de histórico para o contato
 */
const DashboardInbox = ({ onAbrirHistorico }) => {
  const [contatoSelecionado, setContatoSelecionado] = useState(
    mockContatos.find((c) => c.fixo) || mockContatos[0]
  );
  const [filtroMensagens, setFiltroMensagens] = useState("tudo");

  const contatoFixo = mockContatos.find((c) => c.fixo);
  const contatosComNaoLidas = mockContatos.filter((c) => (c.naoLidas || 0) > 0).length;
  let outrosContatos = mockContatos.filter((c) => !c.fixo);
  if (filtroMensagens === "nao-lidas") outrosContatos = outrosContatos.filter((c) => c.naoLidas > 0);

  return (
    <div className="card dash-inbox">
      <h3>Inbox de Mensagens</h3>
      <div className="dash-inbox-grid">
        {/* Lista de contatos */}
        <div className="dash-contacts">
          <div className="dash-contacts-header">
            <input type="text" className="dash-contacts-search" placeholder="Buscar..." />
            <div className="dash-contacts-filters">
              <button
                className={`dash-filter-btn${filtroMensagens === "tudo" ? " dash-filter-btn--active" : ""}`}
                onClick={() => setFiltroMensagens("tudo")}
              >
                Tudo
              </button>
              <button
                className={`dash-filter-btn${filtroMensagens === "nao-lidas" ? " dash-filter-btn--active" : ""}`}
                onClick={() => setFiltroMensagens("nao-lidas")}
              >
                <span>Não lidas</span>
                {contatosComNaoLidas > 0 && (
                  <span className="dash-filter-badge">{contatosComNaoLidas > 9 ? "9+" : contatosComNaoLidas}</span>
                )}
              </button>
            </div>
          </div>
          <div className="dash-contacts-list">
            {contatoFixo && (
              <ContactItem
                contato={contatoFixo}
                isActive={contatoSelecionado?.id === contatoFixo.id}
                onClick={() => setContatoSelecionado(contatoFixo)}
                isBrand
              />
            )}
            {outrosContatos.map((c) => (
              <ContactItem
                key={c.id}
                contato={c}
                isActive={contatoSelecionado?.id === c.id}
                onClick={() => setContatoSelecionado(c)}
              />
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="dash-chat">
          <div className="dash-chat-header">
            <div className="dash-chat-avatar">
              {contatoSelecionado?.fixo ? (
                <img src={logoVaiTerPlay} alt="VaiTerPlay" />
              ) : (
                <span className="dash-chat-avatar-text">{contatoSelecionado?.avatar || "?"}</span>
              )}
            </div>
            <div className="dash-chat-user">
              <div className="dash-chat-user-name">{contatoSelecionado?.nome || "Selecione um contato"}</div>
              <div className="dash-chat-user-phone">{contatoSelecionado?.telefone || ""}</div>
            </div>
            {contatoSelecionado && !contatoSelecionado.fixo && (
              <button
                className="dash-chat-history-btn"
                onClick={() => onAbrirHistorico(contatoSelecionado)}
                title="Ver Histórico"
              >
                <IconDoc />
              </button>
            )}
          </div>

          <div className="dash-chat-messages">
            {(mockMensagensPorContato[contatoSelecionado?.id] || []).map((msg) => {
              if (msg.tipo === "menu") {
                return (
                  <div key={msg.id} className="dash-msg dash-msg--sent">
                    <div className="dash-msg-menu">
                      <div className="dash-msg-menu-content">
                        <div className="dash-msg-menu-title">Bem-vindo ao Vai Ter Play! 🎉</div>
                        <div className="dash-msg-menu-desc">Agende sua quadra com rapidez e segurança.</div>
                        <div className="dash-msg-menu-desc">Escolha uma opção para continuar 👇</div>
                        <div className="dash-msg-menu-desc">Estamos aqui para te ajudar! 💪</div>
                        <div className="dash-msg-menu-buttons">
                          <button className="dash-msg-menu-btn">Atendimento</button>
                          <button className="dash-msg-menu-btn">Agendar quadra</button>
                          <button className="dash-msg-menu-btn">Meus agendamentos</button>
                        </div>
                        <div className="dash-msg-time" style={{ marginTop: 8 }}>{msg.hora}</div>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`dash-msg ${msg.enviada ? "dash-msg--sent" : "dash-msg--received"}`}>
                  <div className={`dash-msg-bubble ${msg.enviada ? "dash-msg-bubble--sent" : "dash-msg-bubble--received"}`}>
                    {msg.texto}
                    <div className="dash-msg-time">{msg.hora}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dash-chat-actions">
            <button className="dash-chat-action-btn dash-chat-action-btn--support">
              <IconInfo />
              <span>Transferir para suporte VaiTerPlay</span>
            </button>
            <button className="dash-chat-action-btn dash-chat-action-btn--menu">
              <IconMenu />
              <span>Enviar Menu Inicial</span>
            </button>
          </div>

          <div className="dash-chat-input-area">
            <input type="text" className="dash-chat-input" placeholder="Digite uma mensagem..." />
            <button className="dash-chat-send-btn">➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInbox;
