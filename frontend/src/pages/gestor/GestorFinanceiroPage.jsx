// src/pages/gestor/GestorFinanceiroPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

function formatBRL(v) {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("pt-BR");
}

function statusLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "Pago";
  if (v === "pending") return "Pendente";
  if (v === "canceled" || v === "cancelled") return "Cancelado";
  return v || "-";
}

function statusClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "paid";
  if (v === "pending") return "pending";
  if (v === "canceled" || v === "cancelled") return "canceled";
  return "pending";
}

function statusRepasseLabel(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "Concluído";
  if (v === "pendente") return "Pendente";
  if (v === "recusado" || v === "rejeitado") return "Recusado";
  return v || "Pendente";
}

function statusRepasseClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "pago" || v === "concluido" || v === "concluído") return "concluido";
  if (v === "pendente") return "pendente";
  if (v === "recusado" || v === "rejeitado") return "recusado";
  return "pendente";
}

export default function GestorFinanceiroPage() {
  const [overviewTotal, setOverviewTotal] = useState(null);
  const [overviewPendente, setOverviewPendente] = useState(null);
  const [overviewCancelado, setOverviewCancelado] = useState(null);
  const [repasses, setRepasses] = useState([]);
  const [nomeTitular, setNomeTitular] = useState("Lorenzo Formenton");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  // Estados para modal de detalhes de repasse
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [repasseSelecionado, setRepasseSelecionado] = useState(null);
  const [detalhesRepasse, setDetalhesRepasse] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  // Estado para modal de detalhes de vendas (unificado)
  const [modalDetalhesVendasAberto, setModalDetalhesVendasAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("processamento"); // "processamento", "canceladas", "taxa"

  // Estado para modal de detalhes de Total a Receber e Total Recebido
  const [modalDetalhesTotalAberto, setModalDetalhesTotalAberto] = useState(false);
  const [tipoDetalhesTotal, setTipoDetalhesTotal] = useState(""); // "receber" ou "recebido"
  const [reservasPorDia, setReservasPorDia] = useState([]); // Array de { data, valor }
  const [transacoesConcluidas, setTransacoesConcluidas] = useState([]); // Array de transações concluídas

  // Estados para modal de solicitar repasse
  const [modalSolicitarRepasseAberto, setModalSolicitarRepasseAberto] = useState(false);
  const [valorRepasse, setValorRepasse] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [solicitandoRepasse, setSolicitandoRepasse] = useState(false);
  const [modalSucessoRepasseAberto, setModalSucessoRepasseAberto] = useState(false);

  async function carregarDados() {
    setLoading(true);
    setErro("");

    try {
      // Para visualização de teste, sempre usar valores mock
      const hoje = new Date();
      const mockPagamentos = [
        { id: 1, created_at: hoje.toISOString(), valor_total: 250.00, taxa_plataforma: 25.00, status: "paid" },
        { id: 2, created_at: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 180.00, taxa_plataforma: 18.00, status: "paid" },
        { id: 3, created_at: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 320.00, taxa_plataforma: 32.00, status: "paid" },
        { id: 4, created_at: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 200.00, taxa_plataforma: 20.00, status: "pending" },
        { id: 5, created_at: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 150.00, taxa_plataforma: 15.00, status: "pending" },
        { id: 6, created_at: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 280.00, taxa_plataforma: 28.00, status: "canceled" },
        { id: 7, created_at: new Date(hoje.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), valor_total: 220.00, taxa_plataforma: 22.00, status: "canceled" }
      ];
      
      // Sempre usar valores mock para visualização
      setOverviewTotal({
        kpis: {
          receita_bruta: 125000.00,
          taxa_plataforma: 12500.00,
          valor_liquido: 112500.00,
          qtd_pagamentos: 45
        },
        ultimos_pagamentos: mockPagamentos.filter(p => p.status === "paid")
      });
      setOverviewPendente({
        kpis: {
          receita_bruta: 15000.00,
          taxa_plataforma: 1500.00,
          valor_liquido: 13500.00,
          qtd_pagamentos: 8
        },
        ultimos_pagamentos: mockPagamentos.filter(p => p.status === "pending")
      });
      const pagamentosCancelados = mockPagamentos.filter(function(p) {
        return p.status === "canceled";
      });
      const overviewCanceladoData = {
        kpis: {
          receita_bruta: 5000.00,
          taxa_plataforma: 500.00,
          valor_liquido: 4500.00,
          qtd_pagamentos: 3
        },
        ultimos_pagamentos: pagamentosCancelados
      };
      setOverviewCancelado(overviewCanceladoData);
      
      // Dados mock de reservas por dia para "Total a Receber"
      // Valores ajustados para somar 15.000 (receita bruta) que após descontos dá 13.500 (líquido)
      const reservasPorDiaData = [
        { data: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000), valor: 1000.00 },
        { data: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000), valor: 3000.00 },
        { data: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000), valor: 2000.00 },
        { data: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000), valor: 2500.00 },
        { data: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000), valor: 3500.00 },
        { data: hoje, valor: 3000.00 }
      ];
      setReservasPorDia(reservasPorDiaData);
      
      // Dados mock de transações concluídas para "Total Recebido"
      // Valores ajustados para somar exatamente 112.500,00
      const transacoesConcluidasData = [
        { id: 1, data: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000), valor: 15000.00, descricao: "Reservas do mês anterior" },
        { id: 2, data: new Date(hoje.getTime() - 25 * 24 * 60 * 60 * 1000), valor: 12000.00, descricao: "Pacote de reservas semanais" },
        { id: 3, data: new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000), valor: 18000.00, descricao: "Evento corporativo" },
        { id: 4, data: new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000), valor: 22000.00, descricao: "Campeonato de futebol" },
        { id: 5, data: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000), valor: 25000.00, descricao: "Reservas mensais" },
        { id: 6, data: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000), valor: 18000.00, descricao: "Eventos diversos" },
        { id: 7, data: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000), valor: 2500.00, descricao: "Reservas finais de semana" }
      ];
      setTransacoesConcluidas(transacoesConcluidasData);
      
      // Histórico de repasses - sempre usar dados mock para visualização
      const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      const doisMesesAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
      const tresMesesAtras = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const repassesData = [
        {
          id: 1,
          valor_total_liquido: 12500.00,
          nome_titular: "Lorenzo Formenton",
          data_pagamento: hoje.toISOString().split('T')[0],
          status: "pago",
          created_at: hoje.toISOString()
        },
        {
          id: 2,
          valor_total_liquido: 9800.00,
          nome_titular: "Lorenzo Formenton",
          data_pagamento: umMesAtras.toISOString().split('T')[0],
          status: "pago",
          created_at: umMesAtras.toISOString()
        },
        {
          id: 3,
          valor_total_liquido: 15200.00,
          nome_titular: "Lorenzo Formenton",
          data_pagamento: doisMesesAtras.toISOString().split('T')[0],
          status: "pago",
          created_at: doisMesesAtras.toISOString()
        },
        {
          id: 4,
          valor_total_liquido: 7500.00,
          nome_titular: "Lorenzo Formenton",
          data_pagamento: null,
          status: "pendente",
          created_at: tresMesesAtras.toISOString()
        },
        {
          id: 5,
          valor_total_liquido: 11000.00,
          nome_titular: "Lorenzo Formenton",
          data_pagamento: null,
          status: "recusado",
          created_at: tresMesesAtras.toISOString()
        }
      ];
      
      // Sempre usar valores mock para configurações
      const nomeTitularMock = "Lorenzo Formenton";
      setNomeTitular(nomeTitularMock);
      setChavePix("lorenzo.formenton@email.com");
      
      // Adicionar nome do titular a cada repasse (se não tiver)
      const repassesComTitular = repassesData.map(function(repasse) {
        return {
          id: repasse.id,
          valor_total_liquido: repasse.valor_total_liquido,
          nome_titular: repasse.nome_titular || nomeTitularMock,
          data_pagamento: repasse.data_pagamento,
          status: repasse.status,
          created_at: repasse.created_at
        };
      });
      
      setRepasses(repassesComTitular);
    } catch (e) {
      console.error("[GESTOR/FINANCEIRO] erro ao carregar:", e);
      const errorMessage = (e && e.response && e.response.data && e.response.data.error) 
        ? e.response.data.error 
        : "Erro ao carregar financeiro. Verifique sua conexão e tente novamente.";
      setErro(errorMessage);
      setOverviewTotal(null);
      setOverviewPendente(null);
      setOverviewCancelado(null);
      setRepasses([]);
    } finally {
      setLoading(false);
    }
  }

  async function abrirDetalhesRepasse(repasse) {
    setRepasseSelecionado(repasse);
    setModalDetalhesAberto(true);
    setCarregandoDetalhes(true);

    try {
      const { data } = await api.get(`/gestor/repasses/${repasse.id}`);
      setDetalhesRepasse(data);
    } catch (e) {
      console.error("[GESTOR/FINANCEIRO] erro ao carregar detalhes:", e);
      setDetalhesRepasse(null);
    } finally {
      setCarregandoDetalhes(false);
    }
  }
  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirModalSolicitarRepasse() {
    setValorRepasse(totalAReceber.toString());
    setModalSolicitarRepasseAberto(true);
  }

  function formatarValor(valor) {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "");
    if (!apenasNumeros) return "";
    
    // Converte para número e divide por 100 para ter centavos
    const valorNumerico = Number(apenasNumeros) / 100;
    
    // Formata como moeda brasileira
    return valorNumerico.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function handleValorChange(e) {
    const valor = e.target.value;
    const apenasNumeros = valor.replace(/\D/g, "");
    if (!apenasNumeros) {
      setValorRepasse("");
      return;
    }
    
    const valorNumerico = Number(apenasNumeros) / 100;
    const valorMaximo = totalAReceber;
    
    if (valorNumerico > valorMaximo) {
      setValorRepasse(formatarValor(valorMaximo.toString()));
    } else {
      setValorRepasse(formatarValor(valor));
    }
  }

  function getValorNumerico(valorFormatado) {
    if (!valorFormatado) return 0;
    const apenasNumeros = valorFormatado.replace(/\D/g, "");
    return Number(apenasNumeros) / 100;
  }

  async function confirmarSolicitacaoRepasse() {
    const valor = getValorNumerico(valorRepasse);
    
    if (valor <= 0) {
      alert("Por favor, informe um valor válido.");
      return;
    }

    if (valor > totalAReceber) {
      alert(`O valor não pode ser maior que ${formatBRL(totalAReceber)}.`);
      return;
    }

    if (!chavePix) {
      alert("Por favor, configure a chave PIX nas configurações antes de solicitar um repasse.");
      return;
    }

    setSolicitandoRepasse(true);

    try {
      // TODO: Quando integrar com API real, usar:
      // await api.post("/gestor/repasses/solicitar", {
      //   valor: valor,
      //   chave_pix: chavePix
      // });
      
      // Simulação de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fechar modal de solicitação e abrir modal de sucesso
      setModalSolicitarRepasseAberto(false);
      setModalSucessoRepasseAberto(true);
      setValorRepasse("");
      // Recarregar dados para atualizar o total a receber
      carregarDados();
    } catch (e) {
      console.error("[GESTOR/FINANCEIRO] erro ao solicitar repasse:", e);
      alert("Erro ao solicitar repasse. Tente novamente.");
    } finally {
      setSolicitandoRepasse(false);
    }
  }

  // Calcula os valores
  const kpisTotal = overviewTotal?.kpis || {};
  const kpisPendente = overviewPendente?.kpis || {};
  const kpisCancelado = overviewCancelado?.kpis || {};

  const totalAReceber = kpisPendente?.valor_liquido || 0; // Quanto pode solicitar
  const totalRecebido = kpisTotal?.valor_liquido || 0; // Total já recebido (vendas pagas)
  const vendasProcessamento = kpisPendente?.receita_bruta || 0;
  const vendasCanceladas = kpisCancelado?.receita_bruta || 0;
  const taxaPlataforma = kpisTotal?.taxa_plataforma || 0; // Taxa da plataforma

  // Paginação do histórico de repasses
  const totalPaginas = Math.max(1, Math.ceil(repasses.length / itensPorPagina));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const repassesPaginados = repasses.slice(
    (paginaSegura - 1) * itensPorPagina,
    paginaSegura * itensPorPagina
  );

  return (
    <div style={{ backgroundColor: "#f4f3f3", minHeight: "100vh" }}>
      {/* Header - Fora do container */}
      <div style={{ padding: "24px", marginBottom: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Financeiro</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Gerencie suas finanças e acompanhe seus repasses</p>
      </div>

      <div className="page" style={{ padding: "30px", paddingTop: 0, borderRadius: "22px", backgroundColor: "#ffffff" }}>
      {erro && (
        <div style={{ 
          backgroundColor: "#fee2e2", 
          border: "1px solid #fca5a5", 
          color: "#991b1b", 
          padding: "16px 20px", 
          marginBottom: 24,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
          </svg>
          {erro}
        </div>
      )}

      {/* Seção: Resumo Financeiro */}
      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>Resumo Financeiro</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Total a Receber */}
          <div style={{ 
            padding: "28px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25)",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.95 }}>Total a Receber</div>
                <button
                  onClick={() => {
                    setTipoDetalhesTotal("receber");
                    setModalDetalhesTotalAberto(true);
                  }}
                  style={{ 
                    padding: "6px 12px",
                    borderRadius: 8, 
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
                {loading ? "..." : formatBRL(totalAReceber)}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Valor disponível para solicitar repasse</div>
            </div>
          </div>

          {/* Total Recebido */}
          <div style={{ 
            padding: "28px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.95 }}>Total Recebido</div>
                <button
                  onClick={() => {
                    setTipoDetalhesTotal("recebido");
                    setModalDetalhesTotalAberto(true);
                  }}
                  style={{ 
                    padding: "6px 12px",
                    borderRadius: 8, 
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
                {loading ? "..." : formatBRL(totalRecebido)}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Total já recebido em vendas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Ações Rápidas */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ 
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Solicitar Repasse</h3>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Solicite o repasse do valor disponível para sua conta</p>
            </div>
            <button
              onClick={abrirModalSolicitarRepasse}
              disabled={loading || totalAReceber <= 0}
              type="button"
              style={{
                padding: "12px 28px",
                backgroundColor: totalAReceber <= 0 ? "#d1d5db" : "#37648c",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: 15,
                fontWeight: 600,
                cursor: totalAReceber <= 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: totalAReceber <= 0 ? "none" : "0 4px 12px rgba(55, 100, 140, 0.25)"
              }}
              onMouseEnter={(e) => {
                if (totalAReceber > 0) {
                  e.target.style.backgroundColor = "#2d4f6f";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(55, 100, 140, 0.35)";
                }
              }}
              onMouseLeave={(e) => {
                if (totalAReceber > 0) {
                  e.target.style.backgroundColor = "#37648c";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(55, 100, 140, 0.25)";
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              Solicitar Repasse
            </button>
          </div>
        </div>
      </div>

      {/* Seção: Estatísticas de Vendas */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Estatísticas de Vendas</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Acompanhe o desempenho das suas vendas</p>
          </div>
          <button
            onClick={() => {
              setAbaAtiva("processamento");
              setModalDetalhesVendasAberto(true);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffffff",
              color: "#37648c",
              border: "1.5px solid #37648c",
              borderRadius: "8px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f7ff";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Ver Detalhes
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Vendas em Processamento */}
          <div style={{ 
            padding: "24px",
            backgroundColor: "#ffffff",
            borderLeft: "5px solid #f59e0b",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: "1px solid #fef3c7",
            borderLeft: "5px solid #f59e0b",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>Vendas em Processamento</div>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: "10px", 
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#f59e0b"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              {loading ? "..." : formatBRL(vendasProcessamento)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Aguardando confirmação de pagamento</div>
          </div>

          {/* Vendas Canceladas */}
          <div style={{ 
            padding: "24px",
            backgroundColor: "#ffffff",
            borderLeft: "5px solid #ef4444",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: "1px solid #fee2e2",
            borderLeft: "5px solid #ef4444",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>Vendas Canceladas</div>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: "10px", 
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#ef4444"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              {loading ? "..." : formatBRL(vendasCanceladas)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Reservas canceladas pelos clientes</div>
          </div>

          {/* Taxa da Plataforma */}
          <div style={{ 
            padding: "24px",
            backgroundColor: "#ffffff",
            borderLeft: "5px solid #6366f1",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e0e7ff",
            borderLeft: "5px solid #6366f1",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>Taxa da Plataforma</div>
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: "10px", 
                backgroundColor: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="#6366f1"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              {loading ? "..." : formatBRL(taxaPlataforma)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Taxa cobrada pela plataforma</div>
          </div>
        </div>
      </div>

      {/* Seção: Histórico de Transações */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ 
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Histórico de Transações</h3>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Acompanhe todos os repasses realizados</p>
            </div>
            <div style={{ 
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151"
            }}>
              {repasses.length} {repasses.length === 1 ? "transação" : "transações"}
            </div>
          </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Carregando...</div>
        ) : repasses.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
            Nenhum repasse encontrado.
          </div>
        ) : (
          <>
            {/* Tabela */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Total Repassado</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Nome do Titular</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Data Repassado</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {repassesPaginados.map((repasse) => {
                    const statusCls = statusRepasseClass(repasse.status);
                    const statusColor = {
                      concluido: "#10b981",
                      pendente: "#f59e0b",
                      recusado: "#ef4444"
                    }[statusCls] || "#6b7280";

                    return (
                      <tr key={repasse.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px", fontSize: 14, color: "#111827", fontWeight: 500 }}>
                          {formatBRL(repasse.valor_total_liquido || 0)}
                        </td>
                      <td style={{ padding: "12px", fontSize: 14, color: "#111827" }}>
                        {repasse.nome_titular || nomeTitular || "—"}
                      </td>
                      <td style={{ padding: "12px", fontSize: 14, color: "#111827" }}>
                        {repasse.data_pagamento ? formatDateBR(repasse.data_pagamento) : (repasse.created_at ? formatDateBR(repasse.created_at) : "—")}
                      </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 500,
                              backgroundColor: `${statusColor}15`,
                              color: statusColor
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: statusColor
                              }}
                            />
                            {statusRepasseLabel(repasse.status)}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => abrirDetalhesRepasse(repasse)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#37648c",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#2d4f6f";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#37648c";
                            }}
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura <= 1}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: paginaSegura <= 1 ? "#f3f4f6" : "#ffffff",
                    color: paginaSegura <= 1 ? "#9ca3af" : "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: paginaSegura <= 1 ? "not-allowed" : "pointer"
                  }}
                >
                  Anterior
                </button>

                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Página {paginaSegura} de {totalPaginas}
                </div>

                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura >= totalPaginas}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: paginaSegura >= totalPaginas ? "#f3f4f6" : "#ffffff",
                    color: paginaSegura >= totalPaginas ? "#9ca3af" : "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: paginaSegura >= totalPaginas ? "not-allowed" : "pointer"
                  }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Modal de Detalhes do Repasse */}
      {modalDetalhesAberto && (
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
          onClick={() => setModalDetalhesAberto(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Detalhes do Repasse</h2>
              <button
                onClick={() => setModalDetalhesAberto(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {carregandoDetalhes ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Carregando detalhes...</div>
            ) : detalhesRepasse ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Valor Total Repassado</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                    {formatBRL(detalhesRepasse.repasse?.valor_total_liquido || 0)}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Data do Repasse</div>
                  <div style={{ fontSize: 14, color: "#111827" }}>
                    {detalhesRepasse.repasse?.data_pagamento ? formatDateBR(detalhesRepasse.repasse.data_pagamento) : "—"}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Status</div>
                  <div style={{ fontSize: 14, color: "#111827" }}>
                    {detalhesRepasse.repasse?.status === "pago" ? "Pago" : detalhesRepasse.repasse?.status === "pendente" ? "Pendente" : detalhesRepasse.repasse?.status || "—"}
                  </div>
                </div>

                {detalhesRepasse.pagamentos && detalhesRepasse.pagamentos.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Agendamentos Incluídos</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Data</th>
                            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Valor</th>
                            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalhesRepasse.pagamentos.map((pagamento) => (
                            <tr key={pagamento.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "8px", color: "#111827" }}>
                                {formatDateBR(pagamento.created_at)}
                              </td>
                              <td style={{ padding: "8px", color: "#111827", fontWeight: 500 }}>
                                {formatBRL(pagamento.valor_total)}
                              </td>
                              <td style={{ padding: "8px" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "2px 8px",
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    backgroundColor: pagamento.status === "paid" ? "#10b98115" : "#f59e0b15",
                                    color: pagamento.status === "paid" ? "#10b981" : "#f59e0b"
                                  }}
                                >
                                  {statusLabel(pagamento.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                Erro ao carregar detalhes do repasse.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Detalhes de Vendas (Unificado) */}
      {modalDetalhesVendasAberto && (
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
          onClick={() => setModalDetalhesVendasAberto(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 800,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Detalhes de Vendas</h2>
              <button
                onClick={() => setModalDetalhesVendasAberto(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {/* Abas */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setAbaAtiva("processamento")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  color: abaAtiva === "processamento" ? "#37648c" : "#6b7280",
                  border: "none",
                  borderBottom: abaAtiva === "processamento" ? "2px solid #37648c" : "2px solid transparent",
                  fontSize: 14,
                  fontWeight: abaAtiva === "processamento" ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Processamento
              </button>
              <button
                onClick={() => setAbaAtiva("canceladas")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  color: abaAtiva === "canceladas" ? "#37648c" : "#6b7280",
                  border: "none",
                  borderBottom: abaAtiva === "canceladas" ? "2px solid #37648c" : "2px solid transparent",
                  fontSize: 14,
                  fontWeight: abaAtiva === "canceladas" ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Canceladas
              </button>
              <button
                onClick={() => setAbaAtiva("taxa")}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  color: abaAtiva === "taxa" ? "#37648c" : "#6b7280",
                  border: "none",
                  borderBottom: abaAtiva === "taxa" ? "2px solid #37648c" : "2px solid transparent",
                  fontSize: 14,
                  fontWeight: abaAtiva === "taxa" ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Taxa da Plataforma
              </button>
            </div>

            {/* Conteúdo da aba Processamento */}
            {abaAtiva === "processamento" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                    {formatBRL(vendasProcessamento)}
                  </div>
                </div>

                {overviewPendente?.ultimos_pagamentos && overviewPendente.ultimos_pagamentos.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Data</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Valor</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overviewPendente.ultimos_pagamentos.map((pagamento) => (
                          <tr key={pagamento.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "8px", color: "#111827" }}>
                              {formatDateBR(pagamento.created_at)}
                            </td>
                            <td style={{ padding: "8px", color: "#111827", fontWeight: 500 }}>
                              {formatBRL(pagamento.valor_total)}
                            </td>
                            <td style={{ padding: "8px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  backgroundColor: "#f59e0b15",
                                  color: "#f59e0b"
                                }}
                              >
                                Pendente
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                    Nenhuma venda em processamento encontrada.
                  </div>
                )}
              </>
            )}

            {/* Conteúdo da aba Canceladas */}
            {abaAtiva === "canceladas" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                    {formatBRL(vendasCanceladas)}
                  </div>
                </div>

                {overviewCancelado?.ultimos_pagamentos && overviewCancelado.ultimos_pagamentos.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Data</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Valor</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overviewCancelado.ultimos_pagamentos.map((pagamento) => (
                          <tr key={pagamento.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "8px", color: "#111827" }}>
                              {formatDateBR(pagamento.created_at)}
                            </td>
                            <td style={{ padding: "8px", color: "#111827", fontWeight: 500 }}>
                              {formatBRL(pagamento.valor_total)}
                            </td>
                            <td style={{ padding: "8px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  backgroundColor: "#ef444415",
                                  color: "#ef4444"
                                }}
                              >
                                Cancelado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                    Nenhuma venda cancelada encontrada.
                  </div>
                )}
              </>
            )}

            {/* Conteúdo da aba Taxa */}
            {abaAtiva === "taxa" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total de Taxas</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                    {formatBRL(taxaPlataforma)}
                  </div>
                </div>

                {overviewTotal?.ultimos_pagamentos && overviewTotal.ultimos_pagamentos.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Data</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Valor Total</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Taxa</th>
                          <th style={{ padding: "8px", textAlign: "left", fontWeight: 600, color: "#6b7280" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overviewTotal.ultimos_pagamentos.map((pagamento) => (
                          <tr key={pagamento.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "8px", color: "#111827" }}>
                              {formatDateBR(pagamento.created_at)}
                            </td>
                            <td style={{ padding: "8px", color: "#111827", fontWeight: 500 }}>
                              {formatBRL(pagamento.valor_total)}
                            </td>
                            <td style={{ padding: "8px", color: "#111827", fontWeight: 500 }}>
                              {formatBRL(pagamento.taxa_plataforma || 0)}
                            </td>
                            <td style={{ padding: "8px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  backgroundColor: pagamento.status === "paid" ? "#10b98115" : "#f59e0b15",
                                  color: pagamento.status === "paid" ? "#10b981" : "#f59e0b"
                                }}
                              >
                                {statusLabel(pagamento.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                    Nenhuma transação encontrada.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}


      {/* Modal Solicitar Repasse */}
      {modalSolicitarRepasseAberto && (
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
          onClick={() => !solicitandoRepasse && setModalSolicitarRepasseAberto(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 500,
              width: "100%",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Solicitar Repasse</h2>
              <button
                onClick={() => !solicitandoRepasse && setModalSolicitarRepasseAberto(false)}
                disabled={solicitandoRepasse}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  color: "#6b7280",
                  cursor: solicitandoRepasse ? "not-allowed" : "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: solicitandoRepasse ? 0.5 : 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Valor disponível */}
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Valor Disponível</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#37648c" }}>
                  {formatBRL(totalAReceber)}
                </div>
              </div>

              {/* Campo de valor */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#111827", marginBottom: 6 }}>
                  Valor do Repasse *
                </label>
                <input
                  type="text"
                  value={valorRepasse ? `R$ ${valorRepasse}` : ""}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  disabled={solicitandoRepasse}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "#111827",
                    backgroundColor: solicitandoRepasse ? "#f3f4f6" : "#ffffff"
                  }}
                />
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  Valor máximo: {formatBRL(totalAReceber)}
                </div>
              </div>

              {/* Confirmação da conta */}
              <div style={{ padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                  Conta para Recebimento
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                  <strong>Titular:</strong> {nomeTitular || "—"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  <strong>Chave PIX:</strong> {chavePix || "Não configurada"}
                </div>
                {!chavePix && (
                  <div style={{ fontSize: 11, color: "#ef4444", marginTop: 8 }}>
                    Configure a chave PIX nas configurações antes de solicitar um repasse.
                  </div>
                )}
              </div>

              {/* Botões */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => setModalSolicitarRepasseAberto(false)}
                  disabled={solicitandoRepasse}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: solicitandoRepasse ? "not-allowed" : "pointer",
                    opacity: solicitandoRepasse ? 0.5 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarSolicitacaoRepasse}
                  disabled={solicitandoRepasse || !valorRepasse || getValorNumerico(valorRepasse) <= 0 || !chavePix}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    backgroundColor: (solicitandoRepasse || !valorRepasse || getValorNumerico(valorRepasse) <= 0 || !chavePix) ? "#d1d5db" : "#37648c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: (solicitandoRepasse || !valorRepasse || getValorNumerico(valorRepasse) <= 0 || !chavePix) ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!solicitandoRepasse && valorRepasse && getValorNumerico(valorRepasse) > 0 && chavePix) {
                      e.target.style.backgroundColor = "#2d4f6f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!solicitandoRepasse && valorRepasse && getValorNumerico(valorRepasse) > 0 && chavePix) {
                      e.target.style.backgroundColor = "#37648c";
                    }
                  }}
                >
                  {solicitandoRepasse ? "Solicitando..." : "Confirmar Solicitação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso - Solicitação de Repasse */}
      {modalSucessoRepasseAberto && (
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
            zIndex: 1001,
            padding: 20,
          }}
          onClick={() => setModalSucessoRepasseAberto(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              Solicitação Enviada com Sucesso!
            </h3>
            
            <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
              Sua solicitação de repasse foi enviada e será aprovada em até <strong style={{ color: "#111827" }}>1 dia útil</strong>.
            </p>
            
            <button
              onClick={() => setModalSucessoRepasseAberto(false)}
              style={{
                padding: "12px 32px",
                backgroundColor: "#37648c",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                width: "100%",
                maxWidth: 200
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#2d4f6f";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#37648c";
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes - Total a Receber / Total Recebido */}
      {modalDetalhesTotalAberto && (
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
            padding: 20,
          }}
          onClick={() => setModalDetalhesTotalAberto(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 28,
              maxWidth: 700,
              width: "100%",
              maxHeight: "90vh",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                  {tipoDetalhesTotal === "receber" ? "Detalhes - Total a Receber" : "Detalhes - Total Recebido"}
                </h3>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  {tipoDetalhesTotal === "receber" 
                    ? "Valores disponíveis para solicitar repasse"
                    : "Histórico de valores já recebidos"}
                </p>
              </div>
              <button
                onClick={() => setModalDetalhesTotalAberto(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {tipoDetalhesTotal === "receber" ? (
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    Reservas por Dia
                  </h4>
                  
                  {/* Lista de reservas por dia */}
                  <div style={{ marginBottom: 24 }}>
                    {reservasPorDia.length > 0 ? (
                      <div style={{ 
                        backgroundColor: "#f9fafb", 
                        borderRadius: 12, 
                        border: "1px solid #e5e7eb",
                        overflow: "hidden"
                      }}>
                        {reservasPorDia.map((reserva, index) => (
                          <div 
                            key={index}
                            style={{
                              padding: "16px 20px",
                              borderBottom: index < reservasPorDia.length - 1 ? "1px solid #e5e7eb" : "none",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                                {formatDateBR(reserva.data.toISOString())}
                              </div>
                              <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>
                                Reservas do dia
                              </div>
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>
                              {formatBRL(reserva.valor)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                        Nenhuma reserva encontrada
                      </div>
                    )}
                  </div>

                  {/* Resumo e descontos */}
                  {overviewPendente && overviewPendente.kpis && (
                    <div style={{ 
                      padding: 20, 
                      backgroundColor: "#f0f9ff", 
                      borderRadius: 12, 
                      border: "1px solid #bae6fd"
                    }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                        Resumo e Descontos
                      </h4>
                      
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 14, color: "#111827" }}>Receita Bruta Total</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
                            {formatBRL(overviewPendente.kpis.receita_bruta)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                          Soma de todas as reservas dos dias acima
                        </div>
                      </div>

                      <div style={{ 
                        padding: "12px 16px", 
                        backgroundColor: "#fee2e2", 
                        borderRadius: 8, 
                        marginBottom: 12,
                        border: "1px solid #fca5a5"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ fontSize: 14, color: "#991b1b", fontWeight: 500 }}>Taxa da Plataforma</div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#991b1b" }}>
                            - {formatBRL(overviewPendente.kpis.taxa_plataforma)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#991b1b", opacity: 0.8 }}>
                          Desconto aplicado sobre a receita bruta
                        </div>
                      </div>

                      {overviewCancelado && overviewCancelado.kpis && overviewCancelado.kpis.receita_bruta > 0 && (
                        <div style={{ 
                          padding: "12px 16px", 
                          backgroundColor: "#fef3c7", 
                          borderRadius: 8, 
                          marginBottom: 12,
                          border: "1px solid #fcd34d"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <div style={{ fontSize: 14, color: "#92400e", fontWeight: 500 }}>Cancelamentos</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#92400e" }}>
                              - {formatBRL(overviewCancelado.kpis.receita_bruta)}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: "#92400e", opacity: 0.8 }}>
                            Valor das reservas canceladas
                          </div>
                        </div>
                      )}

                      <div style={{ 
                        paddingTop: 16, 
                        borderTop: "2px solid #bae6fd",
                        marginTop: 12
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#0369a1" }}>Valor Líquido Disponível</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: "#059669" }}>
                            {formatBRL(overviewPendente.kpis.valor_liquido)}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                          Este é o valor que você pode solicitar para repasse
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    Histórico de Transações Concluídas
                  </h4>
                  
                  {/* Lista de transações concluídas */}
                  <div style={{ marginBottom: 24 }}>
                    {transacoesConcluidas.length > 0 ? (
                      <div style={{ 
                        backgroundColor: "#f9fafb", 
                        borderRadius: 12, 
                        border: "1px solid #e5e7eb",
                        overflow: "hidden"
                      }}>
                        {transacoesConcluidas.map((transacao, index) => (
                          <div 
                            key={transacao.id}
                            style={{
                              padding: "16px 20px",
                              borderBottom: index < transacoesConcluidas.length - 1 ? "1px solid #e5e7eb" : "none",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                                {formatDateBR(transacao.data.toISOString())}
                              </div>
                              <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>
                                {transacao.descricao}
                              </div>
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>
                              {formatBRL(transacao.valor)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                        Nenhuma transação encontrada
                      </div>
                    )}
                  </div>

                  {/* Resumo */}
                  <div style={{ 
                    padding: 20, 
                    backgroundColor: "#f0fdf4", 
                    borderRadius: 12, 
                    border: "1px solid #86efac"
                  }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                      Resumo
                    </h4>
                    
                    <div style={{ 
                      paddingTop: 16, 
                      borderTop: "2px solid #86efac",
                      marginTop: 12
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>Valor Total Recebido</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: "#059669" }}>
                          {formatBRL(totalRecebido)}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        Total já recebido em todas as transações concluídas
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 24, borderTop: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setModalDetalhesTotalAberto(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#37648c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2d4f6f";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#37648c";
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
