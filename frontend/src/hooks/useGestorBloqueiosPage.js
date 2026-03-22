import { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "./api";
import { useAuth } from "../context/AuthContext";
import { formatarNomeQuadra } from "../utils/formatters";
import {
  gerarDiasDoMes,
  getGrupoQuadra,
  getHorariosBloqueados,
  getQuadrasParaBloquear,
} from "../utils/agenda";

export function useGestorBloqueiosPage() {
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

  // --- Helpers privados ---
  function resetSelecao() {
    setDataBloqueioSelecionada("");
    setHorariosBloqueio([]);
    setBloquearTodasQuadras(false);
    setQuantidadeQuadrasBloquear(1);
  }

  function mostrarMensagem(texto) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3000);
  }

  function resolverQuadrasAlvo() {
    const grupo = getGrupoQuadra(quadras, quadraSelecionadaId, formatarNomeQuadra);
    return getQuadrasParaBloquear(grupo, bloquearTodasQuadras, quantidadeQuadrasBloquear, quadraSelecionadaId);
  }

  // --- Effects ---
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

  // --- Loaders ---
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

  // --- Handlers unificados ---
  async function handleBloquear({ diaInteiro = false } = {}) {
    if (!dataBloqueioSelecionada) { setErro("Selecione uma data primeiro."); return; }
    if (!diaInteiro && horariosBloqueio.length === 0) { setErro("Selecione pelo menos um horário."); return; }

    try {
      setSalvandoBloqueio(true);
      setErro("");
      setMensagem("");
      const quadrasAlvo = resolverQuadrasAlvo();

      let horaInicio, horaFim, motivo;
      if (diaInteiro) {
        horaInicio = "00:00";
        horaFim = "23:59";
        motivo = "Bloqueio de dia inteiro";
      } else {
        const min = Math.min(...horariosBloqueio.map(h => parseInt(h.split(":")[0])));
        const max = Math.max(...horariosBloqueio.map(h => parseInt(h.split(":")[0]))) + 1;
        horaInicio = String(min).padStart(2, "0") + ":00";
        horaFim = String(max).padStart(2, "0") + ":00";
        motivo = "Bloqueio manual";
      }

      await criarBloqueiosLote({ quadraIds: quadrasAlvo, data: dataBloqueioSelecionada, horaInicio, horaFim, motivo });
      const msg = diaInteiro
        ? `Dia inteiro bloqueado em ${quadrasAlvo.length} quadra(s)!`
        : `Horários bloqueados em ${quadrasAlvo.length} quadra(s)!`;
      mostrarMensagem(msg);
      resetSelecao();
      await carregarBloqueios();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao salvar bloqueio.");
    } finally {
      setSalvandoBloqueio(false);
    }
  }

  async function handleDesbloquear({ diaInteiro = false } = {}) {
    if (!dataBloqueioSelecionada) { setErro("Selecione uma data primeiro."); return; }
    if (!diaInteiro && horariosBloqueio.length === 0) { setErro("Selecione pelo menos um horário."); return; }

    try {
      setRemovendoBloqueio(true);
      setErro("");
      setMensagem("");
      const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);

      let idsParaRemover;
      if (diaInteiro) {
        idsParaRemover = bloqueiosDoDia.map(b => b.id);
      } else {
        const ids = [];
        horariosBloqueio.forEach(horario => {
          const hora = parseInt(horario.split(":")[0]);
          const bloqueio = bloqueiosDoDia.find(b => {
            const hi = parseInt(b.hora_inicio?.split(":")[0] || 0);
            const hf = parseInt(b.hora_fim?.split(":")[0] || 23);
            return hora >= hi && hora < hf;
          });
          if (bloqueio) ids.push(bloqueio.id);
        });
        idsParaRemover = [...new Set(ids)];
      }

      await Promise.all(idsParaRemover.map(id => excluirBloqueio(id)));
      mostrarMensagem(diaInteiro ? "Dia inteiro desbloqueado!" : "Horários desbloqueados!");
      resetSelecao();
      await carregarBloqueios();
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao desbloquear.");
    } finally {
      setRemovendoBloqueio(false);
    }
  }

  function toggleHorarioBloqueio(horario) {
    setHorariosBloqueio(prev =>
      prev.includes(horario) ? prev.filter(h => h !== horario) : [...prev, horario]
    );
  }

  // --- Dados derivados ---
  const diasDoMes = gerarDiasDoMes(mesBloqueio, bloqueios);
  const horariosBloqueados = getHorariosBloqueados(bloqueios, dataBloqueioSelecionada);
  const diaEstaBloqueado = bloqueios.some(b => b.data === dataBloqueioSelecionada);
  const grupoQuadras = getGrupoQuadra(quadras, quadraSelecionadaId, formatarNomeQuadra);
  const totalQuadrasNoGrupo = grupoQuadras ? grupoQuadras.length : 1;
  const temMultiplasQuadras = totalQuadrasNoGrupo > 1;

  return {
    quadras, bloqueios, carregando, erro, mensagem,
    quadraSelecionadaId, setQuadraSelecionadaId,
    mesBloqueio, setMesBloqueio,
    dataBloqueioSelecionada, setDataBloqueioSelecionada,
    horariosBloqueio, setHorariosBloqueio, toggleHorarioBloqueio,
    bloquearTodasQuadras, setBloquearTodasQuadras,
    quantidadeQuadrasBloquear, setQuantidadeQuadrasBloquear,
    salvandoBloqueio, removendoBloqueio,
    isOperando: salvandoBloqueio || removendoBloqueio,
    handleBloquear, handleDesbloquear, setErro,
    diasDoMes, horariosBloqueados, diaEstaBloqueado,
    totalQuadrasNoGrupo, temMultiplasQuadras,
  };
}
