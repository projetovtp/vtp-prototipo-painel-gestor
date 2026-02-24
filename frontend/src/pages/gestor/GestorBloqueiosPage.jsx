import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

export default function GestorBloqueiosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState([]);
  const [quadrasExpandidas, setQuadrasExpandidas] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [bloqueios, setBloqueios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  
  // Estados para seleção de quadras no bloqueio
  const [bloquearTodasQuadras, setBloquearTodasQuadras] = useState(false);
  const [quantidadeQuadrasBloquear, setQuantidadeQuadrasBloquear] = useState(1);

  // Calendário para bloqueios
  const [mesBloqueio, setMesBloqueio] = useState(new Date());
  const [horariosBloqueio, setHorariosBloqueio] = useState([]);
  const [dataBloqueioSelecionada, setDataBloqueioSelecionada] = useState("");
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);
  const [removendoBloqueio, setRemovendoBloqueio] = useState(false);

  // Carregar quadras
  useEffect(() => {
    if (!usuario) return;
    carregarQuadras();
  }, [usuario]);

  // Carregar bloqueios quando quadra mudar
  useEffect(() => {
    if (quadraSelecionadaId) {
      carregarAgenda();
      // Resetar seleções de bloqueio quando mudar de quadra
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
    } else {
      setBloqueios([]);
    }
  }, [quadraSelecionadaId]);

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const { data } = await api.get("/gestor/quadras");
      let quadrasData = Array.isArray(data) ? data : [];
      
      // Adicionar quadras de exemplo para grupos específicos (igual à página de Reservas)
      const quadrasExpandidas = [];
      
      // Agrupar quadras por nome primeiro
      const quadrasPorNome = {};
      quadrasData.forEach((quadra) => {
        const nomeQuadra = `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
        if (!quadrasPorNome[nomeQuadra]) {
          quadrasPorNome[nomeQuadra] = [];
        }
        quadrasPorNome[nomeQuadra].push(quadra);
      });
      
      // Processar cada grupo
      Object.entries(quadrasPorNome).forEach(([nomeQuadra, quadrasGrupo]) => {
        // Indoor - Beach tennis: garantir 6 quadras
        if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
          const primeiraQuadra = quadrasGrupo[0];
          // Se há menos de 6, criar quadras adicionais
          for (let i = quadrasGrupo.length; i < 6; i++) {
            quadrasExpandidas.push({
              ...primeiraQuadra,
              id: `beach-tennis-${i + 1}-${primeiraQuadra.id}`,
            });
          }
        }
        
        // Indoor - Pádel: garantir 3 quadras
        if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
          const primeiraQuadra = quadrasGrupo[0];
          // Se há menos de 3, criar quadras adicionais
          for (let i = quadrasGrupo.length; i < 3; i++) {
            quadrasExpandidas.push({
              ...primeiraQuadra,
              id: `padel-${i + 1}-${primeiraQuadra.id}`,
            });
          }
        }
      });
      
      // Combinar quadras originais com as expandidas
      const todasQuadras = [...quadrasData, ...quadrasExpandidas];
      setQuadras(quadrasData);
      setQuadrasExpandidas(todasQuadras);
      
      // Se não houver quadra selecionada e houver quadras, seleciona a primeira
      if (!quadraSelecionadaId && todasQuadras.length > 0) {
        setQuadraSelecionadaId(todasQuadras[0].id);
      }
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao carregar quadras:", err);
      setErro("Erro ao carregar quadras.");
    } finally {
      setCarregando(false);
    }
  }
  
  // Obter nome da quadra
  function getNomeQuadra(quadraId) {
    const quadra = quadrasExpandidas.find((q) => q.id === quadraId);
    if (!quadra) return "Quadra não encontrada";
    return `${quadra.tipo || "Quadra"}${quadra.modalidade ? ` - ${quadra.modalidade}` : ""}`;
  }
  
  // Agrupar quadras por nome (tipo + modalidade)
  function agruparQuadrasPorNome() {
    const grupos = {};
    quadrasExpandidas.forEach((quadra) => {
      const nomeGrupo = getNomeQuadra(quadra.id);
      if (!grupos[nomeGrupo]) {
        grupos[nomeGrupo] = [];
      }
      grupos[nomeGrupo].push(quadra);
    });
    return grupos;
  }
  
  // Obter grupo da quadra selecionada
  function getGrupoQuadraSelecionada() {
    if (!quadraSelecionadaId) return null;
    const grupos = agruparQuadrasPorNome();
    const quadraSelecionada = quadrasExpandidas.find(q => q.id === quadraSelecionadaId);
    if (!quadraSelecionada) return null;
    const nomeGrupo = getNomeQuadra(quadraSelecionada.id);
    return grupos[nomeGrupo] || null;
  }

  async function carregarAgenda() {
    if (!quadraSelecionadaId) return;

    try {
      setCarregando(true);
      const respBloqueios = await api.get("/gestor/agenda/bloqueios", { params: { quadraId: quadraSelecionadaId } });
      setBloqueios(respBloqueios.data?.bloqueios || []);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao carregar bloqueios:", err);
      setErro("Erro ao carregar bloqueios.");
    } finally {
      setCarregando(false);
    }
  }

  // Calendário para bloqueios
  function gerarDiasDoMes() {
    const ano = mesBloqueio.getFullYear();
    const mes = mesBloqueio.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < diaInicialSemana; i++) {
      dias.push(null);
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      dias.push({
        dia,
        data: dataISO,
        bloqueado: bloqueios.some(b => b.data === dataISO),
        bloqueiosDoDia: bloqueios.filter(b => b.data === dataISO)
      });
    }

    return dias;
  }

  function toggleHorarioBloqueio(horario) {
    setHorariosBloqueio(prev => 
      prev.includes(horario)
        ? prev.filter(h => h !== horario)
        : [...prev, horario]
    );
  }

  async function handleSalvarBloqueios() {
    if (!dataBloqueioSelecionada || horariosBloqueio.length === 0) {
      setErro("Selecione uma data e pelo menos um horário para bloquear.");
      return;
    }

    try {
      setSalvandoBloqueio(true);
      setErro("");
      setMensagem("");

      const horaInicio = Math.min(...horariosBloqueio.map(h => parseInt(h.split(":")[0])));
      const horaFim = Math.max(...horariosBloqueio.map(h => parseInt(h.split(":")[0]))) + 1;

      // Determinar quais quadras bloquear
      let quadrasParaBloquear = [];
      const grupoQuadras = getGrupoQuadraSelecionada();
      
      if (bloquearTodasQuadras && grupoQuadras) {
        // Bloquear todas as quadras do grupo
        quadrasParaBloquear = grupoQuadras.map(q => q.id);
      } else if (grupoQuadras && grupoQuadras.length > 1) {
        // Bloquear quantidade específica de quadras
        const quantidade = Math.min(quantidadeQuadrasBloquear, grupoQuadras.length);
        quadrasParaBloquear = grupoQuadras.slice(0, quantidade).map(q => q.id);
      } else {
        // Bloquear apenas a quadra selecionada
        quadrasParaBloquear = [quadraSelecionadaId];
      }

      const payload = {
        quadraIds: quadrasParaBloquear,
        data: dataBloqueioSelecionada,
        horaInicio: String(horaInicio).padStart(2, "0") + ":00",
        horaFim: String(horaFim).padStart(2, "0") + ":00",
        motivo: "Bloqueio manual"
      };

      await api.post("/gestor/agenda/bloqueios/lote", payload);
      setMensagem(`Horários bloqueados com sucesso em ${quadrasParaBloquear.length} quadra(s)!`);
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao salvar bloqueio:", err);
      setErro(err.response?.data?.error || "Erro ao salvar bloqueio.");
    } finally {
      setSalvandoBloqueio(false);
    }
  }

  async function handleBloquearDiaInteiro() {
    if (!dataBloqueioSelecionada) {
      setErro("Selecione uma data primeiro.");
      return;
    }

    try {
      setSalvandoBloqueio(true);
      setErro("");
      setMensagem("");

      // Determinar quais quadras bloquear
      let quadrasParaBloquear = [];
      const grupoQuadras = getGrupoQuadraSelecionada();
      
      if (bloquearTodasQuadras && grupoQuadras) {
        // Bloquear todas as quadras do grupo
        quadrasParaBloquear = grupoQuadras.map(q => q.id);
      } else if (grupoQuadras && grupoQuadras.length > 1) {
        // Bloquear quantidade específica de quadras
        const quantidade = Math.min(quantidadeQuadrasBloquear, grupoQuadras.length);
        quadrasParaBloquear = grupoQuadras.slice(0, quantidade).map(q => q.id);
      } else {
        // Bloquear apenas a quadra selecionada
        quadrasParaBloquear = [quadraSelecionadaId];
      }

      const payload = {
        quadraIds: quadrasParaBloquear,
        data: dataBloqueioSelecionada,
        horaInicio: "00:00",
        horaFim: "23:59",
        motivo: "Bloqueio de dia inteiro"
      };

      await api.post("/gestor/agenda/bloqueios/lote", payload);
      setMensagem(`Dia inteiro bloqueado com sucesso em ${quadrasParaBloquear.length} quadra(s)!`);
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao bloquear dia inteiro:", err);
      setErro(err.response?.data?.error || "Erro ao bloquear dia inteiro.");
    } finally {
      setSalvandoBloqueio(false);
    }
  }

  async function handleDesbloquearHorarios() {
    if (!dataBloqueioSelecionada || horariosBloqueio.length === 0) {
      setErro("Selecione uma data e pelo menos um horário para desbloquear.");
      return;
    }

    try {
      setRemovendoBloqueio(true);
      setErro("");
      setMensagem("");

      // Buscar bloqueios que correspondem aos horários selecionados
      const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
      
      // Para cada horário selecionado, encontrar e remover o bloqueio correspondente
      const bloqueiosParaRemover = [];
      horariosBloqueio.forEach(horario => {
        const hora = parseInt(horario.split(":")[0]);
        const bloqueio = bloqueiosDoDia.find(b => {
          const horaInicio = parseInt(b.hora_inicio?.split(":")[0] || 0);
          const horaFim = parseInt(b.hora_fim?.split(":")[0] || 23);
          return hora >= horaInicio && hora < horaFim;
        });
        if (bloqueio) {
          bloqueiosParaRemover.push(bloqueio.id);
        }
      });

      // Remover bloqueios únicos
      const bloqueiosUnicos = [...new Set(bloqueiosParaRemover)];
      await Promise.all(
        bloqueiosUnicos.map(id => api.delete(`/gestor/agenda/bloqueios/${id}`))
      );

      setMensagem("Horários desbloqueados com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao desbloquear horários:", err);
      setErro(err.response?.data?.error || "Erro ao desbloquear horários.");
    } finally {
      setRemovendoBloqueio(false);
    }
  }

  async function handleDesbloquearDiaInteiro() {
    if (!dataBloqueioSelecionada) {
      setErro("Selecione uma data primeiro.");
      return;
    }

    try {
      setRemovendoBloqueio(true);
      setErro("");
      setMensagem("");

      // Buscar todos os bloqueios do dia
      const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
      
      // Remover todos os bloqueios do dia
      await Promise.all(
        bloqueiosDoDia.map(bloqueio => api.delete(`/gestor/agenda/bloqueios/${bloqueio.id}`))
      );

      setMensagem("Dia inteiro desbloqueado com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao desbloquear dia inteiro:", err);
      setErro(err.response?.data?.error || "Erro ao desbloquear dia inteiro.");
    } finally {
      setRemovendoBloqueio(false);
    }
  }

  // Verificar quais horários estão bloqueados para a data selecionada
  function getHorariosBloqueados() {
    if (!dataBloqueioSelecionada) return [];
    
    const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
    const horariosBloqueados = [];
    
    bloqueiosDoDia.forEach(bloqueio => {
      const horaInicio = parseInt(bloqueio.hora_inicio?.split(":")[0] || 0);
      const horaFim = parseInt(bloqueio.hora_fim?.split(":")[0] || 23);
      
      for (let hora = horaInicio; hora < horaFim; hora++) {
        const horario = String(hora).padStart(2, "0") + ":00";
        if (!horariosBloqueados.includes(horario)) {
          horariosBloqueados.push(horario);
        }
      }
    });
    
    return horariosBloqueados;
  }

  function formatarNomeQuadra(quadra) {
    const tipo = quadra.tipo || "Quadra";
    const modalidade = quadra.modalidade || "";
    return modalidade ? `${tipo} - ${modalidade}` : tipo;
  }

  const diasDoMes = gerarDiasDoMes();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Bloqueio de Horários</h1>
      </div>

      {mensagem && (
        <div className="card" style={{ backgroundColor: "#d1fae5", border: "1px solid #86efac", color: "#065f46", padding: "12px 16px", marginBottom: 16 }}>
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {/* Container unificado: Quadra + Bloqueio de Horários */}
      <div className="card" style={{ marginTop: 0 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Bloqueio de Horários</h3>
        
        {/* Seleção de Quadra */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #e5e7eb" }}>
          <label style={{
            display: "block",
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
            marginBottom: 8
          }}>
            Quadra
          </label>
          {carregando && quadras.length === 0 ? (
            <div style={{
              padding: "12px 16px",
              color: "#6b7280",
              fontSize: 14,
              backgroundColor: "#f9fafb",
              borderRadius: 8,
              border: "1px solid #e5e7eb"
            }}>
              Carregando quadras...
            </div>
          ) : (
            <select
              value={quadraSelecionadaId}
              onChange={(e) => {
                setQuadraSelecionadaId(e.target.value);
                setBloquearTodasQuadras(false);
                setQuantidadeQuadrasBloquear(1);
              }}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                outline: "none",
                backgroundColor: "#fff",
                color: "#111827",
                cursor: "pointer",
                transition: "all 0.2s",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 16px center",
                paddingRight: "40px"
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#37648c";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#d1d5db";
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#37648c";
                e.target.style.boxShadow = "0 0 0 2px rgba(55, 100, 140, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Selecione uma quadra</option>
              {quadrasExpandidas.length > 0 ? quadrasExpandidas.map((quadra) => (
                <option key={quadra.id} value={quadra.id}>
                  {formatarNomeQuadra(quadra)}
                </option>
              )) : quadras.map((quadra) => (
                <option key={quadra.id} value={quadra.id}>
                  {formatarNomeQuadra(quadra)}
                </option>
              ))}
            </select>
          )}
        </div>

        {!quadraSelecionadaId && (
          <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
            Selecione uma quadra para configurar os bloqueios
          </div>
        )}

        {quadraSelecionadaId && (
          <>
            
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Selecione uma data no calendário e os horários que deseja bloquear ou desbloquear.
            </p>

            {/* Calendário */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => {
                    const novoMes = new Date(mesBloqueio);
                    novoMes.setMonth(novoMes.getMonth() - 1);
                    setMesBloqueio(novoMes);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  ← Anterior
                </button>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>
                  {nomesMeses[mesBloqueio.getMonth()]} {mesBloqueio.getFullYear()}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const novoMes = new Date(mesBloqueio);
                    novoMes.setMonth(novoMes.getMonth() + 1);
                    setMesBloqueio(novoMes);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Próximo →
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].map(dia => (
                  <div key={dia} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", padding: 8 }}>
                    {dia}
                  </div>
                ))}
                {diasDoMes.map((dia, index) => {
                  if (!dia) return <div key={index}></div>;
                  
                  const isSelecionado = dataBloqueioSelecionada === dia.data;
                  const isBloqueado = dia.bloqueado;

                  return (
                    <button
                      key={dia.dia}
                      type="button"
                      onClick={() => {
                        setDataBloqueioSelecionada(dia.data);
                        setHorariosBloqueio([]);
                      }}
                      style={{
                        padding: "12px",
                        backgroundColor: isSelecionado ? "#37648c" : isBloqueado ? "#fee2e2" : "#fff",
                        color: isSelecionado ? "#fff" : isBloqueado ? "#991b1b" : "#111827",
                        border: `2px solid ${isSelecionado ? "#37648c" : isBloqueado ? "#ef4444" : "#e5e7eb"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: isSelecionado ? 600 : 500
                      }}
                    >
                      {dia.dia}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Horários */}
            {dataBloqueioSelecionada && (() => {
              const horariosBloqueados = getHorariosBloqueados();
              const diaEstaBloqueado = bloqueios.some(b => b.data === dataBloqueioSelecionada);
              const grupoQuadras = getGrupoQuadraSelecionada();
              const totalQuadrasNoGrupo = grupoQuadras ? grupoQuadras.length : 1;
              const temMultiplasQuadras = totalQuadrasNoGrupo > 1;
              
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        Selecione os horários em {formatDateBR(dataBloqueioSelecionada)}:
                      </label>
                      
                      {/* Seleção de quantas quadras bloquear (se houver múltiplas) */}
                      {temMultiplasQuadras && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", backgroundColor: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                            {totalQuadrasNoGrupo} quadras:
                          </span>
                          
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                            <input
                              type="checkbox"
                              checked={bloquearTodasQuadras}
                              onChange={(e) => {
                                setBloquearTodasQuadras(e.target.checked);
                                if (e.target.checked) {
                                  setQuantidadeQuadrasBloquear(totalQuadrasNoGrupo);
                                }
                              }}
                              style={{ width: 16, height: 16, cursor: "pointer" }}
                            />
                            <span style={{ color: "#111827", fontWeight: 500 }}>
                              Todas
                            </span>
                          </label>
                          
                          {!bloquearTodasQuadras && (
                            <select
                              value={quantidadeQuadrasBloquear}
                              onChange={(e) => setQuantidadeQuadrasBloquear(Number(e.target.value))}
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                fontSize: 13,
                                outline: "none",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                minWidth: 90
                              }}
                            >
                              {Array.from({ length: totalQuadrasNoGrupo }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>
                                  {num} quadra{num > 1 ? "s" : ""}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                  </div>
                  
                  {diaEstaBloqueado && (
                    <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8 }}>
                      <div style={{ fontSize: 13, color: "#991b1b", marginBottom: 8, fontWeight: 600 }}>
                        Este dia está bloqueado
                      </div>
                      <button
                        type="button"
                        onClick={handleDesbloquearDiaInteiro}
                        disabled={removendoBloqueio}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: removendoBloqueio ? "#9ca3af" : "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: removendoBloqueio ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (!removendoBloqueio) {
                            e.target.style.backgroundColor = "#b91c1c";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!removendoBloqueio) {
                            e.target.style.backgroundColor = "#dc2626";
                          }
                        }}
                      >
                        {removendoBloqueio ? "Desbloqueando..." : "Desbloquear Dia Inteiro"}
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Array.from({ length: 18 }, (_, i) => {
                      const hora = i + 6;
                      const horario = String(hora).padStart(2, "0") + ":00";
                      const isSelecionado = horariosBloqueio.includes(horario);
                      const isBloqueado = horariosBloqueados.includes(horario);

                      return (
                        <button
                          key={horario}
                          type="button"
                          onClick={() => toggleHorarioBloqueio(horario)}
                          disabled={removendoBloqueio || salvandoBloqueio}
                          style={{
                            padding: "10px 16px",
                            backgroundColor: isBloqueado ? "#fee2e2" : isSelecionado ? "#37648c" : "#fff",
                            color: isBloqueado ? "#991b1b" : isSelecionado ? "#fff" : "#111827",
                            border: `2px solid ${isBloqueado ? "#ef4444" : isSelecionado ? "#37648c" : "#d1d5db"}`,
                            borderRadius: 8,
                            cursor: (removendoBloqueio || salvandoBloqueio) ? "not-allowed" : "pointer",
                            fontSize: 14,
                            fontWeight: (isSelecionado || isBloqueado) ? 600 : 500,
                            opacity: (removendoBloqueio || salvandoBloqueio) ? 0.6 : 1
                          }}
                        >
                          {horario}
                          {isBloqueado && !isSelecionado && " (bloqueado)"}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                    {horariosBloqueio.length > 0 && (
                      <>
                        {horariosBloqueio.some(h => horariosBloqueados.includes(h)) ? (
                          <button
                            type="button"
                            onClick={handleDesbloquearHorarios}
                            disabled={removendoBloqueio || salvandoBloqueio}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: (removendoBloqueio || salvandoBloqueio) ? "#9ca3af" : "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: (removendoBloqueio || salvandoBloqueio) ? "not-allowed" : "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              if (!removendoBloqueio && !salvandoBloqueio) {
                                e.target.style.backgroundColor = "#b91c1c";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!removendoBloqueio && !salvandoBloqueio) {
                                e.target.style.backgroundColor = "#dc2626";
                              }
                            }}
                          >
                            {removendoBloqueio ? "Desbloqueando..." : `Desbloquear ${horariosBloqueio.length} horário(s)`}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSalvarBloqueios}
                            disabled={salvandoBloqueio || removendoBloqueio}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: (salvandoBloqueio || removendoBloqueio) ? "#9ca3af" : "#37648c",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: (salvandoBloqueio || removendoBloqueio) ? "not-allowed" : "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              if (!salvandoBloqueio && !removendoBloqueio) {
                                e.target.style.backgroundColor = "#2d5070";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!salvandoBloqueio && !removendoBloqueio) {
                                e.target.style.backgroundColor = "#37648c";
                              }
                            }}
                          >
                            {salvandoBloqueio ? "Bloqueando..." : `Bloquear ${horariosBloqueio.length} horário(s)`}
                          </button>
                        )}
                      </>
                    )}
                    
                    {!diaEstaBloqueado && (
                      <button
                        type="button"
                        onClick={handleBloquearDiaInteiro}
                        disabled={salvandoBloqueio || removendoBloqueio}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: (salvandoBloqueio || removendoBloqueio) ? "#9ca3af" : "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: (salvandoBloqueio || removendoBloqueio) ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (!salvandoBloqueio && !removendoBloqueio) {
                            e.target.style.backgroundColor = "#b91c1c";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!salvandoBloqueio && !removendoBloqueio) {
                            e.target.style.backgroundColor = "#dc2626";
                          }
                        }}
                      >
                        {salvandoBloqueio ? "Bloqueando..." : "Bloquear Dia Inteiro"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
