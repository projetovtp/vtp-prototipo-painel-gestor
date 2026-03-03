import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDevice } from "../../hooks/useDevice";

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
  const { isMobile, isTablet } = useDevice();
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

  // Obter mês e ano atual para o calendário
  const mesAtual = periodo === "mes" ? hoje.getMonth() : mesCalendario;
  const anoAtual = periodo === "mes" ? hoje.getFullYear() : anoCalendario;

  // Gerar dados mock de reservas por dia do mês (memoizado para não mudar a cada renderização)
  const reservasPorDiaDoMes = useMemo(() => {
    if (periodo !== "mes") return {};
    
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const reservasPorDia = {};
    
    // Usar uma seed baseada no mês/ano para gerar dados consistentes
    const seed = anoAtual * 12 + mesAtual;
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = formatarDataParaInput(anoAtual, mesAtual, dia);
      // Gerar número pseudo-aleatório baseado na seed e no dia
      const pseudoRandom = ((seed * 31 + dia) * 17) % 9;
      reservasPorDia[data] = pseudoRandom;
    }
    
    return reservasPorDia;
  }, [periodo, anoAtual, mesAtual]);

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
    reservasPorHora: periodo === "hoje" ? (() => {
      const horarios = [];
      const hojeObj = new Date();
      const seed = hojeObj.getFullYear() * 365 + hojeObj.getMonth() * 30 + hojeObj.getDate();
      
      for (let h = 8; h <= 22; h++) {
        const horaFormatada = String(h).padStart(2, "0") + ":00";
        // Gerar número pseudo-aleatório baseado na seed e no horário para manter consistência
        const pseudoRandom = ((seed * 31 + h) * 17) % 6;
        horarios.push({ hora: horaFormatada, reservas: pseudoRandom });
      }
      return horarios;
    })() : [],
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
      <div style={{ 
        display: "flex", 
        flexDirection: (isMobile || isTablet) ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: (isMobile || isTablet) ? "flex-start" : "flex-start", 
        gap: (isMobile || isTablet) ? 16 : 0,
        marginBottom: 24, 
        position: "relative" 
      }}>
        <h1 style={{ fontSize: (isMobile || isTablet) ? 20 : 24, fontWeight: 700, color: "#111827" }}>Relatórios</h1>
        
        {/* Filtros - Canto superior direito */}
        <div ref={calendarioRef} style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: (isMobile || isTablet) ? "flex-start" : "flex-end", 
          gap: 12, 
          position: "relative",
          width: (isMobile || isTablet) ? "100%" : "auto"
        }}>
          {/* Botões de período rápido */}
          <div style={{ 
            display: "flex", 
            gap: 8, 
            flexWrap: "wrap",
            width: (isMobile || isTablet) ? "100%" : "auto"
          }}>
            <button
              onClick={() => setPeriodo("hoje")}
              style={{
                padding: (isMobile || isTablet) ? "8px 12px" : "6px 14px",
                border: periodo === "hoje" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: (isMobile || isTablet) ? 12 : 13,
                fontWeight: periodo === "hoje" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "hoje" ? "#37648c" : "#fff",
                color: periodo === "hoje" ? "#fff" : "#111827",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriodo("semana")}
              style={{
                padding: (isMobile || isTablet) ? "8px 12px" : "6px 14px",
                border: periodo === "semana" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: (isMobile || isTablet) ? 12 : 13,
                fontWeight: periodo === "semana" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "semana" ? "#37648c" : "#fff",
                color: periodo === "semana" ? "#fff" : "#111827",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodo("mes")}
              style={{
                padding: (isMobile || isTablet) ? "8px 12px" : "6px 14px",
                border: periodo === "mes" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: (isMobile || isTablet) ? 12 : 13,
                fontWeight: periodo === "mes" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "mes" ? "#37648c" : "#fff",
                color: periodo === "mes" ? "#fff" : "#111827",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
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
                padding: (isMobile || isTablet) ? "8px 12px" : "6px 14px",
                border: periodo === "custom" ? "2px solid #37648c" : "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: (isMobile || isTablet) ? 12 : 13,
                fontWeight: periodo === "custom" ? 600 : 400,
                cursor: "pointer",
                backgroundColor: periodo === "custom" ? "#37648c" : "#fff",
                color: periodo === "custom" ? "#fff" : "#111827",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
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
            <>
              {(isMobile || isTablet) && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999
                  }}
                  onClick={() => setMostrarCalendario(false)}
                />
              )}
              <div
                style={{
                  position: (isMobile || isTablet) ? "fixed" : "absolute",
                  top: (isMobile || isTablet) ? "50%" : "100%",
                  left: (isMobile || isTablet) ? "50%" : "auto",
                  right: (isMobile || isTablet) ? "auto" : 0,
                  transform: (isMobile || isTablet) ? "translate(-50%, -50%)" : "none",
                  marginTop: (isMobile || isTablet) ? 0 : 8,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #e5e7eb",
                  padding: (isMobile || isTablet) ? 16 : 20,
                  zIndex: 1000,
                  minWidth: (isMobile || isTablet) ? "90vw" : 320,
                  maxWidth: (isMobile || isTablet) ? "90vw" : "none",
                  maxHeight: (isMobile || isTablet) ? "90vh" : "none",
                  overflowY: (isMobile || isTablet) ? "auto" : "visible",
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
            </>
          )}
        </div>
      </div>

      {/* Header com título e botão exportar */}
      <div style={{ 
        display: "flex", 
        flexDirection: (isMobile || isTablet) ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: (isMobile || isTablet) ? "flex-start" : "center", 
        gap: (isMobile || isTablet) ? 16 : 0,
        marginBottom: 32 
      }}>
        <div>
          <h2 style={{ fontSize: (isMobile || isTablet) ? 18 : 20, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            {periodo === "hoje" ? "Relatório do Dia" : periodo === "semana" ? "Relatório Semanal" : periodo === "mes" ? "Relatório Mensal" : "Relatório Personalizado"}
          </h2>
          <p style={{ fontSize: (isMobile || isTablet) ? 13 : 14, color: "#6b7280" }}>
            {dataInicio && dataFim ? `${formatDateBR(dataInicio)}${dataInicio !== dataFim ? ` - ${formatDateBR(dataFim)}` : ""}` : "Período selecionado"}
          </p>
        </div>
        <button
          onClick={() => exportarParaPDF(periodo, dataInicio, dataFim, dadosRelatorio)}
          style={{
            padding: (isMobile || isTablet) ? "10px 16px" : "12px 24px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: (isMobile || isTablet) ? 13 : 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)",
            width: (isMobile || isTablet) ? "100%" : "auto"
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
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: (isMobile || isTablet) 
          ? (periodo === "hoje" ? "repeat(2, 1fr)" : "repeat(2, 1fr)") 
          : (periodo === "hoje" ? "repeat(4, 1fr)" : "repeat(4, 1fr)"), 
        gap: (isMobile || isTablet) ? 16 : 24, 
        marginBottom: 40 
      }}>
        <div className="card" style={{ 
          marginTop: 0, 
          padding: (isMobile || isTablet) ? "20px" : "28px",
          background: periodo === "hoje" ? "#fff" : "linear-gradient(135deg, #37648c 0%, #2d4f6f 100%)",
          color: periodo === "hoje" ? "#111827" : "#fff",
          border: periodo === "hoje" ? "1px solid #e5e7eb" : "none",
          gridColumn: (isMobile || isTablet) ? "span 1" : "span 1",
          borderRadius: 16,
          boxShadow: periodo === "hoje" ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "0 8px 24px rgba(55, 100, 140, 0.25)",
          position: periodo === "hoje" ? "static" : "relative",
          overflow: periodo === "hoje" ? "visible" : "hidden",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (periodo === "hoje") {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
          } else {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(55, 100, 140, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (periodo === "hoje") {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
          } else {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(55, 100, 140, 0.25)";
          }
        }}
        >
          {periodo !== "hoje" && (
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
          )}
          <div style={{ position: periodo === "hoje" ? "static" : "relative", zIndex: periodo === "hoje" ? 0 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: periodo === "hoje" ? 0.6 : 0.9, color: periodo === "hoje" ? "#6b7280" : "currentColor" }}>
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: 14, color: periodo === "hoje" ? "#6b7280" : "rgba(255,255,255,0.95)", fontWeight: 500 }}>Total de Reservas</div>
            </div>
            <div style={{ fontSize: (isMobile || isTablet) ? 32 : 42, fontWeight: 800, lineHeight: 1.1, color: periodo === "hoje" ? "#37648c" : "#fff", letterSpacing: "-1px" }}>
              {dadosRelatorio.totalReservas}
            </div>
            <div style={{ fontSize: 12, color: periodo === "hoje" ? "#9ca3af" : "rgba(255,255,255,0.8)", marginTop: 8 }}>
              {periodo === "hoje" ? "reservas confirmadas" : "reservas no período"}
            </div>
          </div>
        </div>
        
        <div className="card" style={{ 
          marginTop: 0, 
          padding: (isMobile || isTablet) ? "20px" : "28px",
          background: "#fff",
          color: "#111827",
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6, color: "#6b7280" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
            </svg>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Total Receita</div>
          </div>
          <div style={{ fontSize: (isMobile || isTablet) ? 32 : 42, fontWeight: 800, lineHeight: 1.1, color: "#37648c", letterSpacing: "-1px" }}>
            {formatBRL(dadosRelatorio.totalReceita)}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
            {periodo === "hoje" ? "receita do dia" : "receita total"}
          </div>
        </div>

        {/* Reservas Canceladas */}
        <div className="card" style={{ 
          marginTop: 0, 
          padding: (isMobile || isTablet) ? "20px" : "28px", 
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
          <div style={{ fontSize: (isMobile || isTablet) ? 32 : 42, fontWeight: 800, color: "#ef4444", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {dadosRelatorio.reservasCanceladas}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
            {periodo === "hoje" ? "cancelamentos do dia" : "cancelamentos"}
          </div>
        </div>

        {/* Taxa de Ocupação */}
        <div className="card" style={{ 
          marginTop: 0, 
          padding: (isMobile || isTablet) ? "20px" : "28px", 
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
          <div style={{ fontSize: (isMobile || isTablet) ? 32 : 42, fontWeight: 800, color: "#37648c", lineHeight: 1.1, letterSpacing: "-1px" }}>
            {dadosRelatorio.taxaOcupacao}%
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
            {periodo === "hoje" ? "ocupação do dia" : "ocupação média"}
          </div>
        </div>
      </div>

      {/* Conteúdo específico por período */}
      {periodo === "hoje" ? (
        <>
          {/* Reservas por hora - Apenas para hoje */}
          <div className="card" style={{ 
            marginTop: 0, 
            marginBottom: 24, 
            padding: (isMobile || isTablet) ? "20px" : "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: (isMobile || isTablet) ? 32 : 40,
                height: (isMobile || isTablet) ? 32 : 40,
                borderRadius: 10,
                backgroundColor: "#f0f9ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width={isMobile || isTablet ? "18" : "20"} height={isMobile || isTablet ? "18" : "20"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: (isMobile || isTablet) ? 18 : 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                Reservas por Horário
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: (isMobile || isTablet) ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: (isMobile || isTablet) ? 12 : 20 }}>
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
                  <div style={{ fontSize: (isMobile || isTablet) ? 24 : 32, fontWeight: 800, color: item.reservas > 0 ? "#37648c" : "#9ca3af", lineHeight: 1.2 }}>{item.reservas}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>reservas</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quadras Mais Utilizadas - Apenas para hoje */}
          <div className="card" style={{ 
            marginTop: 0, 
            marginBottom: 24, 
            padding: (isMobile || isTablet) ? "20px" : "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: (isMobile || isTablet) ? 32 : 40,
                height: (isMobile || isTablet) ? 32 : 40,
                borderRadius: 10,
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width={isMobile || isTablet ? "18" : "20"} height={isMobile || isTablet ? "18" : "20"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#f59e0b" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: (isMobile || isTablet) ? 18 : 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                Quadras Mais Utilizadas
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "repeat(2, 1fr)", gap: (isMobile || isTablet) ? 16 : 20 }}>
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
                      padding: (isMobile || isTablet) ? "20px" : "24px",
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
                          <div style={{ fontSize: (isMobile || isTablet) ? 16 : 18, fontWeight: 700, marginBottom: 8, opacity: index < 3 ? 1 : 0.95 }}>
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
                          width: (isMobile || isTablet) ? 40 : 48,
                          height: (isMobile || isTablet) ? 40 : 48,
                          borderRadius: 12,
                          background: index < 3 ? "rgba(255, 255, 255, 0.25)" : "#37648c",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: (isMobile || isTablet) ? 18 : 20,
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
                        <div style={{ fontSize: (isMobile || isTablet) ? 20 : 24, fontWeight: 800, color: index < 3 ? "#fff" : "#059669", lineHeight: 1.2 }}>
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
      ) : (
        <>
          {/* Gráfico de reservas por dia - Apenas para semana */}
          {periodo === "semana" ? (
            <div className="card" style={{ 
              marginTop: 0, 
              marginBottom: 24, 
              padding: (isMobile || isTablet) ? "20px" : "28px",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              overflowX: (isMobile || isTablet) ? "auto" : "visible"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{
                  width: (isMobile || isTablet) ? 32 : 40,
                  height: (isMobile || isTablet) ? 32 : 40,
                  borderRadius: 10,
                  backgroundColor: "#f0f9ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width={isMobile || isTablet ? "18" : "20"} height={isMobile || isTablet ? "18" : "20"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: (isMobile || isTablet) ? 18 : 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Reservas por Dia da Semana
                </h3>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-end", 
                gap: (isMobile || isTablet) ? 8 : 16, 
                height: (isMobile || isTablet) ? 180 : 240, 
                padding: "0 8px",
                minWidth: (isMobile || isTablet) ? "500px" : "auto"
              }}>
                {(() => {
                  const maxReservas = Math.max(...dadosRelatorio.reservasPorDia.map(d => d.reservas));
                  const alturaContainer = (isMobile || isTablet) ? 180 : 240;
                  return dadosRelatorio.reservasPorDia.map((item, index) => {
                    const alturaPercentual = maxReservas > 0 ? (item.reservas / maxReservas) * 100 : 0;
                    const alturaPixels = (alturaPercentual / 100) * alturaContainer;
                    const alturaFinal = Math.max(alturaPixels, item.reservas > 0 ? 20 : 0);
                    const isMax = item.reservas === maxReservas;
                    return (
                      <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                          style={{
                            width: "100%",
                            height: `${alturaFinal}px`,
                            background: isMax ? "linear-gradient(180deg, #37648c 0%, #2d4f6f 100%)" : "linear-gradient(180deg, #60a5fa 0%, #37648c 100%)",
                            borderRadius: "12px 12px 0 0",
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
                })
                })()}
              </div>
            </div>
          ) : null}

          {/* Calendário do mês com reservas por dia - Apenas para relatório mensal */}
          {periodo === "mes" && (
            <div className="card" style={{ 
              marginTop: 0, 
              marginBottom: 24, 
              padding: (isMobile || isTablet) ? "12px" : "16px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: (isMobile || isTablet) ? 24 : 28,
                    height: (isMobile || isTablet) ? 24 : 28,
                    borderRadius: 6,
                    backgroundColor: "#f0f9ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width={isMobile || isTablet ? "14" : "16"} height={isMobile || isTablet ? "14" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#37648c" }}>
                      <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: (isMobile || isTablet) ? 14 : 16, fontWeight: 700, margin: 0, color: "#111827" }}>
                    Calendário do Mês - Reservas por Dia
                  </h3>
                </div>
                <div style={{ 
                  fontSize: (isMobile || isTablet) ? 12 : 14, 
                  fontWeight: 600, 
                  color: "#37648c",
                  padding: (isMobile || isTablet) ? "4px 10px" : "6px 12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: 6
                }}>
                  {meses[mesAtual]} {anoAtual}
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(7, 1fr)", 
                gap: (isMobile || isTablet) ? 4 : 6,
                marginBottom: (isMobile || isTablet) ? 6 : 8
              }}>
                {diasSemana.map((dia, index) => (
                  <div 
                    key={index}
                    style={{ 
                      textAlign: "center", 
                      fontSize: (isMobile || isTablet) ? 10 : 11, 
                      fontWeight: 600, 
                      color: "#6b7280",
                      padding: (isMobile || isTablet) ? "4px 2px" : "6px 2px"
                    }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(7, 1fr)", 
                gap: (isMobile || isTablet) ? 4 : 6
              }}>
                {(() => {
                  const primeiroDia = new Date(anoAtual, mesAtual, 1);
                  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
                  const diasNoMes = ultimoDia.getDate();
                  const diaSemanaInicio = primeiroDia.getDay();
                  
                  const dias = [];
                  
                  // Adicionar células vazias para os dias antes do primeiro dia do mês
                  for (let i = 0; i < diaSemanaInicio; i++) {
                    dias.push(null);
                  }
                  
                  // Adicionar todos os dias do mês
                  for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = formatarDataParaInput(anoAtual, mesAtual, dia);
                    const numReservas = reservasPorDiaDoMes[data] || 0;
                    const isHoje = anoAtual === hoje.getFullYear() && mesAtual === hoje.getMonth() && dia === hoje.getDate();
                    
                    dias.push({ dia, numReservas, isHoje });
                  }
                  
                  return dias.map((item, index) => {
                    if (item === null) {
                      return <div key={index} style={{ aspectRatio: "1", minHeight: (isMobile || isTablet) ? 32 : 36 }} />;
                    }
                    
                    const { dia, numReservas, isHoje } = item;
                    const temReservas = numReservas > 0;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          aspectRatio: "1",
                          minHeight: (isMobile || isTablet) ? 32 : 36,
                          border: isHoje ? "2px solid #37648c" : "1px solid #e5e7eb",
                          borderRadius: 6,
                          padding: (isMobile || isTablet) ? 3 : 4,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isHoje ? "#f0f9ff" : temReservas ? "#f9fafb" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          position: "relative"
                        }}
                        onMouseEnter={(e) => {
                          if (temReservas) {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(55, 100, 140, 0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ 
                          fontSize: (isMobile || isTablet) ? 10 : 11, 
                          fontWeight: isHoje ? 700 : 600, 
                          color: isHoje ? "#37648c" : "#111827",
                          marginBottom: temReservas ? 1 : 0
                        }}>
                          {dia}
                        </div>
                        {temReservas && (
                          <div style={{
                            fontSize: (isMobile || isTablet) ? 8 : 9,
                            fontWeight: 700,
                            color: "#fff",
                            backgroundColor: "#37648c",
                            borderRadius: 6,
                            padding: (isMobile || isTablet) ? "1px 3px" : "1px 4px",
                            minWidth: (isMobile || isTablet) ? 16 : 18,
                            textAlign: "center",
                            lineHeight: 1.1
                          }}>
                            {numReservas}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Top quadras - Para todos exceto hoje */}
          {periodo !== "hoje" && (
          <div className="card" style={{ 
            marginTop: 0, 
            padding: (isMobile || isTablet) ? "20px" : "28px",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: (isMobile || isTablet) ? 32 : 40,
                height: (isMobile || isTablet) ? 32 : 40,
                borderRadius: 10,
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width={isMobile || isTablet ? "18" : "20"} height={isMobile || isTablet ? "18" : "20"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#f59e0b" }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{ fontSize: (isMobile || isTablet) ? 18 : 20, fontWeight: 700, margin: 0, color: "#111827" }}>
                Quadras Mais Utilizadas
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: (isMobile || isTablet) ? "1fr" : "repeat(2, 1fr)", gap: (isMobile || isTablet) ? 16 : 20 }}>
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
                      padding: (isMobile || isTablet) ? "20px" : "24px",
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
                          <div style={{ fontSize: (isMobile || isTablet) ? 16 : 18, fontWeight: 700, marginBottom: 8, opacity: index < 3 ? 1 : 0.95 }}>
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
                          width: (isMobile || isTablet) ? 40 : 48,
                          height: (isMobile || isTablet) ? 40 : 48,
                          borderRadius: 12,
                          background: index < 3 ? "rgba(255, 255, 255, 0.25)" : "#37648c",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: (isMobile || isTablet) ? 18 : 20,
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
                        <div style={{ fontSize: (isMobile || isTablet) ? 20 : 24, fontWeight: 800, color: index < 3 ? "#fff" : "#059669", lineHeight: 1.2 }}>
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
          )}
        </>
      )}
    </div>
  );
}
