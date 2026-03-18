import React, { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "../../hooks/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorMessage } from "../../components/ui";

import { formatarDataBR as formatDateBR, formatarNomeQuadra } from "../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES } from "../../utils/constants";

const GestorBloqueiosPage = () => {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarBloqueios, criarBloqueiosLote, excluirBloqueio } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [bloqueios, setBloqueios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [bloquearTodasQuadras, setBloquearTodasQuadras] = useState(false);
  const [quantidadeQuadrasBloquear, setQuantidadeQuadrasBloquear] = useState(1);

  const [mesBloqueio, setMesBloqueio] = useState(new Date());
  const [horariosBloqueio, setHorariosBloqueio] = useState([]);
  const [dataBloqueioSelecionada, setDataBloqueioSelecionada] = useState("");
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);
  const [removendoBloqueio, setRemovendoBloqueio] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    carregarQuadras();
  }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quadraSelecionadaId) {
      carregarBloqueios();
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
    } else {
      setBloqueios([]);
    }
  }, [quadraSelecionadaId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const data = await listarQuadrasApi();
      const quadrasData = Array.isArray(data) ? data : [];
      setQuadras(quadrasData);

      if (!quadraSelecionadaId && quadrasData.length > 0) {
        setQuadraSelecionadaId(quadrasData[0].id);
      }
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao carregar quadras:", err);
      setErro("Erro ao carregar quadras.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarBloqueios() {
    if (!quadraSelecionadaId) return;
    try {
      setCarregando(true);
      const dataBloqueios = await listarBloqueios({ quadraId: quadraSelecionadaId });
      setBloqueios(dataBloqueios?.bloqueios || []);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao carregar bloqueios:", err);
      setErro("Erro ao carregar bloqueios.");
    } finally {
      setCarregando(false);
    }
  }

  function getGrupoQuadraSelecionada() {
    if (!quadraSelecionadaId || quadras.length === 0) return null;
    const quadraSelecionada = quadras.find(q => q.id === quadraSelecionadaId);
    if (!quadraSelecionada) return null;
    const nomeGrupo = formatarNomeQuadra(quadraSelecionada);
    return quadras.filter(q => formatarNomeQuadra(q) === nomeGrupo);
  }

  function getQuadrasParaBloquear() {
    const grupo = getGrupoQuadraSelecionada();
    if (!grupo || grupo.length <= 1) return [quadraSelecionadaId];
    if (bloquearTodasQuadras) return grupo.map(q => q.id);
    const quantidade = Math.min(quantidadeQuadrasBloquear, grupo.length);
    return grupo.slice(0, quantidade).map(q => q.id);
  }

  function gerarDiasDoMes() {
    const ano = mesBloqueio.getFullYear();
    const mes = mesBloqueio.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicialSemana; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
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
      const quadrasParaBloquear = getQuadrasParaBloquear();

      await criarBloqueiosLote({
        quadraIds: quadrasParaBloquear,
        data: dataBloqueioSelecionada,
        horaInicio: String(horaInicio).padStart(2, "0") + ":00",
        horaFim: String(horaFim).padStart(2, "0") + ":00",
        motivo: "Bloqueio manual"
      });

      setMensagem(`Horários bloqueados com sucesso em ${quadrasParaBloquear.length} quadra(s)!`);
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
      await carregarBloqueios();
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

      const quadrasParaBloquear = getQuadrasParaBloquear();

      await criarBloqueiosLote({
        quadraIds: quadrasParaBloquear,
        data: dataBloqueioSelecionada,
        horaInicio: "00:00",
        horaFim: "23:59",
        motivo: "Bloqueio de dia inteiro"
      });

      setMensagem(`Dia inteiro bloqueado com sucesso em ${quadrasParaBloquear.length} quadra(s)!`);
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      setBloquearTodasQuadras(false);
      setQuantidadeQuadrasBloquear(1);
      await carregarBloqueios();
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

      const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
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

      const bloqueiosUnicos = [...new Set(bloqueiosParaRemover)];
      await Promise.all(bloqueiosUnicos.map(id => excluirBloqueio(id)));

      setMensagem("Horários desbloqueados com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarBloqueios();
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

      const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
      await Promise.all(bloqueiosDoDia.map(bloqueio => excluirBloqueio(bloqueio.id)));

      setMensagem("Dia inteiro desbloqueado com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarBloqueios();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[BLOQUEIOS] Erro ao desbloquear dia inteiro:", err);
      setErro(err.response?.data?.error || "Erro ao desbloquear dia inteiro.");
    } finally {
      setRemovendoBloqueio(false);
    }
  }

  const diasDoMes = gerarDiasDoMes();
  const isOperando = salvandoBloqueio || removendoBloqueio;

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Bloqueio de Horários</h1>
      </div>

      {mensagem && <div className="rh-success-msg">{mensagem}</div>}

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      <div className="card" style={{ marginTop: 0 }}>
        {/* Seleção de Quadra */}
        <div className="rh-separator">
          <label style={{ display: "block", fontSize: "var(--font-base)", fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>
            Quadra
          </label>
          {carregando && quadras.length === 0 ? (
            <div className="rh-loading-box">Carregando quadras...</div>
          ) : (
            <select
              className="rh-quadra-select"
              value={quadraSelecionadaId}
              onChange={(e) => setQuadraSelecionadaId(e.target.value)}
            >
              <option value="">Selecione uma quadra</option>
              {quadras.map((quadra) => (
                <option key={quadra.id} value={quadra.id}>
                  {formatarNomeQuadra(quadra)}
                </option>
              ))}
            </select>
          )}
        </div>

        {!quadraSelecionadaId && (
          <div className="rh-empty">
            Selecione uma quadra para configurar os bloqueios
          </div>
        )}

        {quadraSelecionadaId && (
          <>
            <p style={{ fontSize: "var(--font-sm)", color: "var(--color-text-secondary)", marginBottom: 20 }}>
              Selecione uma data no calendário e os horários que deseja bloquear ou desbloquear.
            </p>

            {/* Calendário */}
            <div style={{ marginBottom: 24 }}>
              <div className="rh-calendar-nav">
                <button
                  type="button"
                  className="rh-calendar-nav-btn"
                  onClick={() => {
                    const novoMes = new Date(mesBloqueio);
                    novoMes.setMonth(novoMes.getMonth() - 1);
                    setMesBloqueio(novoMes);
                  }}
                >
                  ← Anterior
                </button>
                <h4 style={{ fontSize: "var(--font-lg)", fontWeight: 600 }}>
                  {MESES[mesBloqueio.getMonth()]} {mesBloqueio.getFullYear()}
                </h4>
                <button
                  type="button"
                  className="rh-calendar-nav-btn"
                  onClick={() => {
                    const novoMes = new Date(mesBloqueio);
                    novoMes.setMonth(novoMes.getMonth() + 1);
                    setMesBloqueio(novoMes);
                  }}
                >
                  Próximo →
                </button>
              </div>

              <div className="rh-calendar-grid">
                {DIAS_SEMANA_ABREVIADOS.map(dia => (
                  <div key={dia} className="rh-calendar-day-header">{dia}</div>
                ))}
                {diasDoMes.map((dia, index) => {
                  if (!dia) return <div key={`empty-${index}`} />;

                  const isSelecionado = dataBloqueioSelecionada === dia.data;
                  const isBloqueado = dia.bloqueado;

                  let cls = "rh-calendar-day";
                  if (isSelecionado) cls += " rh-calendar-day--selected";
                  else if (isBloqueado) cls += " rh-calendar-day--blocked";

                  return (
                    <button
                      key={dia.dia}
                      type="button"
                      className={cls}
                      onClick={() => {
                        setDataBloqueioSelecionada(dia.data);
                        setHorariosBloqueio([]);
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
                    <label style={{ fontSize: "var(--font-base)", fontWeight: 600, color: "var(--color-text)" }}>
                      Selecione os horários em {formatDateBR(dataBloqueioSelecionada)}:
                    </label>

                    {temMultiplasQuadras && (
                      <div className="rh-quadras-badge">
                        <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                          {totalQuadrasNoGrupo} quadras:
                        </span>

                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "var(--font-sm)" }}>
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
                          <span style={{ color: "var(--color-text)", fontWeight: 500 }}>Todas</span>
                        </label>

                        {!bloquearTodasQuadras && (
                          <select
                            value={quantidadeQuadrasBloquear}
                            onChange={(e) => setQuantidadeQuadrasBloquear(Number(e.target.value))}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-md)",
                              fontSize: "var(--font-sm)",
                              outline: "none",
                              backgroundColor: "var(--color-surface)",
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
                    <div className="rh-blocked-alert">
                      <div className="rh-blocked-alert-title">Este dia possui bloqueios</div>
                      <button
                        type="button"
                        className="btn-danger-solid"
                        onClick={handleDesbloquearDiaInteiro}
                        disabled={removendoBloqueio}
                        style={{ padding: "8px 16px", fontSize: "var(--font-sm)" }}
                      >
                        {removendoBloqueio ? "Desbloqueando..." : "Desbloquear Dia Inteiro"}
                      </button>
                    </div>
                  )}

                  <div className="rh-horarios-grid">
                    {Array.from({ length: 18 }, (_, i) => {
                      const hora = i + 6;
                      const horario = String(hora).padStart(2, "0") + ":00";
                      const isSelecionado = horariosBloqueio.includes(horario);
                      const isBloqueado = horariosBloqueados.includes(horario);

                      let cls = "rh-horario-btn";
                      if (isBloqueado) cls += " rh-horario-btn--blocked";
                      else if (isSelecionado) cls += " rh-horario-btn--selected";

                      return (
                        <button
                          key={horario}
                          type="button"
                          className={cls}
                          onClick={() => toggleHorarioBloqueio(horario)}
                          disabled={isOperando}
                        >
                          {horario}
                          {isBloqueado && !isSelecionado && " (bloqueado)"}
                        </button>
                      );
                    })}
                  </div>

                  <div className="rh-action-bar">
                    {horariosBloqueio.length > 0 && (
                      <>
                        {horariosBloqueio.some(h => horariosBloqueados.includes(h)) ? (
                          <button
                            type="button"
                            className="btn-danger-solid"
                            onClick={handleDesbloquearHorarios}
                            disabled={isOperando}
                            style={{ padding: "10px 20px" }}
                          >
                            {removendoBloqueio ? "Desbloqueando..." : `Desbloquear ${horariosBloqueio.length} horário(s)`}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-brand"
                            onClick={handleSalvarBloqueios}
                            disabled={isOperando}
                            style={{ padding: "10px 20px" }}
                          >
                            {salvandoBloqueio ? "Bloqueando..." : `Bloquear ${horariosBloqueio.length} horário(s)`}
                          </button>
                        )}
                      </>
                    )}

                    {!diaEstaBloqueado && (
                      <button
                        type="button"
                        className="btn-danger-solid"
                        onClick={handleBloquearDiaInteiro}
                        disabled={isOperando}
                        style={{ padding: "10px 20px" }}
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

export default GestorBloqueiosPage;
