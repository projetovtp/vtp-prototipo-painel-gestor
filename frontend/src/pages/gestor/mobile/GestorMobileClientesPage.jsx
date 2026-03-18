import React, { useState, useEffect, useRef } from "react";
import { useGestorClientes } from "../../../hooks/api";
import { gestorReservasApi } from "../../../api/endpoints/gestorReservasApi";
import { LoadingSpinner, EmptyState } from "../../../components/ui";

import {
  formatarMoeda as formatBRL,
  formatarDataBR as formatDateBR,
  formatarHoraStr as formatHora,
  formatarStatus as formatStatus,
} from "../../../utils/formatters";

function calcularStatusCliente(cliente) {
  if (cliente.status === "inativo" || cliente.status === "ativo") return cliente.status;
  if (!cliente.ultimaReserva || cliente.totalReservas === 0) return "inativo";
  const hoje = new Date();
  const ultimaReserva = new Date(cliente.ultimaReserva);
  const dias = Math.floor((hoje - ultimaReserva) / (1000 * 60 * 60 * 24));
  return dias <= 30 ? "ativo" : "inativo";
}

function tempoRelativo(dataStr) {
  if (!dataStr) return "Nunca";
  const agora = new Date();
  const data = new Date(dataStr);
  const dias = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  if (dias < 7) return `${dias} dias atrás`;
  if (dias < 30) return `${Math.floor(dias / 7)} sem. atrás`;
  if (dias < 365) return `${Math.floor(dias / 30)} mês${Math.floor(dias / 30) > 1 ? "es" : ""} atrás`;
  return formatDateBR(dataStr);
}


const CORES_AVATAR = [
  "#37648c", "#1c7c54", "#7c3aed", "#c2410c", "#0891b2", "#4f46e5", "#059669", "#b91c1c",
];

function corDoAvatar(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length];
}

function iniciais(nome) {
  const parts = nome.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return nome.slice(0, 2).toUpperCase();
}

const GestorMobileClientesPage = () => {
  const { listar, obterHistorico } = useGestorClientes();

  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const inputRef = useRef(null);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [confirmAberto, setConfirmAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (buscaAberta && inputRef.current) inputRef.current.focus();
  }, [buscaAberta]);

  useEffect(() => {
    if (sheetAberto) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [sheetAberto]);

  async function carregarClientes() {
    try {
      setCarregando(true);
      const data = await listar({ busca: "" });
      setClientes(data || []);
    } finally {
      setCarregando(false);
    }
  }

  const clientesComStatus = clientes.map((c) => ({ ...c, statusCalc: calcularStatusCliente(c) }));

  const clientesFiltrados = clientesComStatus.filter((c) => {
    const matchBusca = busca === "" || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca) || c.telefone.includes(busca);
    const matchFiltro = filtroStatus === "todos" || c.statusCalc === filtroStatus;
    return matchBusca && matchFiltro;
  });

  const totalAtivos = clientesComStatus.filter((c) => c.statusCalc === "ativo").length;
  const totalInativos = clientesComStatus.filter((c) => c.statusCalc === "inativo").length;

  async function abrirSheet(cliente) {
    setClienteSelecionado(cliente);
    setSheetAberto(true);
    setCarregandoHistorico(true);
    try {
      const data = await obterHistorico(cliente.id);
      setHistoricoReservas(data || []);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharSheet() {
    setSheetAberto(false);
    setTimeout(() => {
      setClienteSelecionado(null);
      setHistoricoReservas([]);
    }, 300);
  }

  function podeCancelar(reserva) {
    if (reserva.status !== "pending" && reserva.status !== "paid") return false;
    if (!reserva.created_at) return false;
    return (new Date() - new Date(reserva.created_at)) / (1000 * 60 * 60) <= 24;
  }

  function pedirCancelamento(reserva) {
    setReservaParaCancelar(reserva);
    setConfirmAberto(true);
  }

  function fecharConfirm() {
    setConfirmAberto(false);
    setReservaParaCancelar(null);
  }

  async function confirmarCancelamento() {
    if (!reservaParaCancelar) return;
    try { await gestorReservasApi.cancelar(reservaParaCancelar.id); } catch { /* local */ }
    setHistoricoReservas((prev) => prev.map((r) => (r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r)));
    if (clienteSelecionado) {
      setClienteSelecionado((prev) => ({
        ...prev,
        totalReservas: Math.max(0, prev.totalReservas - 1),
        totalGasto: Math.max(0, prev.totalGasto - reservaParaCancelar.valor),
      }));
    }
    fecharConfirm();
  }

  return (
    <div className="mcl">
      {/* Stats row */}
      <div className="mcl-stats">
        <button className={`mcl-stat-pill${filtroStatus === "todos" ? " mcl-stat-pill--active" : ""}`} onClick={() => setFiltroStatus("todos")}>
          <span className="mcl-stat-pill-num">{clientesComStatus.length}</span>
          <span className="mcl-stat-pill-label">Todos</span>
        </button>
        <button className={`mcl-stat-pill mcl-stat-pill--green${filtroStatus === "ativo" ? " mcl-stat-pill--active" : ""}`} onClick={() => setFiltroStatus("ativo")}>
          <span className="mcl-stat-pill-num">{totalAtivos}</span>
          <span className="mcl-stat-pill-label">Ativos</span>
        </button>
        <button className={`mcl-stat-pill mcl-stat-pill--gray${filtroStatus === "inativo" ? " mcl-stat-pill--active" : ""}`} onClick={() => setFiltroStatus("inativo")}>
          <span className="mcl-stat-pill-num">{totalInativos}</span>
          <span className="mcl-stat-pill-label">Inativos</span>
        </button>
        <button className="mcl-search-toggle" onClick={() => setBuscaAberta(!buscaAberta)} aria-label="Buscar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
      </div>

      {/* Expandable search bar */}
      {buscaAberta && (
        <div className="mcl-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            ref={inputRef}
            className="mcl-search-input"
            type="text"
            placeholder="Nome, CPF ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="mcl-search-clear" onClick={() => setBusca("")} aria-label="Limpar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      )}

      {/* Client list */}
      <div className="mcl-list">
        {carregando ? (
          <div className="mcl-center"><LoadingSpinner mensagem="Carregando clientes..." tamanho={24} /></div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="mcl-center"><EmptyState titulo={busca ? "Nenhum resultado" : "Nenhum cliente"} compact /></div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="mcl-card" onClick={() => abrirSheet(cliente)}>
              <div className="mcl-card-avatar" style={{ backgroundColor: corDoAvatar(cliente.nome) }}>
                {iniciais(cliente.nome)}
              </div>
              <div className="mcl-card-body">
                <div className="mcl-card-row1">
                  <span className="mcl-card-name">{cliente.nome}</span>
                  <span className={`mcl-badge mcl-badge--${cliente.statusCalc}`}>
                    {cliente.statusCalc === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="mcl-card-row2">
                  <span className="mcl-card-phone">{cliente.telefone}</span>
                </div>
                <div className="mcl-card-row3">
                  <span className="mcl-card-metric">
                    <strong>{cliente.totalReservas}</strong> reservas
                  </span>
                  <span className="mcl-card-dot" />
                  <span className="mcl-card-metric">
                    <strong>{formatBRL(cliente.totalGasto)}</strong>
                  </span>
                  <span className="mcl-card-dot" />
                  <span className="mcl-card-metric mcl-card-metric--time">
                    {tempoRelativo(cliente.ultimaReserva)}
                  </span>
                </div>
              </div>
              <svg className="mcl-card-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ))
        )}
      </div>

      {/* Bottom sheet */}
      {sheetAberto && (
        <div className="mcl-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharSheet(); }}>
          <div className="mcl-sheet" onTouchMove={(e) => e.stopPropagation()}>
            <div className="mcl-sheet-handle" />

            <div className="mcl-sheet-fixed">
              {/* Client header */}
              {clienteSelecionado && (
                <div className="mcl-sheet-header">
                  <div className="mcl-sheet-avatar" style={{ backgroundColor: corDoAvatar(clienteSelecionado.nome) }}>
                    {iniciais(clienteSelecionado.nome)}
                  </div>
                  <div className="mcl-sheet-info">
                    <div className="mcl-sheet-name">{clienteSelecionado.nome}</div>
                    <div className="mcl-sheet-cpf">{clienteSelecionado.cpf}</div>
                  </div>
                  <button className="mcl-sheet-close" onClick={fecharSheet}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>
              )}

              {/* Quick stats */}
              {clienteSelecionado && (
                <div className="mcl-sheet-stats">
                  <div className="mcl-sheet-stat">
                    <div className="mcl-sheet-stat-icon mcl-sheet-stat-icon--blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                    </div>
                    <div className="mcl-sheet-stat-text">
                      <div className="mcl-sheet-stat-label">Telefone</div>
                      <div className="mcl-sheet-stat-value">{clienteSelecionado.telefone}</div>
                    </div>
                  </div>
                  <div className="mcl-sheet-stat-grid">
                    <div className="mcl-sheet-stat-box">
                      <div className="mcl-sheet-stat-box-num">{clienteSelecionado.totalReservas}</div>
                      <div className="mcl-sheet-stat-box-label">Reservas</div>
                    </div>
                    <div className="mcl-sheet-stat-box">
                      <div className="mcl-sheet-stat-box-num mcl-sheet-stat-box-num--green">{formatBRL(clienteSelecionado.totalGasto)}</div>
                      <div className="mcl-sheet-stat-box-label">Total Gasto</div>
                    </div>
                    <div className="mcl-sheet-stat-box">
                      <div className="mcl-sheet-stat-box-num">{tempoRelativo(clienteSelecionado.ultimaReserva)}</div>
                      <div className="mcl-sheet-stat-box-label">Última Reserva</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mcl-sheet-section-title">Histórico de Reservas</div>
            </div>

            {/* Scrollable reservation history */}
            <div className="mcl-sheet-scroll">
              {carregandoHistorico ? (
                <div className="mcl-center"><LoadingSpinner mensagem="Carregando..." tamanho={20} /></div>
              ) : historicoReservas.length === 0 ? (
                <div className="mcl-center"><EmptyState titulo="Nenhuma reserva" compact /></div>
              ) : (
                <div className="mcl-sheet-reservas">
                  {historicoReservas.map((reserva) => (
                    <div key={reserva.id} className="mcl-reserva">
                      <div className="mcl-reserva-left">
                        <div className={`mcl-reserva-dot mcl-reserva-dot--${reserva.status}`} />
                      </div>
                      <div className="mcl-reserva-body">
                        <div className="mcl-reserva-row1">
                          <span className="mcl-reserva-quadra">{reserva.tipoQuadra}</span>
                          <span className={`mcl-reserva-tag mcl-reserva-tag--${reserva.status}`}>
                            {formatStatus(reserva.status)}
                          </span>
                        </div>
                        <div className="mcl-reserva-row2">
                          {formatDateBR(reserva.data)} • {formatHora(reserva.hora)}
                        </div>
                        <div className="mcl-reserva-row3">
                          <span className="mcl-reserva-valor">{formatBRL(reserva.valor)}</span>
                        {podeCancelar(reserva) && (
                          <button className="mcl-reserva-cancel" onClick={() => pedirCancelamento(reserva)}>
                            Cancelar
                          </button>
                        )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm cancel popup */}
      {confirmAberto && reservaParaCancelar && (
        <div className="mcl-confirm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) fecharConfirm(); }}>
          <div className="mcl-confirm">
            <div className="mcl-confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mcl-confirm-title">Cancelar reserva?</div>
            <div className="mcl-confirm-details">
              <span>{reservaParaCancelar.tipoQuadra}</span>
              <span>{formatDateBR(reservaParaCancelar.data)} • {formatHora(reservaParaCancelar.hora)}</span>
              <span className="mcl-confirm-valor">{formatBRL(reservaParaCancelar.valor)}</span>
            </div>
            <div className="mcl-confirm-actions">
              <button className="mcl-confirm-btn mcl-confirm-btn--secondary" onClick={fecharConfirm}>Voltar</button>
              <button className="mcl-confirm-btn mcl-confirm-btn--danger" onClick={confirmarCancelamento}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestorMobileClientesPage;
