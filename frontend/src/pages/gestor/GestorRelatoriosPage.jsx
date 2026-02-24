import React, { useState, useEffect, useRef } from "react";

// Função para gerar PDF (simulação - em produção usar biblioteca como jsPDF)
function exportarParaPDF(periodo, dataInicio, dataFim, dadosRelatorio) {
  // Simulação de exportação
  alert(`Exportando relatório para PDF...\nPeríodo: ${periodo}\nDe: ${dataInicio || "N/A"} até ${dataFim || "N/A"}`);
  // Em produção, usar biblioteca como jsPDF ou html2pdf
}

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

export default function GestorRelatoriosPage() {
  const hoje = new Date();
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(hoje.getMonth());
  const [anoCalendario, setAnoCalendario] = useState(hoje.getFullYear());
  const calendarioRef = useRef(null);

  function formatarDataParaInput(ano, mes, dia) {
    const mesFormatado = String(mes + 1).padStart(2, "0");
    const diaFormatado = String(dia).padStart(2, "0");
    return `${ano}-${mesFormatado}-${diaFormatado}`;
  }

  // Atualizar datas quando período muda
  useEffect(() => {
    const hojeObj = new Date();
    hojeObj.setHours(0, 0, 0, 0);
    
    switch (periodo) {
      case "hoje":
        const hojeStr = formatarDataParaInput(hojeObj.getFullYear(), hojeObj.getMonth(), hojeObj.getDate());
        setDataInicio(hojeStr);
        setDataFim(hojeStr);
        setMostrarCalendario(false);
        break;
      case "semana":
        const inicioSemana = new Date(hojeObj);
        inicioSemana.setDate(hojeObj.getDate() - hojeObj.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        setDataInicio(formatarDataParaInput(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate()));
        setDataFim(formatarDataParaInput(fimSemana.getFullYear(), fimSemana.getMonth(), fimSemana.getDate()));
        setMostrarCalendario(false);
        break;
      case "mes":
        const inicioMes = new Date(hojeObj.getFullYear(), hojeObj.getMonth(), 1);
        const fimMes = new Date(hojeObj.getFullYear(), hojeObj.getMonth() + 1, 0);
        setDataInicio(formatarDataParaInput(inicioMes.getFullYear(), inicioMes.getMonth(), inicioMes.getDate()));
        setDataFim(formatarDataParaInput(fimMes.getFullYear(), fimMes.getMonth(), fimMes.getDate()));
        setMostrarCalendario(false);
        break;
      case "custom":
        setMostrarCalendario(true);
        break;
      default:
        break;
    }
  }, [periodo]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target)) {
        setMostrarCalendario(false);
      }
    }

    if (mostrarCalendario) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarCalendario]);

  // Funções do calendário
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function getDiasDoMes(mes, ano) {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias = [];
    
    // Adiciona dias vazios do início
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null);
    }
    
    // Adiciona os dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia);
    }
    
    return dias;
  }

  function handleClicarDia(dia) {
    const data = formatarDataParaInput(anoCalendario, mesCalendario, dia);
    const dataObj = new Date(data);
    
    if (!dataInicio || (dataInicio && dataFim)) {
      // Nova seleção - define início
      setDataInicio(data);
      setDataFim("");
    } else {
      // Define fim ou troca se necessário
      const inicioObj = new Date(dataInicio);
      if (dataObj >= inicioObj) {
        setDataFim(data);
      } else {
        // Se a data selecionada for menor que início, troca
        setDataFim(dataInicio);
        setDataInicio(data);
      }
    }
  }

  function handleSelecionarMes() {
    const primeiroDia = formatarDataParaInput(anoCalendario, mesCalendario, 1);
    const ultimoDia = formatarDataParaInput(anoCalendario, mesCalendario, new Date(anoCalendario, mesCalendario + 1, 0).getDate());
    setDataInicio(primeiroDia);
    setDataFim(ultimoDia);
    setPeriodo("custom");
  }

  function avancarMes() {
    if (mesCalendario === 11) {
      setMesCalendario(0);
      setAnoCalendario(anoCalendario + 1);
    } else {
      setMesCalendario(mesCalendario + 1);
    }
  }

  function retrocederMes() {
    if (mesCalendario === 0) {
      setMesCalendario(11);
      setAnoCalendario(anoCalendario - 1);
    } else {
      setMesCalendario(mesCalendario - 1);
    }
  }

  function isDiaSelecionado(dia) {
    if (!dia) return false;
    const data = formatarDataParaInput(anoCalendario, mesCalendario, dia);
    return data === dataInicio || data === dataFim;
  }

  function isDiaNoIntervalo(dia) {
    if (!dia || !dataInicio || !dataFim) return false;
    const data = formatarDataParaInput(anoCalendario, mesCalendario, dia);
    const dataObj = new Date(data);
    const inicioObj = new Date(dataInicio);
    const fimObj = new Date(dataFim);
    return dataObj >= inicioObj && dataObj <= fimObj;
  }

  // Mock de dados para ilustração - ajustados por período
  const dadosRelatorio = {
    totalReservas: periodo === "hoje" ? 8 : periodo === "semana" ? 45 : periodo === "mes" ? 145 : 200,
    totalReceita: periodo === "hoje" ? 1200.00 : periodo === "semana" ? 6750.00 : periodo === "mes" ? 21750.00 : 30000.00,
    reservasCanceladas: periodo === "hoje" ? 1 : periodo === "semana" ? 3 : periodo === "mes" ? 8 : 12,
    taxaOcupacao: periodo === "hoje" ? 45 : periodo === "semana" ? 58 : periodo === "mes" ? 68 : 72,
    reservasPorDia: periodo === "hoje" ? [] : [
      { dia: "Seg", reservas: 12 },
      { dia: "Ter", reservas: 15 },
      { dia: "Qua", reservas: 18 },
      { dia: "Qui", reservas: 20 },
      { dia: "Sex", reservas: 25 },
      { dia: "Sáb", reservas: 30 },
      { dia: "Dom", reservas: 25 }
    ],
    reservasPorHora: periodo === "hoje" ? [
      { hora: "08:00", reservas: 2 },
      { hora: "10:00", reservas: 1 },
      { hora: "14:00", reservas: 3 },
      { hora: "16:00", reservas: 2 },
      { hora: "18:00", reservas: 0 },
      { hora: "20:00", reservas: 0 }
    ] : [],
    reservasRecentes: periodo === "hoje" ? [
      { hora: "08:00", cliente: "João Silva", quadra: "Quadra 1", valor: 150.00 },
      { hora: "10:00", cliente: "Maria Santos", quadra: "Quadra 2", valor: 150.00 },
      { hora: "14:00", cliente: "Pedro Costa", quadra: "Quadra 1", valor: 150.00 },
      { hora: "14:00", cliente: "Ana Lima", quadra: "Quadra 3", valor: 150.00 },
      { hora: "16:00", cliente: "Carlos Souza", quadra: "Quadra 2", valor: 150.00 },
      { hora: "16:00", cliente: "Julia Oliveira", quadra: "Quadra 4", valor: 150.00 }
    ] : [],
    topQuadras: [
      { nome: "Quadra 1", reservas: periodo === "hoje" ? 3 : periodo === "semana" ? 12 : 45, receita: periodo === "hoje" ? 450.00 : periodo === "semana" ? 1800.00 : 6750.00 },
      { nome: "Quadra 2", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 10 : 38, receita: periodo === "hoje" ? 300.00 : periodo === "semana" ? 1500.00 : 5700.00 },
      { nome: "Quadra 3", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 9 : 35, receita: periodo === "hoje" ? 300.00 : periodo === "semana" ? 1350.00 : 5250.00 },
      { nome: "Quadra 4", reservas: periodo === "hoje" ? 1 : periodo === "semana" ? 5 : 27, receita: periodo === "hoje" ? 150.00 : periodo === "semana" ? 750.00 : 4050.00 }
    ]
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Relatórios</h1>
        
        {/* Filtros - Canto superior direito */}
        <div ref={calendarioRef} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, position: "relative" }}>
          {/* Botões de período rápido */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setPeriodo("hoje")}
              style={{
                padding: "6px 14px",
                border: periodo === "hoje" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: periodo === "hoje" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "hoje" ? "#37648c" : "#fff",
                color: periodo === "hoje" ? "#fff" : "#111827",
                transition: "all 0.2s"
              }}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriodo("semana")}
              style={{
                padding: "6px 14px",
                border: periodo === "semana" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: periodo === "semana" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "semana" ? "#37648c" : "#fff",
                color: periodo === "semana" ? "#fff" : "#111827",
                transition: "all 0.2s"
              }}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodo("mes")}
              style={{
                padding: "6px 14px",
                border: periodo === "mes" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: periodo === "mes" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "mes" ? "#37648c" : "#fff",
                color: periodo === "mes" ? "#fff" : "#111827",
                transition: "all 0.2s"
              }}
            >
              Este Mês
            </button>
            <button
              onClick={() => {
                setPeriodo("custom");
                setMostrarCalendario(true);
              }}
              style={{
                padding: "6px 14px",
                border: periodo === "custom" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: periodo === "custom" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "custom" ? "#37648c" : "#fff",
                color: periodo === "custom" ? "#fff" : "#111827",
                transition: "all 0.2s"
              }}
            >
              Personalizado
            </button>
          </div>

          {/* Exibição das datas selecionadas */}
          {(dataInicio || dataFim) && (
            <div style={{ 
              fontSize: 12, 
              color: "#6b7280",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              <span>
                {dataInicio && formatDateBR(dataInicio)}
                {dataInicio && dataFim && dataInicio !== dataFim && " até "}
                {dataFim && dataInicio !== dataFim && formatDateBR(dataFim)}
              </span>
            </div>
          )}

          {/* Calendário */}
          {periodo === "custom" && mostrarCalendario && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e5e7eb",
                padding: 20,
                zIndex: 1000,
                minWidth: 320,
                animation: "fadeIn 0.2s ease-in"
              }}
            >
              {/* Cabeçalho do calendário */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button
                  onClick={retrocederMes}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: 18,
                    color: "#6b7280"
                  }}
                >
                  ‹
                </button>
                <div
                  onClick={handleSelecionarMes}
                  style={{
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    backgroundColor: "#f9fafb",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                >
                  {meses[mesCalendario]} {anoCalendario}
                </div>
                <button
                  onClick={avancarMes}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: 18,
                    color: "#6b7280"
                  }}
                >
                  ›
                </button>
              </div>

              {/* Dias da semana */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                {diasSemana.map((dia) => (
                  <div
                    key={dia}
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b7280",
                      padding: "8px 4px"
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {getDiasDoMes(mesCalendario, anoCalendario).map((dia, index) => {
                  if (dia === null) {
                    return <div key={index} style={{ padding: "8px" }}></div>;
                  }

                  const estaSelecionado = isDiaSelecionado(dia);
                  const estaNoIntervalo = isDiaNoIntervalo(dia);
                  const eInicio = formatarDataParaInput(anoCalendario, mesCalendario, dia) === dataInicio;
                  const eFim = formatarDataParaInput(anoCalendario, mesCalendario, dia) === dataFim;

                  return (
                    <button
                      key={index}
                      onClick={() => handleClicarDia(dia)}
                      style={{
                        padding: "8px",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: "pointer",
                        backgroundColor: estaSelecionado
                          ? "#37648c"
                          : estaNoIntervalo
                          ? "#e0e7ff"
                          : "transparent",
                        color: estaSelecionado ? "#fff" : "#111827",
                        fontWeight: estaSelecionado ? 600 : 400,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!estaSelecionado && !estaNoIntervalo) {
                          e.target.style.backgroundColor = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!estaSelecionado && !estaNoIntervalo) {
                          e.target.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    setDataInicio("");
                    setDataFim("");
                  }}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    color: "#111827"
                  }}
                >
                  Limpar
                </button>
                <button
                  onClick={() => setMostrarCalendario(false)}
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: "pointer",
                    backgroundColor: "#37648c",
                    color: "#fff",
                    fontWeight: 600
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header com título e botão exportar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            {periodo === "hoje" ? "Relatório do Dia" : periodo === "semana" ? "Relatório Semanal" : periodo === "mes" ? "Relatório Mensal" : "Relatório Personalizado"}
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            {dataInicio && dataFim ? `${formatDateBR(dataInicio)}${dataInicio !== dataFim ? ` - ${formatDateBR(dataFim)}` : ""}` : "Período selecionado"}
          </p>
        </div>
        <button
          onClick={() => exportarParaPDF(periodo, dataInicio, dataFim, dadosRelatorio)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#dc2626";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#ef4444";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.2)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Cards de resumo - Hierarquia principal melhorada */}
      <div style={{ display: "grid", gridTemplateColumns: periodo === "hoje" ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ 
          marginTop: 0, 
          padding: "28px",
          background: periodo === "hoje" ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #37648c 0%, #2d4f6f 100%)",
          color: "#fff",
          gridColumn: periodo === "hoje" ? "span 2" : "span 1",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(55, 100, 140, 0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: 14, opacity: 0.95, fontWeight: 500 }}>Total de Reservas</div>
            </div>
            <div style={{ fontSize: periodo === "hoje" ? 56 : 42, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
              {dadosRelatorio.totalReservas}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
              {periodo === "hoje" ? "reservas confirmadas" : "reservas no período"}
            </div>
          </div>
        </div>
        
        <div className="card" style={{ 
          marginTop: 0, 
          padding: "28px",
          background: periodo === "hoje" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#fff",
          color: periodo === "hoje" ? "#fff" : "#111827",
          border: periodo === "hoje" ? "none" : "1px solid #e5e7eb",
          borderRadius: 16,
          boxShadow: periodo === "hoje" ? "0 8px 24px rgba(16, 185, 129, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.06)",
          position: periodo === "hoje" ? "relative" : "static",
          overflow: periodo === "hoje" ? "hidden" : "visible"
        }}>
          {periodo === "hoje" && (
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
          )}
          <div style={{ position: periodo === "hoje" ? "relative" : "static", zIndex: periodo === "hoje" ? 1 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: periodo === "hoje" ? 0.9 : 0.6, color: periodo === "hoje" ? "#fff" : "#6b7280" }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
              </svg>
              <div style={{ fontSize: 14, color: periodo === "hoje" ? "rgba(255,255,255,0.95)" : "#6b7280", fontWeight: 500 }}>Total Receita</div>
            </div>
            <div style={{ fontSize: periodo === "hoje" ? 56 : 42, fontWeight: 800, lineHeight: 1.1, color: periodo === "hoje" ? "#fff" : "#37648c", letterSpacing: "-1px" }}>
              {formatBRL(dadosRelatorio.totalReceita)}
            </div>
            <div style={{ fontSize: 12, color: periodo === "hoje" ? "rgba(255,255,255,0.8)" : "#9ca3af", marginTop: 8 }}>
              {periodo === "hoje" ? "receita do dia" : "receita total"}
            </div>
          </div>
        </div>

        {periodo !== "hoje" && (
          <>
            <div className="card" style={{ 
              marginTop: 0, 
              padding: "28px", 
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6, color: "#ef4444" }}>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Reservas Canceladas</div>
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#ef4444", lineHeight: 1.1, letterSpacing: "-1px" }}>
                {dadosRelatorio.reservasCanceladas}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                cancelamentos
              </div>
            </div>
            <div className="card" style={{ 
              marginTop: 0, 
              padding: "28px", 
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6, color: "#37648c" }}>
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Taxa de Ocupação</div>
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#37648c", lineHeight: 1.1, letterSpacing: "-1px" }}>
                {dadosRelatorio.taxaOcupacao}%
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                ocupação média
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conteúdo específico por período */}
      {periodo === "hoje" ? (
        <>
          {/* Reservas por hora - Apenas para hoje */}
          <div className="card" style={{ 
            marginTop: 0, 
            marginBottom: 24, 
            padding: "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#f0f9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                Reservas por Horário
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {dadosRelatorio.reservasPorHora.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    backgroundColor: item.reservas > 0 ? "#f0f9ff" : "#f9fafb",
                    borderRadius: 12,
                    border: item.reservas > 0 ? "2px solid #37648c" : "1px solid #e5e7eb",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (item.reservas > 0) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(55, 100, 140, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, fontWeight: 600 }}>{item.hora}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: item.reservas > 0 ? "#37648c" : "#9ca3af", lineHeight: 1.2 }}>{item.reservas}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>reservas</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reservas recentes - Apenas para hoje */}
          <div className="card" style={{ 
            marginTop: 0, 
            marginBottom: 24, 
            padding: "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#059669" }}>
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Reservas de Hoje
                </h3>
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                {dadosRelatorio.reservasRecentes.length} {dadosRelatorio.reservasRecentes.length === 1 ? "reserva" : "reservas"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dadosRelatorio.reservasRecentes.map((reserva, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px",
                    backgroundColor: "#f9fafb",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #37648c 0%, #2d4f6f 100%)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(55, 100, 140, 0.3)"
                    }}>
                      {reserva.hora}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                        {reserva.cliente}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21h18M5 21V7l8-4v14M19 21V11l-6-4M9 9v0M9 15v0M15 11v0M15 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {reserva.quadra}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: "#059669",
                    padding: "8px 16px",
                    backgroundColor: "#f0fdf4",
                    borderRadius: 8
                  }}>
                    {formatBRL(reserva.valor)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gráfico de reservas por dia - Para semana e mês */}
          {periodo === "semana" || periodo === "mes" ? (
            <div className="card" style={{ 
              marginTop: 0, 
              marginBottom: 24, 
              padding: "28px",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#f0f9ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Reservas por Dia da Semana
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 240, padding: "0 8px" }}>
                {dadosRelatorio.reservasPorDia.map((item, index) => {
                  const maxReservas = Math.max(...dadosRelatorio.reservasPorDia.map(d => d.reservas));
                  const altura = (item.reservas / maxReservas) * 100;
                  const isMax = item.reservas === maxReservas;
                  return (
                    <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${altura}%`,
                          background: isMax ? "linear-gradient(180deg, #37648c 0%, #2d4f6f 100%)" : "linear-gradient(180deg, #60a5fa 0%, #37648c 100%)",
                          borderRadius: "12px 12px 0 0",
                          minHeight: 40,
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          paddingBottom: 8,
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 700,
                          transition: "all 0.3s",
                          cursor: "pointer",
                          boxShadow: isMax ? "0 4px 12px rgba(55, 100, 140, 0.3)" : "0 2px 8px rgba(55, 100, 140, 0.2)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scaleY(1.08) translateY(-4px)";
                          e.target.style.boxShadow = "0 8px 16px rgba(55, 100, 140, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scaleY(1) translateY(0)";
                          e.target.style.boxShadow = isMax ? "0 4px 12px rgba(55, 100, 140, 0.3)" : "0 2px 8px rgba(55, 100, 140, 0.2)";
                        }}
                      >
                        {item.reservas}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                        {item.dia}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Top quadras - Para todos exceto hoje */}
          <div className="card" style={{ 
            marginTop: 0, 
            padding: "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#f59e0b" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                Quadras Mais Utilizadas
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
              {dadosRelatorio.topQuadras.map((quadra, index) => {
                const medalColors = [
                  { bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", border: "#f59e0b" },
                  { bg: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)", border: "#64748b" },
                  { bg: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", border: "#b45309" },
                  { bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", border: "#4b5563" }
                ];
                return (
                  <div
                    key={index}
                    style={{
                      padding: "24px",
                      background: index < 3 ? medalColors[index].bg : "#fff",
                      color: index < 3 ? "#fff" : "#111827",
                      borderRadius: 16,
                      border: index < 3 ? "none" : "1px solid #e5e7eb",
                      transition: "all 0.3s",
                      boxShadow: index < 3 ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                      e.currentTarget.style.boxShadow = index < 3 ? "0 12px 32px rgba(0, 0, 0, 0.2)" : "0 8px 16px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = index < 3 ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    {index < 3 && (
                      <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
                    )}
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, opacity: index < 3 ? 1 : 0.95 }}>
                            {quadra.nome}
                          </div>
                          <div style={{ fontSize: 13, opacity: index < 3 ? 0.9 : 0.7, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {quadra.reservas} {quadra.reservas === 1 ? "reserva" : "reservas"}
                          </div>
                        </div>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: index < 3 ? "rgba(255, 255, 255, 0.25)" : "#37648c",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          fontWeight: 800,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                        }}>
                          {index + 1}
                        </div>
                      </div>
                      <div style={{ 
                        paddingTop: 16, 
                        borderTop: index < 3 ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e5e7eb",
                        marginTop: 16
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: index < 3 ? "#fff" : "#059669", lineHeight: 1.2 }}>
                          {formatBRL(quadra.receita)}
                        </div>
                        <div style={{ fontSize: 12, opacity: index < 3 ? 0.8 : 0.6, marginTop: 6 }}>
                          Receita total
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
