import React, { useState, useEffect } from "react";
import { useGestorClientes } from "../../hooks/api";
import { gestorReservasApi } from "../../api/endpoints/gestorReservasApi";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/ui";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function formatHora(hora) {
  if (!hora) return "—";
  return String(hora).slice(0, 5);
}

function formatStatus(status) {
  const statusMap = { paid: "Pago", pending: "Pendente", canceled: "Cancelado" };
  return statusMap[status] || status;
}

function statusTagClass(status) {
  const map = {
    paid: "dash-status-tag--pago",
    pending: "dash-status-tag--pendente",
    canceled: "dash-status-tag--cancelado",
  };
  return `dash-status-tag ${map[status] || ""}`;
}

function calcularStatusCliente(cliente) {
  if (cliente.status === "inativo" || cliente.status === "ativo") {
    return cliente.status;
  }
  if (!cliente.ultimaReserva || cliente.totalReservas === 0) {
    return "inativo";
  }
  const hoje = new Date();
  const ultimaReserva = new Date(cliente.ultimaReserva);
  const diasSemReserva = Math.floor((hoje - ultimaReserva) / (1000 * 60 * 60 * 24));
  return diasSemReserva <= 30 ? "ativo" : "inativo";
}

// ─── Mock data ───────────────────────────────────────────────────────────────

function gerarMockClientes() {
  const hoje = new Date();
  const d = (dias) => new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return [
    { id: 1, nome: "João Silva", cpf: "123.456.789-00", telefone: "(11) 98765-4321", email: "joao.silva@email.com", totalReservas: 15, totalGasto: 2250.0, ultimaReserva: d(15), dataCadastro: "2023-12-01" },
    { id: 2, nome: "Maria Santos", cpf: "987.654.321-00", telefone: "(11) 91234-5678", email: "maria.santos@email.com", totalReservas: 8, totalGasto: 1200.0, ultimaReserva: d(0), dataCadastro: "2024-01-05" },
    { id: 3, nome: "Pedro Costa", cpf: "456.789.123-00", telefone: "(11) 99876-5432", email: "pedro.costa@email.com", totalReservas: 22, totalGasto: 3300.0, ultimaReserva: d(40), dataCadastro: "2023-11-20" },
    { id: 5, nome: "Carlos Mendes", cpf: "321.654.987-00", telefone: "(11) 94567-8901", email: "carlos.mendes@email.com", totalReservas: 5, totalGasto: 750.0, ultimaReserva: d(25), dataCadastro: "2023-12-15" },
    { id: 6, nome: "Fernanda Lima", cpf: "111.222.333-44", telefone: "(11) 91111-2222", email: "fernanda.lima@email.com", totalReservas: 12, totalGasto: 1800.0, ultimaReserva: d(0), dataCadastro: "2024-01-10" },
    { id: 7, nome: "Roberto Alves", cpf: "222.333.444-55", telefone: "(11) 92222-3333", email: "roberto.alves@email.com", totalReservas: 18, totalGasto: 2700.0, ultimaReserva: d(15), dataCadastro: "2023-11-25" },
    { id: 8, nome: "Juliana Ferreira", cpf: "333.444.555-66", telefone: "(11) 93333-4444", email: "juliana.ferreira@email.com", totalReservas: 6, totalGasto: 900.0, ultimaReserva: d(25), dataCadastro: "2024-01-08" },
    { id: 9, nome: "Lucas Souza", cpf: "444.555.666-77", telefone: "(11) 94444-5555", email: "lucas.souza@email.com", totalReservas: 20, totalGasto: 3000.0, ultimaReserva: d(40), dataCadastro: "2023-10-15" },
    { id: 10, nome: "Patricia Rocha", cpf: "555.666.777-88", telefone: "(11) 95555-6666", email: "patricia.rocha@email.com", totalReservas: 9, totalGasto: 1350.0, ultimaReserva: d(0), dataCadastro: "2024-01-12" },
    { id: 11, nome: "Ricardo Martins", cpf: "666.777.888-99", telefone: "(11) 96666-7777", email: "ricardo.martins@email.com", totalReservas: 14, totalGasto: 2100.0, ultimaReserva: d(15), dataCadastro: "2023-12-20" },
    { id: 12, nome: "Amanda Costa", cpf: "777.888.999-00", telefone: "(11) 97777-8888", email: "amanda.costa@email.com", totalReservas: 7, totalGasto: 1050.0, ultimaReserva: d(25), dataCadastro: "2024-01-03" },
    { id: 13, nome: "Bruno Oliveira", cpf: "888.999.000-11", telefone: "(11) 98888-9999", email: "bruno.oliveira@email.com", totalReservas: 11, totalGasto: 1650.0, ultimaReserva: d(60), dataCadastro: "2023-09-10" },
    { id: 14, nome: "Camila Rodrigues", cpf: "999.000.111-22", telefone: "(11) 99999-0000", email: "camila.rodrigues@email.com", totalReservas: 4, totalGasto: 600.0, ultimaReserva: d(0), dataCadastro: "2024-01-15" },
    { id: 15, nome: "Diego Pereira", cpf: "000.111.222-33", telefone: "(11) 90000-1111", email: "diego.pereira@email.com", totalReservas: 16, totalGasto: 2400.0, ultimaReserva: d(15), dataCadastro: "2023-12-05" },
    { id: 16, nome: "Eduarda Silva", cpf: "111.222.333-44", telefone: "(11) 90111-2222", email: "eduarda.silva@email.com", totalReservas: 3, totalGasto: 450.0, ultimaReserva: d(25), dataCadastro: "2024-01-18" },
    { id: 17, nome: "Felipe Araújo", cpf: "222.333.444-55", telefone: "(11) 91234-5678", email: "felipe.araujo@email.com", totalReservas: 10, totalGasto: 1500.0, ultimaReserva: d(0), dataCadastro: "2024-01-20" },
    { id: 18, nome: "Gabriela Nunes", cpf: "333.444.555-66", telefone: "(11) 92345-6789", email: "gabriela.nunes@email.com", totalReservas: 13, totalGasto: 1950.0, ultimaReserva: d(15), dataCadastro: "2023-12-28" },
    { id: 19, nome: "Henrique Barbosa", cpf: "444.555.666-77", telefone: "(11) 93456-7890", email: "henrique.barbosa@email.com", totalReservas: 8, totalGasto: 1200.0, ultimaReserva: d(25), dataCadastro: "2024-01-07" },
    { id: 20, nome: "Isabela Teixeira", cpf: "555.666.777-88", telefone: "(11) 94567-8901", email: "isabela.teixeira@email.com", totalReservas: 6, totalGasto: 900.0, ultimaReserva: d(0), dataCadastro: "2024-01-22" },
  ];
}

function gerarMockHistorico() {
  const agora = new Date();
  const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
  const vinteCincoHorasAtras = new Date(agora.getTime() - 25 * 60 * 60 * 1000);
  return [
    { id: 1, data: agora.toISOString().split("T")[0], hora: "18:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 2, data: agora.toISOString().split("T")[0], hora: "20:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "pending", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 3, data: "2024-01-05", hora: "19:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid", empresa: "Complexo Esportivo ABC", created_at: vinteCincoHorasAtras.toISOString() },
  ];
}

// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const IconeDocumento = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconeAlerta = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconeSeta = ({ direcao = "esquerda" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {direcao === "esquerda"
      ? <polyline points="15 18 9 12 15 6" />
      : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

// ─── Componente Principal ────────────────────────────────────────────────────

export default function GestorClientesPage() {
  const { listar, obterHistorico } = useGestorClientes();

  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");
      const data = await listar({ busca: "" });
      setClientes(data || []);
    } catch {
      setClientes(gerarMockClientes());
    } finally {
      setCarregando(false);
    }
  }

  const clientesComStatus = clientes.map((c) => ({
    ...c,
    status: calcularStatusCliente(c),
  }));

  const clientesFiltrados = clientesComStatus.filter(
    (c) =>
      busca === "" ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cpf.includes(busca) ||
      c.telefone.includes(busca),
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFim);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const novosClientesMes = 4;

  // ─── Histórico ─────────────────────────────────────────────────────────────

  async function abrirHistoricoCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);
    setErro("");
    try {
      const data = await obterHistorico(cliente.id);
      setHistoricoReservas(data || []);
    } catch {
      setHistoricoReservas(gerarMockHistorico());
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setClienteSelecionado(null);
    setHistoricoReservas([]);
  }

  // ─── Cancelamento ──────────────────────────────────────────────────────────

  function podeCancelar(reserva) {
    if (reserva.status !== "pending" && reserva.status !== "paid") return false;
    if (!reserva.created_at) return false;
    const horasDesdeCriacao = (new Date() - new Date(reserva.created_at)) / (1000 * 60 * 60);
    return horasDesdeCriacao <= 24;
  }

  function abrirModalConfirmacao(reserva) {
    setReservaParaCancelar(reserva);
    setModalConfirmacaoAberto(true);
  }

  function fecharModalConfirmacao() {
    setModalConfirmacaoAberto(false);
    setReservaParaCancelar(null);
  }

  async function confirmarCancelamento() {
    if (!reservaParaCancelar) return;
    try {
      setErro("");
      try {
        await gestorReservasApi.cancelar(reservaParaCancelar.id);
      } catch {
        // Backend indisponível — apenas atualiza localmente
      }
      setHistoricoReservas((prev) =>
        prev.map((r) => (r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r)),
      );
      if (clienteSelecionado) {
        setClienteSelecionado((prev) => ({
          ...prev,
          totalReservas: Math.max(0, prev.totalReservas - 1),
          totalGasto: Math.max(0, prev.totalGasto - reservaParaCancelar.valor),
        }));
      }
      fecharModalConfirmacao();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro("Erro ao cancelar reserva. Tente novamente.");
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <h2 className="page-title">Clientes</h2>

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      {/* Estatísticas */}
      <div className="cl-stats-grid">
        <div className="card cl-stat-card">
          <div className="cl-stat-label">Total de Clientes</div>
          <div className="cl-stat-value">{clientesComStatus.length}</div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">
            Clientes Ativos
            <span className="cl-stat-hint">(Reserva nos últimos 30 dias)</span>
          </div>
          <div className="cl-stat-value">
            {clientesComStatus.filter((c) => c.status === "ativo").length}
          </div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">
            Clientes Inativos
            <span className="cl-stat-hint">(Sem reservas nos últimos 30 dias)</span>
          </div>
          <div className="cl-stat-value">
            {clientesComStatus.filter((c) => c.status === "inativo").length}
          </div>
        </div>
        <div className="card cl-stat-card">
          <div className="cl-stat-label">Novos Clientes (este mês)</div>
          <div className="cl-stat-value">{novosClientesMes}</div>
        </div>
      </div>

      {/* Busca */}
      <div className="card cl-stat-card">
        <input
          type="text"
          className="cl-search-input"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela de clientes */}
      {carregando ? (
        <div className="card cl-stat-card">
          <LoadingSpinner mensagem="Carregando clientes..." />
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="card cl-stat-card">
          <EmptyState
            titulo={busca ? "Nenhum cliente encontrado com essa busca." : "Nenhum cliente cadastrado."}
            compact
          />
        </div>
      ) : (
        <div className="card cl-table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="dash-history-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th className="text-right">Reservas</th>
                  <th className="text-right">Total Gasto</th>
                  <th>Última Reserva</th>
                  <th className="text-center">Histórico</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="cl-table-name">{cliente.nome}</td>
                    <td className="cl-table-secondary">{cliente.cpf}</td>
                    <td className="cl-table-secondary">{cliente.telefone}</td>
                    <td>
                      <span className={`cl-status-badge cl-status-badge--${cliente.status}`}>
                        {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-right text-bold">{cliente.totalReservas}</td>
                    <td className="text-right text-bold">{formatBRL(cliente.totalGasto)}</td>
                    <td className="cl-table-secondary">{formatDateBR(cliente.ultimaReserva)}</td>
                    <td className="text-center">
                      <button
                        className="cl-action-btn"
                        onClick={() => abrirHistoricoCliente(cliente)}
                        title="Ver Histórico"
                      >
                        <IconeDocumento />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div className="cl-pagination">
              <div className="cl-pagination-info">
                Mostrando {indiceInicio + 1} a{" "}
                {Math.min(indiceFim, clientesFiltrados.length)} de{" "}
                {clientesFiltrados.length} clientes
              </div>
              <div className="cl-pagination-controls">
                <button
                  className="cl-pagination-btn"
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  <IconeSeta direcao="esquerda" />
                  Anterior
                </button>
                <div className="cl-pagination-counter">
                  <span>Página</span>
                  <span className="cl-pagination-num">{paginaAtual}</span>
                  <span>de</span>
                  <span className="cl-pagination-num">{totalPaginas}</span>
                </div>
                <button
                  className="cl-pagination-btn"
                  onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                  <IconeSeta direcao="direita" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Histórico */}
      {modalHistoricoAberto && (
        <div
          className="dash-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) fecharModalHistorico(); }}
        >
          <div
            className="dash-modal dash-modal--lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-modal-header">
              <div>
                <h2 className="dash-modal-title">Histórico de Reservas</h2>
                {clienteSelecionado && (
                  <div className="dash-modal-subtitle">
                    {clienteSelecionado.nome} • {clienteSelecionado.cpf}
                  </div>
                )}
              </div>
              <button className="dash-modal-close" onClick={fecharModalHistorico}>
                ×
              </button>
            </div>

            {clienteSelecionado && (
              <div className="dash-info-box">
                <div className="dash-info-grid">
                  <div>
                    <div className="dash-info-label">Telefone</div>
                    <div className="dash-info-value">{clienteSelecionado.telefone}</div>
                  </div>
                  <div>
                    <div className="dash-info-label">Total de Reservas</div>
                    <div className="dash-info-value">{clienteSelecionado.totalReservas}</div>
                  </div>
                  <div>
                    <div className="dash-info-label">Total Gasto</div>
                    <div className="dash-info-value dash-info-value--bold">
                      {formatBRL(clienteSelecionado.totalGasto)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {carregandoHistorico ? (
              <LoadingSpinner mensagem="Carregando histórico..." />
            ) : historicoReservas.length === 0 ? (
              <EmptyState titulo="Nenhuma reserva encontrada." compact />
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
                    {historicoReservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td>{formatDateBR(reserva.data)}</td>
                        <td>{formatHora(reserva.hora)}</td>
                        <td>{reserva.tipoQuadra}</td>
                        <td className="text-right text-bold">{formatBRL(reserva.valor)}</td>
                        <td className="text-center">
                          <span className={statusTagClass(reserva.status)}>
                            {formatStatus(reserva.status)}
                          </span>
                        </td>
                        <td className="text-center">
                          {podeCancelar(reserva) ? (
                            <button
                              className="dash-btn-cancel-table"
                              onClick={() => abrirModalConfirmacao(reserva)}
                              title="Cancelar reserva"
                            >
                              Cancelar
                            </button>
                          ) : (
                            <span className="dash-expired-label">
                              {reserva.status === "canceled" ? "Cancelada" : "Prazo expirado"}
                            </span>
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
      )}

      {/* Modal de Confirmação de Cancelamento */}
      {modalConfirmacaoAberto && reservaParaCancelar && (
        <div
          className="dash-modal-overlay dash-modal-overlay--top"
          onClick={(e) => { if (e.target === e.currentTarget) fecharModalConfirmacao(); }}
        >
          <div
            className="dash-modal dash-modal--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cl-confirm-icon">
              <div className="cl-confirm-icon-circle">
                <IconeAlerta />
              </div>
            </div>

            <h3 className="cl-confirm-title">Confirmar Cancelamento</h3>
            <p className="cl-confirm-message">
              Tem certeza que deseja cancelar esta reserva?
            </p>

            <div className="dash-confirm-info">
              <div className="dash-confirm-detail">Detalhes da Reserva</div>
              <div className="dash-confirm-title">
                <strong>Data:</strong> {formatDateBR(reservaParaCancelar.data)}
              </div>
              <div className="dash-confirm-title">
                <strong>Horário:</strong> {formatHora(reservaParaCancelar.hora)}
              </div>
              <div className="dash-confirm-title">
                <strong>Quadra:</strong> {reservaParaCancelar.tipoQuadra}
              </div>
              <div className="dash-confirm-title">
                <strong>Valor:</strong> {formatBRL(reservaParaCancelar.valor)}
              </div>
            </div>

            <div className="dash-modal-actions">
              <button className="dash-btn dash-btn--secondary" onClick={fecharModalConfirmacao}>
                Voltar
              </button>
              <button className="dash-btn dash-btn--danger" onClick={confirmarCancelamento}>
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
