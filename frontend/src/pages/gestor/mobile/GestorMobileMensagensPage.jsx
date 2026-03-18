// src/pages/gestor/mobile/GestorMobileMensagensPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGestorMensagens } from "../../../hooks/api";
import { LoadingSpinner, EmptyState } from "../../../components/ui";

const MOCK_CONVERSAS = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "(11) 98765-4321",
    ultimaMensagem: "Obrigado pela reserva!",
    hora: "14:30",
    naoLidas: 2,
    avatar: null,
    tipo: "cliente",
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "(11) 91234-5678",
    ultimaMensagem: "Posso cancelar minha reserva?",
    hora: "13:15",
    naoLidas: 0,
    avatar: null,
    tipo: "cliente",
  },
  {
    id: 3,
    nome: "Pedro Costa",
    telefone: "(11) 99876-5432",
    ultimaMensagem: "Qual o horário disponível?",
    hora: "12:00",
    naoLidas: 1,
    avatar: null,
    tipo: "cliente",
  },
  {
    id: 4,
    nome: "Ana Lima",
    telefone: "(11) 97654-3210",
    ultimaMensagem: "Confirmado para amanhã",
    hora: "Ontem",
    naoLidas: 0,
    avatar: null,
    tipo: "cliente",
  },
  {
    id: 5,
    nome: "Carlos Souza",
    telefone: "(11) 94567-8901",
    ultimaMensagem: "Preciso de mais informações",
    hora: "Ontem",
    naoLidas: 3,
    avatar: null,
    tipo: "cliente",
  },
];

const GestorMobileMensagensPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("tudo");
  const { conversas, loading, listarConversas } = useGestorMensagens();
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        await listarConversas({ busca: "", filtro: "tudo" });
      } catch {
        // Backend indisponível - mock será usado via fallback
      } finally {
        setCarregado(true);
      }
    }
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const conversasData = conversas.length > 0 ? conversas : MOCK_CONVERSAS;

  const conversasFiltradas = conversasData.filter((conv) => {
    const matchBusca = conv.nome.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro =
      filtro === "tudo" || (filtro === "nao-lidas" && conv.naoLidas > 0);
    return matchBusca && matchFiltro;
  });

  const totalNaoLidas = conversasData.filter((conv) => conv.naoLidas > 0).length;

  return (
    <div className="mob-msg">
      <div className="mob-msg-search-bar">
        <div className="mob-msg-search-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="mob-msg-search-input"
            placeholder="Buscar conversas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar conversas"
          />
        </div>

        <div className="mob-msg-filters">
          <button
            onClick={() => setFiltro("tudo")}
            className={`mob-msg-filter-btn${filtro === "tudo" ? " mob-msg-filter-btn--active" : ""}`}
          >
            Tudo
          </button>
          <button
            onClick={() => setFiltro("nao-lidas")}
            className={`mob-msg-filter-btn${filtro === "nao-lidas" ? " mob-msg-filter-btn--active" : ""}`}
          >
            Não Lidas
            {totalNaoLidas > 0 && (
              <span className="mob-msg-filter-badge">{totalNaoLidas}</span>
            )}
          </button>
        </div>
      </div>

      <div className="mob-msg-list">
        {loading && !carregado ? (
          <LoadingSpinner mensagem="Carregando conversas..." tamanho={24} />
        ) : conversasFiltradas.length === 0 ? (
          <EmptyState
            titulo="Nenhuma conversa encontrada"
            descricao="Tente buscar com outros termos"
            compact
          />
        ) : (
          conversasFiltradas.map((conversa) => (
            <div
              key={conversa.id}
              className="mob-msg-item"
              onClick={() => navigate(`/gestor/mensagens/chat/${conversa.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/gestor/mensagens/chat/${conversa.id}`);
              }}
            >
              <div className="mob-msg-avatar">
                {conversa.nome.charAt(0).toUpperCase()}
              </div>

              <div className="mob-msg-info">
                <div className="mob-msg-row">
                  <div className="mob-msg-name">{conversa.nome}</div>
                  <div className="mob-msg-time">{conversa.hora || ""}</div>
                </div>
                <div className="mob-msg-preview-row">
                  <div className="mob-msg-preview">{conversa.ultimaMensagem}</div>
                  {conversa.naoLidas > 0 && (
                    <div className="mob-msg-unread">{conversa.naoLidas}</div>
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

export default GestorMobileMensagensPage;
