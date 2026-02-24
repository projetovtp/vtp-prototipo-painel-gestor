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

  // Estados para modal de solicitar repasse
  const [modalSolicitarRepasseAberto, setModalSolicitarRepasseAberto] = useState(false);
  const [valorRepasse, setValorRepasse] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [solicitandoRepasse, setSolicitandoRepasse] = useState(false);

  async function carregarDados() {
    setLoading(true);
    setErro("");

    try {
      // Carrega dados de todos os status (sem filtro de data para pegar tudo)
      const [resTotal, resPendente, resCancelado, resRepasses, resConfig] = await Promise.all([
        api.get("/gestor/financeiro-overview"),
        api.get("/gestor/financeiro-overview", {
          params: { status: "pending" },
        }),
        api.get("/gestor/financeiro-overview", {
          params: { status: "canceled" },
        }),
        api.get("/gestor/financeiro/repasses").catch(() => ({ data: { itens: [] } })),
        api.get("/gestor/configuracoes").catch(() => ({ data: {} }))
      ]);

      setOverviewTotal(resTotal?.data || null);
      setOverviewPendente(resPendente?.data || null);
      setOverviewCancelado(resCancelado?.data || null);

      // Histórico de repasses
      const repassesData = resRepasses?.data?.itens || resRepasses?.data?.repasses || [];
      
      // Buscar nome do titular e chave PIX das configurações
      const configData = resConfig?.data || {};
      const nomeTitularConfig = configData.nomeTitular || configData.dadosFinanceiros?.nomeTitular || "Lorenzo Formenton";
      const chavePixConfig = configData.chavePix || configData.dadosFinanceiros?.chavePix || "";
      setNomeTitular(nomeTitularConfig);
      setChavePix(chavePixConfig);
      
      // Adicionar nome do titular a cada repasse (se não tiver)
      const repassesComTitular = repassesData.map((repasse) => ({
        ...repasse,
        nome_titular: repasse.nome_titular || nomeTitularConfig
      }));
      
      setRepasses(repassesComTitular);
    } catch (e) {
      console.error("[GESTOR/FINANCEIRO] erro ao carregar:", e);
      setErro(
        e?.response?.data?.error ||
          "Erro ao carregar financeiro. Verifique sua conexão e tente novamente."
      );
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
      
      alert(`Solicitação de repasse de ${formatBRL(valor)} enviada com sucesso!`);
      setModalSolicitarRepasseAberto(false);
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
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Financeiro</h1>
      </div>

      {erro && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {/* Total a Receber, Total Recebido e Botão de Solicitar Repasse */}
      <div className="card" style={{ marginTop: 0, marginBottom: 24, padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total a Receber</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#37648c" }}>
              {loading ? "..." : formatBRL(totalAReceber)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total Recebido</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#37648c" }}>
              {loading ? "..." : formatBRL(totalRecebido)}
            </div>
          </div>
        </div>

        <button
          onClick={abrirModalSolicitarRepasse}
          disabled={loading || totalAReceber <= 0}
          type="button"
          style={{
            width: "100%",
            padding: "12px 24px",
            backgroundColor: totalAReceber <= 0 ? "#d1d5db" : "#37648c",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: totalAReceber <= 0 ? "not-allowed" : "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => {
            if (totalAReceber > 0) {
              e.target.style.backgroundColor = "#2d4f6f";
            }
          }}
          onMouseLeave={(e) => {
            if (totalAReceber > 0) {
              e.target.style.backgroundColor = "#37648c";
            }
          }}
        >
          Solicitar Repasse
        </button>
      </div>

      {/* Estatísticas de Vendas */}
      <div className="card" style={{ marginTop: 0, marginBottom: 24, padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Vendas em Processamento</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
              {loading ? "..." : formatBRL(vendasProcessamento)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Vendas Canceladas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
              {loading ? "..." : formatBRL(vendasCanceladas)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Taxa da Plataforma</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#37648c" }}>
              {loading ? "..." : formatBRL(taxaPlataforma)}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setAbaAtiva("processamento");
            setModalDetalhesVendasAberto(true);
          }}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "#37648c",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
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
      </div>

      {/* Histórico de Repasses */}
      <div className="card" style={{ marginTop: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Histórico de Transações</h3>

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
    </div>
  );
}
