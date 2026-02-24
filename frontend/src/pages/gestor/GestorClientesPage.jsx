import React, { useState, useEffect } from "react";
import api from "../../services/api";

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
  return String(hora).slice(0, 5); // Retorna apenas HH:MM
}

function formatStatus(status) {
  const statusMap = {
    paid: "Pago",
    pending: "Pendente",
    canceled: "Cancelado"
  };
  return statusMap[status] || status;
}

export default function GestorClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estados para o modal de histórico
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  
  // Estados para o modal de confirmação de cancelamento
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");
      // Mock de clientes para ilustração
      // Nota: O status será calculado automaticamente se não for fornecido
      // Baseado em: tempo sem reservas (>30 dias = inativo) ou nunca reservou = inativo
      const hoje = new Date();
      const quinzeDiasAtras = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 dias = ATIVO
      const vinteCincoDiasAtras = new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 dias = ATIVO
      const quarentaDiasAtras = new Date(hoje.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 dias = INATIVO
      const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 dias = INATIVO

      const mockClientes = [
        {
          id: 1,
          nome: "João Silva",
          cpf: "123.456.789-00",
          telefone: "(11) 98765-4321",
          email: "joao.silva@email.com",
          totalReservas: 15,
          totalGasto: 2250.00,
          ultimaReserva: quinzeDiasAtras.toISOString().split('T')[0], // 15 dias atrás = ATIVO
          dataCadastro: "2023-12-01"
        },
        {
          id: 2,
          nome: "Maria Santos",
          cpf: "987.654.321-00",
          telefone: "(11) 91234-5678",
          email: "maria.santos@email.com",
          totalReservas: 8,
          totalGasto: 1200.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-05"
        },
        {
          id: 3,
          nome: "Pedro Costa",
          cpf: "456.789.123-00",
          telefone: "(11) 99876-5432",
          email: "pedro.costa@email.com",
          totalReservas: 22,
          totalGasto: 3300.00,
          ultimaReserva: quarentaDiasAtras.toISOString().split('T')[0], // 40 dias atrás = INATIVO
          dataCadastro: "2023-11-20"
        },
        {
          id: 5,
          nome: "Carlos Mendes",
          cpf: "321.654.987-00",
          telefone: "(11) 94567-8901",
          email: "carlos.mendes@email.com",
          totalReservas: 5,
          totalGasto: 750.00,
          ultimaReserva: vinteCincoDiasAtras.toISOString().split('T')[0], // 25 dias atrás = ATIVO
          dataCadastro: "2023-12-15"
        },
        {
          id: 6,
          nome: "Fernanda Lima",
          cpf: "111.222.333-44",
          telefone: "(11) 91111-2222",
          email: "fernanda.lima@email.com",
          totalReservas: 12,
          totalGasto: 1800.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-10"
        },
        {
          id: 7,
          nome: "Roberto Alves",
          cpf: "222.333.444-55",
          telefone: "(11) 92222-3333",
          email: "roberto.alves@email.com",
          totalReservas: 18,
          totalGasto: 2700.00,
          ultimaReserva: quinzeDiasAtras.toISOString().split('T')[0], // 15 dias = ATIVO
          dataCadastro: "2023-11-25"
        },
        {
          id: 8,
          nome: "Juliana Ferreira",
          cpf: "333.444.555-66",
          telefone: "(11) 93333-4444",
          email: "juliana.ferreira@email.com",
          totalReservas: 6,
          totalGasto: 900.00,
          ultimaReserva: vinteCincoDiasAtras.toISOString().split('T')[0], // 25 dias = ATIVO
          dataCadastro: "2024-01-08"
        },
        {
          id: 9,
          nome: "Lucas Souza",
          cpf: "444.555.666-77",
          telefone: "(11) 94444-5555",
          email: "lucas.souza@email.com",
          totalReservas: 20,
          totalGasto: 3000.00,
          ultimaReserva: quarentaDiasAtras.toISOString().split('T')[0], // 40 dias = INATIVO
          dataCadastro: "2023-10-15"
        },
        {
          id: 10,
          nome: "Patricia Rocha",
          cpf: "555.666.777-88",
          telefone: "(11) 95555-6666",
          email: "patricia.rocha@email.com",
          totalReservas: 9,
          totalGasto: 1350.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-12"
        },
        {
          id: 11,
          nome: "Ricardo Martins",
          cpf: "666.777.888-99",
          telefone: "(11) 96666-7777",
          email: "ricardo.martins@email.com",
          totalReservas: 14,
          totalGasto: 2100.00,
          ultimaReserva: quinzeDiasAtras.toISOString().split('T')[0], // 15 dias = ATIVO
          dataCadastro: "2023-12-20"
        },
        {
          id: 12,
          nome: "Amanda Costa",
          cpf: "777.888.999-00",
          telefone: "(11) 97777-8888",
          email: "amanda.costa@email.com",
          totalReservas: 7,
          totalGasto: 1050.00,
          ultimaReserva: vinteCincoDiasAtras.toISOString().split('T')[0], // 25 dias = ATIVO
          dataCadastro: "2024-01-03"
        },
        {
          id: 13,
          nome: "Bruno Oliveira",
          cpf: "888.999.000-11",
          telefone: "(11) 98888-9999",
          email: "bruno.oliveira@email.com",
          totalReservas: 11,
          totalGasto: 1650.00,
          ultimaReserva: sessentaDiasAtras.toISOString().split('T')[0], // 60 dias = INATIVO
          dataCadastro: "2023-09-10"
        },
        {
          id: 14,
          nome: "Camila Rodrigues",
          cpf: "999.000.111-22",
          telefone: "(11) 99999-0000",
          email: "camila.rodrigues@email.com",
          totalReservas: 4,
          totalGasto: 600.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-15"
        },
        {
          id: 15,
          nome: "Diego Pereira",
          cpf: "000.111.222-33",
          telefone: "(11) 90000-1111",
          email: "diego.pereira@email.com",
          totalReservas: 16,
          totalGasto: 2400.00,
          ultimaReserva: quinzeDiasAtras.toISOString().split('T')[0], // 15 dias = ATIVO
          dataCadastro: "2023-12-05"
        },
        {
          id: 16,
          nome: "Eduarda Silva",
          cpf: "111.222.333-44",
          telefone: "(11) 90111-2222",
          email: "eduarda.silva@email.com",
          totalReservas: 3,
          totalGasto: 450.00,
          ultimaReserva: vinteCincoDiasAtras.toISOString().split('T')[0], // 25 dias = ATIVO
          dataCadastro: "2024-01-18"
        },
        {
          id: 17,
          nome: "Felipe Araújo",
          cpf: "222.333.444-55",
          telefone: "(11) 91234-5678",
          email: "felipe.araujo@email.com",
          totalReservas: 10,
          totalGasto: 1500.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-20"
        },
        {
          id: 18,
          nome: "Gabriela Nunes",
          cpf: "333.444.555-66",
          telefone: "(11) 92345-6789",
          email: "gabriela.nunes@email.com",
          totalReservas: 13,
          totalGasto: 1950.00,
          ultimaReserva: quinzeDiasAtras.toISOString().split('T')[0], // 15 dias = ATIVO
          dataCadastro: "2023-12-28"
        },
        {
          id: 19,
          nome: "Henrique Barbosa",
          cpf: "444.555.666-77",
          telefone: "(11) 93456-7890",
          email: "henrique.barbosa@email.com",
          totalReservas: 8,
          totalGasto: 1200.00,
          ultimaReserva: vinteCincoDiasAtras.toISOString().split('T')[0], // 25 dias = ATIVO
          dataCadastro: "2024-01-07"
        },
        {
          id: 20,
          nome: "Isabela Teixeira",
          cpf: "555.666.777-88",
          telefone: "(11) 94567-8901",
          email: "isabela.teixeira@email.com",
          totalReservas: 6,
          totalGasto: 900.00,
          ultimaReserva: hoje.toISOString().split('T')[0], // Hoje = ATIVO
          dataCadastro: "2024-01-22"
        }
      ];
      setClientes(mockClientes);
    } catch (error) {
      console.error("[CLIENTES] Erro ao carregar:", error);
      setErro("Erro ao carregar clientes. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Função para determinar se cliente está ativo baseado na última reserva
  // Cliente é considerado ATIVO se fez uma reserva nos últimos 30 dias
  function calcularStatusCliente(cliente) {
    // Se já tem status definido manualmente, usa ele
    if (cliente.status === "inativo" || cliente.status === "ativo") {
      return cliente.status;
    }

    // Se nunca fez reserva, considera inativo
    if (!cliente.ultimaReserva || cliente.totalReservas === 0) {
      return "inativo";
    }

    // Calcula quantos dias se passaram desde a última reserva
    const hoje = new Date();
    const ultimaReserva = new Date(cliente.ultimaReserva);
    const diasSemReserva = Math.floor((hoje - ultimaReserva) / (1000 * 60 * 60 * 24));

    // Cliente ATIVO se fez reserva nos últimos 30 dias
    return diasSemReserva <= 30 ? "ativo" : "inativo";
  }

  // Adiciona status calculado aos clientes que não têm
  const clientesComStatus = clientes.map((cliente) => ({
    ...cliente,
    status: calcularStatusCliente(cliente)
  }));

  const clientesFiltrados = clientesComStatus.filter((cliente) =>
    busca === "" ||
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpf.includes(busca) ||
    cliente.telefone.includes(busca)
  );

  // Paginação
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFim);

  // Resetar para página 1 quando a busca mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  // Calcular novos clientes do mês atual
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const novosClientesMes = 4;

  // Função para abrir modal e carregar histórico do cliente
  async function abrirHistoricoCliente(cliente) {
    setClienteSelecionado(cliente);
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);
    setErro("");

    try {
      // Buscar reservas do cliente pelo CPF ou telefone
      // Por enquanto, vamos usar dados mockados. Quando integrar com API real, usar:
      // const { data } = await api.get(`/gestor/reservas?cpf=${cliente.cpf.replace(/\D/g, '')}`);
      
      // Mock de histórico de reservas
      // Adicionando created_at para calcular se passou 24h
      const agora = new Date();
      const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000); // 2 horas atrás - pode cancelar
      const vinteCincoHorasAtras = new Date(agora.getTime() - 25 * 60 * 60 * 1000); // 25 horas atrás - não pode cancelar
      const tresDiasAtras = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 dias atrás - não pode cancelar

      const mockHistorico = [
        {
          id: 1,
          data: agora.toISOString().split('T')[0],
          hora: "18:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "paid",
          empresa: "Complexo Esportivo ABC",
          created_at: duasHorasAtras.toISOString() // Criada há 2h - pode cancelar
        },
        {
          id: 2,
          data: agora.toISOString().split('T')[0],
          hora: "20:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "pending",
          empresa: "Complexo Esportivo ABC",
          created_at: duasHorasAtras.toISOString() // Criada há 2h - pode cancelar
        },
        {
          id: 3,
          data: "2024-01-05",
          hora: "19:00",
          tipoQuadra: "Futebol - Campo Society",
          valor: 150.00,
          status: "paid",
          empresa: "Complexo Esportivo ABC",
          created_at: vinteCincoHorasAtras.toISOString() // Criada há 25h - não pode cancelar
        }
      ];

      // Filtrar histórico baseado no cliente (simulação)
      setHistoricoReservas(mockHistorico);
    } catch (error) {
      console.error("[HISTÓRICO] Erro ao carregar:", error);
      setErro("Erro ao carregar histórico de reservas.");
    } finally {
      setCarregandoHistorico(false);
    }
  }

  function fecharModalHistorico() {
    setModalHistoricoAberto(false);
    setClienteSelecionado(null);
    setHistoricoReservas([]);
  }

  // Função para verificar se pode cancelar a reserva
  function podeCancelar(reserva) {
    // Só pode cancelar se status for pending ou paid
    if (reserva.status !== "pending" && reserva.status !== "paid") {
      return false;
    }

    // Verifica se passou 24 horas desde a criação da reserva
    if (!reserva.created_at) {
      return false;
    }

    const agora = new Date();
    const dataCriacao = new Date(reserva.created_at);
    const horasDesdeCriacao = (agora - dataCriacao) / (1000 * 60 * 60);

    return horasDesdeCriacao <= 24;
  }

  // Função para abrir modal de confirmação
  function abrirModalConfirmacao(reserva) {
    setReservaParaCancelar(reserva);
    setModalConfirmacaoAberto(true);
  }

  function fecharModalConfirmacao() {
    setModalConfirmacaoAberto(false);
    setReservaParaCancelar(null);
  }

  // Função para cancelar reserva
  async function confirmarCancelamento() {
    if (!reservaParaCancelar) return;

    try {
      setErro("");
      // TODO: Quando integrar com API real, usar:
      // await api.patch(`/gestor/reservas/${reservaParaCancelar.id}/cancelar`);
      
      // Atualizar o status localmente
      setHistoricoReservas((prev) =>
        prev.map((r) =>
          r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r
        )
      );

      // Atualizar também o total de reservas e gasto do cliente
      if (clienteSelecionado) {
        setClienteSelecionado((prev) => ({
          ...prev,
          totalReservas: Math.max(0, prev.totalReservas - 1),
          totalGasto: Math.max(0, prev.totalGasto - reservaParaCancelar.valor)
        }));
      }

      fecharModalConfirmacao();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro("Erro ao cancelar reserva. Tente novamente.");
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Clientes</h1>
      </div>

      {erro && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {/* Estatísticas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ marginTop: 0, padding: "16px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total de Clientes</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
            {clientesComStatus.length}
          </div>
        </div>
        <div className="card" style={{ marginTop: 0, padding: "16px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span>Clientes Ativos</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>(Realizaram reserva nos últimos 30 dias)</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
            {clientesComStatus.filter((c) => c.status === "ativo").length}
          </div>
        </div>
        <div className="card" style={{ marginTop: 0, padding: "16px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Novos Clientes (este mês)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
            {novosClientesMes}
          </div>
        </div>
      </div>

      {/* Barra de busca */}
      <div className="card" style={{ marginTop: 0, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            outline: "none"
          }}
        />
      </div>

      {/* Lista de clientes */}
      {carregando ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div>Carregando clientes...</div>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {busca ? "Nenhum cliente encontrado com essa busca." : "Nenhum cliente cadastrado."}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 0, padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Nome
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    CPF
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Contato
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Reservas
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Total Gasto
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Última Reserva
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                    Histórico
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.map((cliente) => (
                  <tr key={cliente.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827", fontWeight: 500 }}>
                      {cliente.nome}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                      {cliente.cpf}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                      {cliente.telefone}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, color: "#111827", fontWeight: 500 }}>
                      {cliente.totalReservas}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, color: "#111827", fontWeight: 600 }}>
                      {formatBRL(cliente.totalGasto)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                      {formatDateBR(cliente.ultimaReserva)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <button
                          onClick={() => abrirHistoricoCliente(cliente)}
                          style={{
                            padding: "8px",
                            borderRadius: 6,
                            backgroundColor: "#37648c",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s"
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#2d4f6f"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#37648c"}
                          title="Ver Histórico"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {totalPaginas > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb"
            }}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    backgroundColor: paginaAtual === 1 ? "#f3f4f6" : "#ffffff",
                    color: paginaAtual === 1 ? "#9ca3af" : "#111827",
                    border: "1px solid #e5e7eb",
                    cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtual !== 1) {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtual !== 1) {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Anterior
                </button>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 4,
                  fontSize: 14,
                  color: "#6b7280"
                }}>
                  <span>Página</span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: "#111827",
                    minWidth: "20px",
                    textAlign: "center"
                  }}>
                    {paginaAtual}
                  </span>
                  <span>de</span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: "#111827"
                  }}>
                    {totalPaginas}
                  </span>
                </div>

                <button
                  onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    backgroundColor: paginaAtual === totalPaginas ? "#f3f4f6" : "#ffffff",
                    color: paginaAtual === totalPaginas ? "#9ca3af" : "#111827",
                    border: "1px solid #e5e7eb",
                    cursor: paginaAtual === totalPaginas ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (paginaAtual !== totalPaginas) {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.borderColor = "#d1d5db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paginaAtual !== totalPaginas) {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  Próxima
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Histórico */}
      {modalHistoricoAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModalHistorico();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 800,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                  Histórico de Reservas
                </h2>
                {clienteSelecionado && (
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    {clienteSelecionado.nome} • {clienteSelecionado.cpf}
                  </div>
                )}
              </div>
              <button
                onClick={fecharModalHistorico}
                style={{
                  padding: "8px",
                  borderRadius: 6,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Informações do Cliente */}
            {clienteSelecionado && (
              <div style={{ backgroundColor: "#f9fafb", borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Telefone</div>
                    <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{clienteSelecionado.telefone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total de Reservas</div>
                    <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{clienteSelecionado.totalReservas}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Gasto</div>
                    <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>{formatBRL(clienteSelecionado.totalGasto)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Reservas */}
            {carregandoHistorico ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div>Carregando histórico...</div>
              </div>
            ) : historicoReservas.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Nenhuma reserva encontrada.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Data
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Horário
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Tipo de Quadra
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Valor
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Status
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoReservas.map((reserva) => (
                      <tr key={reserva.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827" }}>
                          {formatDateBR(reserva.data)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827" }}>
                          {formatHora(reserva.hora)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#111827" }}>
                          {reserva.tipoQuadra}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, color: "#111827", fontWeight: 600 }}>
                          {formatBRL(reserva.valor)}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              backgroundColor:
                                reserva.status === "paid"
                                  ? "#d1fae5"
                                  : reserva.status === "pending"
                                  ? "#fef3c7"
                                  : "#fee2e2",
                              color:
                                reserva.status === "paid"
                                  ? "#065f46"
                                  : reserva.status === "pending"
                                  ? "#92400e"
                                  : "#991b1b"
                            }}
                          >
                            {formatStatus(reserva.status)}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {podeCancelar(reserva) ? (
                            <button
                              onClick={() => abrirModalConfirmacao(reserva)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                              onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                              title="Cancelar reserva"
                            >
                              Cancelar
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>
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
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharModalConfirmacao();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone de alerta */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>

            {/* Título */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                textAlign: "center",
                marginBottom: 8
              }}
            >
              Confirmar Cancelamento
            </h3>

            {/* Mensagem */}
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 1.5
              }}
            >
              Tem certeza que deseja cancelar esta reserva?
            </p>

            {/* Informações da reserva */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Detalhes da Reserva</div>
              <div style={{ fontSize: 14, color: "#111827", marginBottom: 4 }}>
                <strong>Data:</strong> {formatDateBR(reservaParaCancelar.data)}
              </div>
              <div style={{ fontSize: 14, color: "#111827", marginBottom: 4 }}>
                <strong>Horário:</strong> {formatHora(reservaParaCancelar.hora)}
              </div>
              <div style={{ fontSize: 14, color: "#111827", marginBottom: 4 }}>
                <strong>Quadra:</strong> {reservaParaCancelar.tipoQuadra}
              </div>
              <div style={{ fontSize: 14, color: "#111827" }}>
                <strong>Valor:</strong> {formatBRL(reservaParaCancelar.valor)}
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={fecharModalConfirmacao}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCancelamento}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
