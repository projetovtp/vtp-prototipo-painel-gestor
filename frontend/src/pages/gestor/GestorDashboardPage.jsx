import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import logoVaiTerPlay from "../../assets/Design sem nome (4).png";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/useDevice";
import { ErrorMessage } from "../../components/ui";

function formatBRL(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const [y, m, d] = String(yyyyMmDd).slice(0, 10).split("-");
  if (!y || !m || !d) return yyyyMmDd;
  return `${d}/${m}/${y}`;
}

function formatHora(hora) {
  if (!hora) return "—";
  return String(hora).slice(0, 5);
}

function formatStatus(status) {
  const map = { paid: "Pago", pending: "Pendente", canceled: "Cancelado" };
  return map[status] || status;
}

function formatCPF(cpf) {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(telefone) {
  if (!telefone) return "";
  const t = telefone.replace(/\D/g, "");
  if (t.length === 11) return t.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (t.length === 10) return t.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return telefone;
}

// Quadras espelhadas de Configurações > Quadras
const MOCK_QUADRAS_CONFIG = [
  {
    id: "config-1",
    nome: "Quadra Principal",
    estrutura: "Indoor",
    material: "Sintético",
    modalidades: ["Futebol", "Futsal"],
    quantidade_quadras: 2,
    status: "ativa",
  },
  {
    id: "config-2",
    nome: "Quadra Externa",
    estrutura: "Externa",
    material: "Gramado Natural",
    modalidades: ["Futebol", "Society", "Campo"],
    quantidade_quadras: 1,
    status: "ativa",
  },
];

const mockContatos = [
  { id: 0, nome: "VaiTerPlay - Suporte", telefone: "(11) 99999-9999", ultimaMensagem: "Olá! Como posso ajudar você hoje?", hora: "15:00", naoLidas: 0, avatar: "VS", fixo: true },
  { id: 1, nome: "João Silva", telefone: "(11) 98765-4321", ultimaMensagem: "Tenho uma dúvida: qual o valor por hora?", hora: "14:30", naoLidas: 0, avatar: "JS" },
  { id: 2, nome: "Maria Santos", telefone: "(11) 91234-5678", ultimaMensagem: "Confirmado! Obrigada", hora: "13:15", naoLidas: 0, avatar: "MS" },
  { id: 3, nome: "Pedro Costa", telefone: "(11) 99876-5432", ultimaMensagem: "Qual o valor da quadra?", hora: "12:45", naoLidas: 1, avatar: "PC" },
  { id: 4, nome: "Ana Oliveira", telefone: "(11) 97654-3210", ultimaMensagem: "Posso cancelar minha reserva?", hora: "11:20", naoLidas: 1, avatar: "AO" },
];

const mensagensPorContato = {
  0: [{ id: 1, texto: "Olá! Como posso ajudar você hoje?", enviada: true, hora: "15:00" }],
  1: [
    { id: 1, texto: "Tenho uma dúvida: qual o valor por hora?", enviada: false, hora: "14:30" },
    { id: 2, texto: "Olá! O valor varia conforme o horário, vou te enviar o menu para fazer a reserva.", enviada: true, hora: "14:32" },
    { id: 3, tipo: "menu", enviada: true, hora: "14:33" },
  ],
  2: [
    { id: 1, texto: "Olá, quero confirmar minha reserva", enviada: false, hora: "13:10" },
    { id: 2, texto: "Claro! Qual o número da sua reserva?", enviada: true, hora: "13:12" },
    { id: 3, texto: "É a reserva #12345", enviada: false, hora: "13:13" },
    { id: 4, texto: "Confirmado! Obrigada", enviada: false, hora: "13:15" },
  ],
  3: [
    { id: 1, texto: "Qual o valor da quadra?", enviada: false, hora: "12:45" },
    { id: 2, texto: "Depende do horário. Qual período você precisa?", enviada: true, hora: "12:47" },
  ],
  4: [
    { id: 1, texto: "Posso cancelar minha reserva?", enviada: false, hora: "11:20" },
    { id: 2, texto: "Sim, qual o número da reserva?", enviada: true, hora: "11:22" },
  ],
};

// ─── SVG Icons ──────────────────────────────────────────────

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

const IconClose = ({ size = 24, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Detalhes Reserva Modal ─────────────────────────────────

const DetalhesReservaModalDashboard = ({ aberto, onFechar, reserva, onCancelado, onCriada }) => {
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [modoNova, setModoNova] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");

  const listaReservas = reserva?.todasReservas || [];
  const isNovaReserva = reserva && !reserva.id && listaReservas.length === 0;
  const mostrarFormulario = isNovaReserva || modoNova;
  const slotInfo = reserva?.slotInfo;
  const infoSlot = isNovaReserva ? reserva : slotInfo;

  useEffect(() => {
    if (aberto) {
      setModoNova(false);
      setNome("");
      setCpf("");
      setPhone("");
      setValor(isNovaReserva ? String(reserva?.preco_hora || "") : "");
      setErro("");
    }
  }, [aberto]);

  if (!aberto || !reserva) return null;

  const nomeQuadra = infoSlot?.quadra
    ? `${infoSlot.quadra.tipo || "Quadra"}${infoSlot.quadra.modalidade ? ` - ${infoSlot.quadra.modalidade}` : ""}`
    : "Quadra";

  const handleCancelarReserva = async (reservaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;
    try {
      setCancelando(true);
      setErro("");
      await api.delete(`/gestor/reservas/${reservaId}`);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao cancelar reserva.");
    } finally {
      setCancelando(false);
    }
  };

  const handleCriarReserva = async () => {
    const info = isNovaReserva ? reserva : slotInfo;
    try {
      setSalvando(true);
      setErro("");
      if (!cpf || !nome) {
        setErro("Informe pelo menos CPF e nome do cliente.");
        setSalvando(false);
        return;
      }
      const body = { quadraId: info.quadra_id, data: info.data, hora: info.hora, nome, cpf, phone };
      if (valor !== "") body.valor = Number(valor);
      await api.post("/gestor/reservas", body);
      if (onCriada) onCriada();
      onFechar();
    } catch (error) {
      console.error("[CRIAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao criar reserva.");
    } finally {
      setSalvando(false);
    }
  };

  const titulo = mostrarFormulario
    ? "Nova Reserva"
    : `Reservas do horário (${listaReservas.length})`;

  return (
    <div className="dash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="dash-modal dash-modal--md" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {modoNova && (
              <button type="button" className="dash-modal-back" onClick={() => setModoNova(false)}>←</button>
            )}
            <h3 className="dash-modal-title">{titulo}</h3>
          </div>
          <button type="button" onClick={onFechar} className="dash-modal-close">×</button>
        </div>

        <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

        {mostrarFormulario ? (
          <div className="dash-fields">
            <div className="dash-nova-reserva-info">
              <div>
                <div className="dash-field-label">Quadra</div>
                <div className="dash-field-value">{nomeQuadra}</div>
              </div>
              <div>
                <div className="dash-field-label">Data e Horário</div>
                <div className="dash-field-value">{formatDateBR(infoSlot?.data)} às {infoSlot?.hora}</div>
              </div>
            </div>
            <div>
              <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Nome do Cliente *</label>
              <input type="text" className="dash-form-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>CPF *</label>
              <input type="text" className="dash-form-input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Telefone</label>
              <input type="text" className="dash-form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Valor</label>
              <input type="number" className="dash-form-input" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" step="0.01" />
            </div>
          </div>
        ) : (
          <div className="dash-fields" style={{ maxHeight: "55vh", overflowY: "auto" }}>
            {listaReservas.map((item, idx) => (
              <div key={item.id || idx} className="dash-reserva-card">
                <div className="dash-reserva-card-header">
                  <h4 className="dash-reserva-card-title">Reserva {idx + 1}</h4>
                  <span className={`dash-status-tag ${item.pago_via_pix ? "dash-status-tag--reservado" : "dash-status-tag--pendente"}`}>
                    {item.pago_via_pix ? "Pago" : "Pendente"}
                  </span>
                </div>
                <div className="dash-fields">
                  <div>
                    <div className="dash-field-label">Quadra</div>
                    <div className="dash-field-value">
                      {item.quadra ? `${item.quadra.tipo || "Quadra"}${item.quadra.modalidade ? ` - ${item.quadra.modalidade}` : ""}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="dash-field-label">Data e Horário</div>
                    <div className="dash-field-value">{formatDateBR(item.data)} às {formatHora(item.hora)}</div>
                  </div>
                  {(item.nome || item.usuario_nome) && (
                    <div>
                      <div className="dash-field-label">Cliente</div>
                      <div className="dash-field-value">{item.nome || item.usuario_nome}</div>
                    </div>
                  )}
                  {item.user_cpf && (
                    <div>
                      <div className="dash-field-label">CPF</div>
                      <div className="dash-field-value">{formatCPF(item.user_cpf)}</div>
                    </div>
                  )}
                  {item.phone && (
                    <div>
                      <div className="dash-field-label">Telefone</div>
                      <div className="dash-field-value">{formatTelefone(item.phone)}</div>
                    </div>
                  )}
                  <div>
                    <div className="dash-field-label">Valor</div>
                    <div className="dash-field-value dash-field-value--lg">{formatBRL(item.preco_total || 0)}</div>
                  </div>
                  <button
                    type="button"
                    className="dash-btn--cancel-sm"
                    onClick={() => handleCancelarReserva(item.id)}
                    disabled={cancelando}
                  >
                    {cancelando ? "Cancelando..." : "Cancelar Reserva"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="dash-modal-actions">
          <button type="button" className="dash-btn dash-btn--secondary" onClick={onFechar}>Fechar</button>
          {mostrarFormulario ? (
            <button type="button" className="dash-btn dash-btn--primary" onClick={handleCriarReserva} disabled={salvando}>
              {salvando ? "Salvando..." : "Criar Reserva"}
            </button>
          ) : (
            <button type="button" className="dash-btn dash-btn--primary" onClick={() => {
              setModoNova(true);
              setValor(String(slotInfo?.preco_hora || ""));
            }}>
              + Adicionar Reserva
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Histórico Modal ────────────────────────────────────────

const HistoricoModal = ({ aberto, contato, historico, carregando, onFechar, onCancelar, podeCancelar }) => {
  if (!aberto || !contato) return null;
  return (
    <div className="dash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal-header">
          <div>
            <h2 className="dash-modal-title">Histórico de Reservas</h2>
            <div className="dash-modal-subtitle">{contato.nome} • {contato.telefone}</div>
          </div>
          <button onClick={onFechar} className="dash-modal-close"><IconClose /></button>
        </div>

        <div className="dash-info-box">
          <div className="dash-info-grid">
            <div>
              <div className="dash-info-label">Telefone</div>
              <div className="dash-info-value">{contato.telefone}</div>
            </div>
            <div>
              <div className="dash-info-label">Total de Reservas</div>
              <div className="dash-info-value">{historico.length}</div>
            </div>
            <div>
              <div className="dash-info-label">Total Gasto</div>
              <div className="dash-info-value dash-info-value--bold">
                {formatBRL(historico.reduce((total, r) => total + (r.valor || 0), 0))}
              </div>
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="dash-empty" style={{ padding: 40 }}>Carregando histórico...</div>
        ) : historico.length === 0 ? (
          <div className="dash-empty" style={{ padding: 40 }}>Nenhuma reserva encontrada.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dash-history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Tipo de Quadra</th>
                  <th className="text-right">Valor</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateBR(r.data)}</td>
                    <td>{formatHora(r.hora)}</td>
                    <td>{r.tipoQuadra}</td>
                    <td className="text-right text-bold">{formatBRL(r.valor)}</td>
                    <td className="text-center">
                      <span className={`dash-status-tag dash-status-tag--${r.status === "paid" ? "pago" : r.status === "pending" ? "pendente" : "cancelado"}`}>
                        {formatStatus(r.status)}
                      </span>
                    </td>
                    <td className="text-center">
                      {podeCancelar(r) ? (
                        <button className="dash-btn-cancel-table" onClick={() => onCancelar(r)}>Cancelar</button>
                      ) : (
                        <span className="dash-expired-label">{r.status === "canceled" ? "Cancelada" : "Prazo expirado"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Confirmação Modal ──────────────────────────────────────

const ConfirmacaoModal = ({ aberto, reserva, onFechar, onConfirmar }) => {
  if (!aberto || !reserva) return null;
  return (
    <div className="dash-modal-overlay dash-modal-overlay--top" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="dash-modal dash-modal--sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="dash-modal-title" style={{ marginBottom: 16 }}>Confirmar Cancelamento</h3>
        <p className="dash-confirm-text">Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.</p>
        <div className="dash-confirm-info">
          <div className="dash-confirm-title">{reserva.tipoQuadra}</div>
          <div className="dash-confirm-detail">{formatDateBR(reserva.data)} às {formatHora(reserva.hora)}</div>
          <div className="dash-confirm-value">{formatBRL(reserva.valor)}</div>
        </div>
        <div className="dash-modal-actions">
          <button className="dash-btn dash-btn--secondary" onClick={onFechar}>Cancelar</button>
          <button className="dash-btn dash-btn--danger" onClick={onConfirmar}>Confirmar Cancelamento</button>
        </div>
      </div>
    </div>
  );
};

// ─── Contact Item ───────────────────────────────────────────

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

// ─── Slot Component ─────────────────────────────────────────

const SlotItem = ({ slotAgregado, grupo, onSlotClick }) => {
  const pagas = slotAgregado.reservadasPagas || 0;
  const pendentes = slotAgregado.reservadasPendentes || 0;
  const disponiveis = slotAgregado.disponiveis || 0;
  const totalReservadas = pagas + pendentes;
  const isBloqueado = slotAgregado.bloqueadas === grupo.totalQuadras;

  let status = "DISPONIVEL";
  if (isBloqueado) status = "BLOQUEADO";
  else if (totalReservadas > 0) status = "RESERVADO";

  const handleClick = () => {
    if (!isBloqueado) onSlotClick(status, slotAgregado, grupo);
  };

  let cardClass = "dash-slot-card";
  if (isBloqueado) cardClass += " dash-slot-card--bloqueado";
  else if (totalReservadas > 0 && disponiveis === 0) cardClass += " dash-slot-card--ocupado";
  else if (totalReservadas > 0) cardClass += " dash-slot-card--misto";

  return (
    <div className={cardClass} onClick={handleClick}>
      <div className="dash-slot-card-hora">{slotAgregado.hora} - {slotAgregado.hora_fim}</div>
      {isBloqueado ? (
        <div className="dash-slot-card-status-text">Bloqueado</div>
      ) : (
        <>
          <div className="dash-slot-card-disp">
            {grupo.totalQuadras > 1
              ? `${disponiveis} de ${grupo.totalQuadras} disponíveis`
              : disponiveis > 0 ? "Disponível" : "Sem vagas"}
          </div>
          {pagas > 0 && (
            <div className="dash-slot-card-row dash-slot-card-row--pago">
              <span className="dash-slot-card-dot dash-slot-card-dot--pago" />
              <span>{pagas} pago{pagas > 1 ? "s" : ""}</span>
            </div>
          )}
          {pendentes > 0 && (
            <div className="dash-slot-card-row dash-slot-card-row--pendente">
              <span className="dash-slot-card-dot dash-slot-card-dot--pendente" />
              <span>{pendentes} pendente{pendentes > 1 ? "s" : ""}</span>
            </div>
          )}
          {slotAgregado.preco_hora > 0 && (
            <div className="dash-slot-card-preco">{formatBRL(slotAgregado.preco_hora)}</div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────

export default function GestorDashboardPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const [contatoSelecionado, setContatoSelecionado] = useState(mockContatos.find(c => c.fixo) || mockContatos[0]);

  useEffect(() => {
    if (isMobile || isTablet) {
      navigate("/gestor/mensagens", { replace: true });
    }
  }, [isMobile, isTablet, navigate]);

  const [reservasHoje] = useState(5);
  const [pixHoje] = useState(1250.00);
  const [taxaOcupacao] = useState(68);
  const [filtroMensagens, setFiltroMensagens] = useState("tudo");

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [contatoHistorico, setContatoHistorico] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({});
  const [carregandoReservas, setCarregandoReservas] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  });
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  useEffect(() => {
    carregarReservas();
    carregarRegrasHorarios();
  }, []);

  useEffect(() => {
    if (dataSelecionada) carregarSlotsTodasQuadras(dataSelecionada);
  }, [dataSelecionada, quadras, reservas, regrasHorarios]);

  const carregarReservas = async () => {
    try {
      setCarregandoReservas(true);
      const response = await api.get("/gestor/reservas");
      const dados = response.data || {};
      setReservas(dados.reservas || []);
      let quadrasCarregadas = dados.quadras || [];

      const quadrasExpandidas = [];
      const quadrasPorNome = {};
      quadrasCarregadas.forEach((quadra) => {
        const nome = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
        if (!quadrasPorNome[nome]) quadrasPorNome[nome] = [];
        quadrasPorNome[nome].push(quadra);
      });

      Object.entries(quadrasPorNome).forEach(([nomeQuadra, quadrasGrupo]) => {
        if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
          // Atribui índice no grupo às quadras originais
          quadrasGrupo.forEach((q, i) => { q.indexInGroup = i; });
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 6; i++) {
            quadrasExpandidas.push({ ...primeira, id: `beach-tennis-${i + 1}-${primeira.id}`, originalId: primeira.id, indexInGroup: i });
          }
        }
        if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
          quadrasGrupo.forEach((q, i) => { q.indexInGroup = i; });
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 3; i++) {
            quadrasExpandidas.push({ ...primeira, id: `padel-${i + 1}-${primeira.id}`, originalId: primeira.id, indexInGroup: i });
          }
        }
      });

      const todas = [...quadrasCarregadas, ...quadrasExpandidas];
      setQuadras(todas);
    } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
    } finally {
      setCarregandoReservas(false);
    }
  };

  const carregarRegrasHorarios = async () => {
    try {
      const resp = await api.get("/gestor/quadras");
      const quadrasData = Array.isArray(resp.data) ? resp.data : resp.data?.quadras || [];
      const todasRegras = [];
      for (const quadra of quadrasData) {
        try {
          const r = await api.get("/gestor/agenda/regras", { params: { quadraId: quadra.id } });
          (r.data?.regras || []).forEach(regra => todasRegras.push({ ...regra, quadra_id: quadra.id }));
        } catch (error) {
          console.error(`[REGRAS] Erro quadra ${quadra.id}:`, error);
        }
      }
      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro:", error);
    }
  };

  const gerarReservasExemplo = (quadraId, dataISO, horaStr) => {
    if (!quadras || quadras.length === 0) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

    const quadra = quadras.find(q => q.id === quadraId);
    if (!quadra) return { status: "DISPONIVEL", reserva: null, bloqueio: null };

    const nomeQ = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
    const hora = parseInt(horaStr.split(":")[0]);

    if (nomeQ.includes("Beach tennis") || nomeQ.includes("Beach Tennis")) {
      // Usa o índice estável no grupo (0-5) em vez de hash instável
      const quadraNoGrupo = quadra.indexInGroup ?? 0;

      // Mock de exemplo: 10:00 → 2 pagas + 1 pendente + 3 disponíveis
      if (hora === 10) {
        if (quadraNoGrupo === 0) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex-paga-1-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "111.222.333-44", phone: "(11) 91111-1111", preco_total: 120, pago_via_pix: true, nome: "Carlos Mendes", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 1) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex-paga-2-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "222.333.444-55", phone: "(11) 92222-2222", preco_total: 120, pago_via_pix: true, nome: "Ana Costa", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 2) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "333.444.555-66", phone: "(11) 93333-3333", preco_total: 120, pago_via_pix: false, nome: "Pedro Lima", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        // quadrasNoGrupo 3, 4, 5 → disponíveis (cai no return final)
      }

      // Mock de exemplo: 13:00 → 2 pagas + 1 pendente + 3 disponíveis
      if (hora === 13) {
        if (quadraNoGrupo === 0) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex13-paga-1-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "444.555.666-77", phone: "(11) 94444-4444", preco_total: 130, pago_via_pix: true, nome: "Lucas Ferreira", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 1) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex13-paga-2-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "555.666.777-88", phone: "(11) 95555-5555", preco_total: 130, pago_via_pix: true, nome: "Juliana Rocha", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 2) {
          return {
            status: "RESERVADO",
            reserva: { id: `ex13-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "666.777.888-99", phone: "(11) 96666-6666", preco_total: 130, pago_via_pix: false, nome: "Rafael Souza", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        // quadrasNoGrupo 3, 4, 5 → disponíveis
      }

      if (hora === 14) {
        if (quadraNoGrupo === 0) {
          return {
            status: "RESERVADO",
            reserva: { id: `reserva-paga-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "123.456.789-00", phone: "(11) 98765-4321", preco_total: 150, pago_via_pix: true, nome: "João Silva", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
        if (quadraNoGrupo === 1) {
          return {
            status: "RESERVADO",
            reserva: { id: `reserva-pendente-${quadraId}-${dataISO}-${horaStr}`, user_cpf: "987.654.321-00", phone: "(11) 91234-5678", preco_total: 150, pago_via_pix: false, nome: "Maria Santos", quadra_id: quadraId, data: dataISO, hora: horaStr },
            bloqueio: null,
          };
        }
      }
    }

    const reservaReal = reservas.find((r) => {
      const rd = r.data?.split("T")[0] || r.data;
      const rh = r.hora || r.hora_inicio || "";
      return r.quadra_id === quadraId && rd === dataISO && rh.startsWith(horaStr.split(":")[0]);
    });

    if (reservaReal) {
      return {
        status: "RESERVADO",
        reserva: { id: reservaReal.id, user_cpf: reservaReal.user_cpf, phone: reservaReal.phone, preco_total: reservaReal.preco_total, pago_via_pix: reservaReal.pago_via_pix, nome: reservaReal.nome || reservaReal.user_name },
        bloqueio: null,
      };
    }

    return { status: "DISPONIVEL", reserva: null, bloqueio: null };
  };

  const carregarSlotsTodasQuadras = async (dataISO) => {
    if (!dataISO || quadras.length === 0) return;
    try {
      const slotsAgrupados = {};
      const data = new Date(`${dataISO}T12:00:00`);
      const diaSemana = data.getDay();
      const horarios = [];
      for (let h = 8; h <= 22; h++) {
        horarios.push({ hora: `${String(h).padStart(2, "0")}:00`, hora_fim: `${String(h + 1).padStart(2, "0")}:00` });
      }
      for (const quadra of quadras) {
        // Quadras expandidas usam as regras da quadra original como fallback
        let regrasQ = regrasHorarios.filter((r) => r.quadra_id === quadra.id && r.dia_semana === diaSemana);
        if (regrasQ.length === 0 && quadra.originalId) {
          regrasQ = regrasHorarios.filter((r) => r.quadra_id === quadra.originalId && r.dia_semana === diaSemana);
        }
        const slots = [];
        for (const hor of horarios) {
          const regra = regrasQ.find((r) => {
            const hi = parseInt(r.hora_inicio?.split(":")[0] || 0);
            const hf = parseInt(r.hora_fim?.split(":")[0] || 0);
            const hs = parseInt(hor.hora.split(":")[0]);
            return hs >= hi && hs < hf;
          });
          const precoHora = regra ? (regra.valor || 100) : 100;
          const reservaReal = reservas.find((r) => {
            const rd = r.data?.split("T")[0] || r.data;
            const rh = r.hora || "";
            return r.quadra_id === quadra.id && rd === dataISO && rh.startsWith(hor.hora.split(":")[0]);
          });
          const exemplo = reservaReal ? null : gerarReservasExemplo(quadra.id, dataISO, hor.hora);
          const statusFinal = reservaReal ? "RESERVADO" : (exemplo?.status || "DISPONIVEL");
          const reservaFinal = reservaReal
            ? { ...reservaReal, quadra, nome: reservaReal.nome || reservaReal.usuario_nome || reservaReal.user_name || "Cliente" }
            : (exemplo?.reserva ? { ...exemplo.reserva, quadra } : null);
          slots.push({ ...hor, quadra_id: quadra.id, preco_hora: precoHora, status: statusFinal, reserva: reservaFinal });
        }
        if (slots.length > 0) slotsAgrupados[quadra.id] = slots;
      }
      setSlotsPorQuadra(slotsAgrupados);
    } catch (error) {
      console.error("[SLOTS] Erro:", error);
    }
  };

  const getNomeQuadra = (quadraId) => {
    const q = quadras.find((q) => q.id === quadraId);
    if (!q) return "Quadra não encontrada";
    return `${q.tipo || "Quadra"}${q.modalidade ? ` - ${q.modalidade}` : ""}`;
  };

  const agruparQuadrasPorNome = () => {
    const grupos = {};
    quadras.forEach((q) => {
      const nome = getNomeQuadra(q.id);
      if (!grupos[nome]) grupos[nome] = [];
      grupos[nome].push(q);
    });
    return grupos;
  };

  const agregarSlotsGrupo = (quadrasGrupo) => {
    const agg = {};
    quadrasGrupo.forEach((quadra) => {
      (slotsPorQuadra[quadra.id] || []).forEach((slot) => {
        const hora = slot.hora || slot.hora_inicio || "";
        if (!agg[hora]) {
          agg[hora] = {
            hora,
            hora_fim: slot.hora_fim || (() => { const h = parseInt(hora.split(":")[0]); return `${String(h + 1).padStart(2, "0")}:00`; })(),
            disponiveis: 0, reservadasPagas: 0, reservadasPendentes: 0, bloqueadas: 0,
            total: quadrasGrupo.length, reservas: [], bloqueios: [], preco_hora: slot.preco_hora || 100,
          };
        }
        const s = (slot.status || "").toUpperCase();
        if (s === "DISPONIVEL" || s === "LIVRE") agg[hora].disponiveis++;
        else if (s === "RESERVADO" || s === "RESERVADA") {
          if (slot.reserva?.pago_via_pix === true) agg[hora].reservadasPagas++;
          else agg[hora].reservadasPendentes++;
          if (slot.reserva) agg[hora].reservas.push(slot.reserva);
        } else if (s === "BLOQUEADO" || s === "BLOQUEADA") {
          agg[hora].bloqueadas++;
          if (slot.bloqueio) agg[hora].bloqueios.push(slot.bloqueio);
        }
      });
    });
    return Object.values(agg).sort((a, b) => a.hora.localeCompare(b.hora));
  };

  const gruposQuadras = useMemo(() => agruparQuadrasPorNome(), [quadras]);

  const gruposFiltrados = useMemo(() => {
    if (!quadraSelecionadaId) return gruposQuadras;

    // Filtragem por quadra da configuração (mapeia pelo índice)
    const configIndex = MOCK_QUADRAS_CONFIG.findIndex(q => q.id === quadraSelecionadaId);
    if (configIndex >= 0) {
      const grupoEntries = Object.entries(gruposQuadras);
      if (configIndex < grupoEntries.length) {
        const [nome, quadrasGrupo] = grupoEntries[configIndex];
        return { [nome]: quadrasGrupo };
      }
      return gruposQuadras;
    }

    // Fallback: filtragem original por ID de quadra da API
    const sel = quadras.find(q => q.id === quadraSelecionadaId);
    if (!sel) return gruposQuadras;
    const nome = getNomeQuadra(sel.id);
    return { [nome]: gruposQuadras[nome] || [] };
  }, [quadraSelecionadaId, gruposQuadras, quadras]);

  const gruposComSlots = useMemo(() => {
    if (!dataSelecionada || Object.keys(gruposFiltrados).length === 0) return [];
    return Object.entries(gruposFiltrados).map(([nomeGrupo, qg]) => {
      if (!qg || qg.length === 0) return null;
      return { nomeGrupo, quadrasGrupo: qg, totalQuadras: qg.length, slotsAgregados: agregarSlotsGrupo(qg) };
    }).filter(Boolean);
  }, [gruposFiltrados, dataSelecionada, slotsPorQuadra]);

  const contatoFixo = mockContatos.find(c => c.fixo);
  let outrosContatos = mockContatos.filter(c => !c.fixo);
  const contatosComNaoLidas = mockContatos.filter(c => (c.naoLidas || 0) > 0).length;
  if (filtroMensagens === "nao-lidas") outrosContatos = outrosContatos.filter(c => c.naoLidas > 0);

  const abrirHistoricoContato = async (contato) => {
    try {
      setContatoHistorico(contato);
      setModalHistoricoAberto(true);
      setCarregandoHistorico(true);
      setHistoricoReservas([]);
      await new Promise(resolve => setTimeout(resolve, 500));
      const agora = new Date();
      const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
      const vinteCincoHorasAtras = new Date(agora.getTime() - 25 * 60 * 60 * 1000);
      setHistoricoReservas([
        { id: 1, data: agora.toISOString().split("T")[0], hora: "18:00", tipoQuadra: "Futebol - Campo Society", valor: 150.00, status: "paid", created_at: duasHorasAtras.toISOString() },
        { id: 2, data: agora.toISOString().split("T")[0], hora: "20:00", tipoQuadra: "Futebol - Campo Society", valor: 150.00, status: "pending", created_at: duasHorasAtras.toISOString() },
        { id: 3, data: "2024-01-05", hora: "19:00", tipoQuadra: "Futebol - Campo Society", valor: 150.00, status: "paid", created_at: vinteCincoHorasAtras.toISOString() },
      ]);
      setCarregandoHistorico(false);
    } catch (error) {
      console.error("[HISTÓRICO] Erro:", error);
      setCarregandoHistorico(false);
    }
  };

  const podeCancelar = (reserva) => {
    if (reserva.status !== "pending" && reserva.status !== "paid") return false;
    if (!reserva.created_at) return false;
    return (new Date() - new Date(reserva.created_at)) / (1000 * 60 * 60) <= 24;
  };

  const confirmarCancelamento = async () => {
    if (!reservaParaCancelar) return;
    try {
      setHistoricoReservas(prev => prev.map(r => r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r));
      setModalConfirmacaoAberto(false);
      setReservaParaCancelar(null);
    } catch (error) {
      console.error("[CANCELAR] Erro:", error);
      alert("Erro ao cancelar reserva. Tente novamente.");
    }
  };

  const handleSlotClick = (status, slotAgregado, grupo) => {
    if (status === "DISPONIVEL" || status === "LIVRE") {
      const primeiraQuadra = grupo.quadrasGrupo[0];
      setReservaSelecionada({
        quadra_id: primeiraQuadra.id, data: dataSelecionada, hora: slotAgregado.hora,
        preco_hora: slotAgregado.preco_hora || 0, quadra: primeiraQuadra,
        grupoQuadras: grupo.totalQuadras > 1 ? grupo.quadrasGrupo : null,
      });
      setModalAberto(true);
    } else if (status === "RESERVADO" || status === "RESERVADA") {
      if (slotAgregado.reservas && slotAgregado.reservas.length > 0) {
        const primeiraQuadra = grupo.quadrasGrupo[0];
        const completas = slotAgregado.reservas.map((res) => {
          const qr = quadras.find(q => q.id === res.quadra_id) || primeiraQuadra;
          return { ...res, quadra: qr, data: res.data || dataSelecionada, hora: res.hora || slotAgregado.hora, nome: res.nome || res.usuario_nome || res.user_name || "Cliente" };
        });
        setReservaSelecionada({
          ...completas[0],
          todasReservas: completas,
          slotInfo: {
            quadra_id: primeiraQuadra.id,
            quadra: primeiraQuadra,
            data: dataSelecionada,
            hora: slotAgregado.hora,
            hora_fim: slotAgregado.hora_fim,
            preco_hora: slotAgregado.preco_hora || 0,
          },
        });
        setModalAberto(true);
      }
    }
  };

  return (
    <div className="page" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="dash-grid">

        {/* KPI Cards */}
        <div className="card dash-kpi">
          <div className="dash-kpi-label">Reservas para hoje</div>
          <div className="dash-kpi-value">{reservasHoje}</div>
        </div>

        <div className="card dash-kpi">
          <div className="dash-kpi-label">Total Recebido Hoje</div>
          <div className="dash-kpi-value">{formatBRL(pixHoje)}</div>
        </div>

        <div className="card dash-kpi">
          <div className="dash-kpi-label">Taxa de ocupação das quadras</div>
          <div className="dash-kpi-value">{taxaOcupacao}%</div>
        </div>

        {/* Reservas Panel */}
        <div className="card dash-reservas">
          <div className="dash-reservas-header">
            <h3>Reservas</h3>
            <button className="dash-btn-sm" onClick={() => navigate("/gestor/reservas")}>Ver todas</button>
          </div>

          <div className="dash-filters">
            <div className="dash-filter-group">
              <label className="dash-filter-label">Data</label>
              <input type="date" className="dash-filter-input" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
            </div>
            <div className="dash-filter-group">
              <label className="dash-filter-label">Quadra</label>
              <select className="dash-filter-select" value={quadraSelecionadaId} onChange={(e) => setQuadraSelecionadaId(e.target.value)}>
                <option value="">Todas as quadras</option>
                {MOCK_QUADRAS_CONFIG.map((q) => (
                  <option key={q.id} value={q.id}>{q.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="dash-date-label">{formatDateBR(dataSelecionada)}</div>

          <div className="dash-reservas-scroll">
            {carregandoReservas ? (
              <div className="dash-empty">Carregando...</div>
            ) : gruposComSlots.length === 0 ? (
              <div className="dash-empty">Nenhum horário disponível</div>
            ) : (
              <div className="dash-slot-groups">
                {gruposComSlots.map((grupo) => (
                  <div key={grupo.nomeGrupo} className="dash-slot-group">
                    <div>
                      <h4 className="dash-slot-group-title">{grupo.nomeGrupo}</h4>
                      {grupo.totalQuadras > 1 && <p className="dash-slot-group-count">{grupo.totalQuadras} quadras</p>}
                    </div>
                    <div className="dash-slot-list">
                      {grupo.slotsAgregados.map((slot, i) => (
                        <SlotItem key={i} slotAgregado={slot} grupo={grupo} onSlotClick={handleSlotClick} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inbox */}
        <div className="card dash-inbox">
          <h3>Inbox de Mensagens</h3>
          <div className="dash-inbox-grid">
            {/* Contact list */}
            <div className="dash-contacts">
              <div className="dash-contacts-header">
                <input type="text" className="dash-contacts-search" placeholder="Buscar..." />
                <div className="dash-contacts-filters">
                  <button className={`dash-filter-btn${filtroMensagens === "tudo" ? " dash-filter-btn--active" : ""}`} onClick={() => setFiltroMensagens("tudo")}>
                    Tudo
                  </button>
                  <button className={`dash-filter-btn${filtroMensagens === "nao-lidas" ? " dash-filter-btn--active" : ""}`} onClick={() => setFiltroMensagens("nao-lidas")}>
                    <span>Não lidas</span>
                    {contatosComNaoLidas > 0 && <span className="dash-filter-badge">{contatosComNaoLidas > 9 ? "9+" : contatosComNaoLidas}</span>}
                  </button>
                </div>
              </div>
              <div className="dash-contacts-list">
                {contatoFixo && (
                  <ContactItem contato={contatoFixo} isActive={contatoSelecionado?.id === contatoFixo.id} onClick={() => setContatoSelecionado(contatoFixo)} isBrand />
                )}
                {outrosContatos.map((c) => (
                  <ContactItem key={c.id} contato={c} isActive={contatoSelecionado?.id === c.id} onClick={() => setContatoSelecionado(c)} />
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
                  <button className="dash-chat-history-btn" onClick={() => abrirHistoricoContato(contatoSelecionado)} title="Ver Histórico">
                    <IconDoc />
                  </button>
                )}
              </div>

              <div className="dash-chat-messages">
                {(mensagensPorContato[contatoSelecionado?.id] || []).map((msg) => {
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
      </div>

      {/* Modal de Reserva */}
      {modalAberto && (
        <DetalhesReservaModalDashboard
          aberto={modalAberto}
          onFechar={() => { setModalAberto(false); setReservaSelecionada(null); }}
          reserva={reservaSelecionada}
          onCancelado={() => { carregarReservas(); if (dataSelecionada) carregarSlotsTodasQuadras(dataSelecionada); }}
          onCriada={() => { carregarReservas(); if (dataSelecionada) carregarSlotsTodasQuadras(dataSelecionada); }}
        />
      )}

      {/* Modal de Histórico */}
      <HistoricoModal
        aberto={modalHistoricoAberto}
        contato={contatoHistorico}
        historico={historicoReservas}
        carregando={carregandoHistorico}
        onFechar={() => { setModalHistoricoAberto(false); setContatoHistorico(null); setHistoricoReservas([]); }}
        onCancelar={(r) => { setReservaParaCancelar(r); setModalConfirmacaoAberto(true); }}
        podeCancelar={podeCancelar}
      />

      {/* Modal de Confirmação */}
      <ConfirmacaoModal
        aberto={modalConfirmacaoAberto}
        reserva={reservaParaCancelar}
        onFechar={() => { setModalConfirmacaoAberto(false); setReservaParaCancelar(null); }}
        onConfirmar={confirmarCancelamento}
      />
    </div>
  );
}
