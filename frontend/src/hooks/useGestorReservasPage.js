import { useEffect, useState, useMemo, useCallback } from "react";
import { useGestorReservas, useGestorQuadras, useGestorAgenda } from "./api";
import { formatarNomeQuadra, agregarSlotsGrupo } from "../utils/formatters";

export function useGestorReservasPage() {
  const { listar: listarReservasApi, obterGrade } = useGestorReservas();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras } = useGestorAgenda();

  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);
  const [slotsPorQuadra, setSlotsPorQuadra] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [erro, setErro] = useState("");

  const [modoVisualizacao, setModoVisualizacao] = useState("dia");
  const [dataSelecionada, setDataSelecionada] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [diaClicado, setDiaClicado] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const carregarSlotsTodasQuadras = useCallback(async (dataISO) => {
    if (!dataISO) {
      setSlotsPorQuadra({});
      return;
    }
    setCarregandoSlots(true);
    try {
      const data = await obterGrade({ data: dataISO });
      setSlotsPorQuadra(data || {});
    } catch (error) {
      console.error("[SLOTS] Erro ao carregar grade:", error);
    } finally {
      setCarregandoSlots(false);
    }
  }, [obterGrade]);

  useEffect(() => {
    carregarReservas();
    carregarRegrasHorarios();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modoVisualizacao === "dia") {
      carregarSlotsTodasQuadras(dataSelecionada);
    } else if (diaClicado) {
      carregarSlotsTodasQuadras(diaClicado);
    }
  }, [modoVisualizacao, dataSelecionada, diaClicado, carregarSlotsTodasQuadras]);

  const carregarReservas = async () => {
    try {
      setCarregando(true);
      setErro("");
      const dados = await listarReservasApi() || {};
      setReservas(dados.reservas || []);
      const quadrasCarregadas = dados.quadras || [];
      setQuadras(quadrasCarregadas);
      if (!dados.reservas || dados.reservas.length === 0) {
        setDataSelecionada(new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
      setErro(error?.response?.data?.error || "Erro ao carregar reservas.");
    } finally {
      setCarregando(false);
    }
  };

  const carregarRegrasHorarios = async () => {
    try {
      const dataQuadras = await listarQuadrasApi();
      const quadrasData = Array.isArray(dataQuadras) ? dataQuadras : dataQuadras?.quadras || [];
      const todasRegras = [];
      for (const quadra of quadrasData) {
        try {
          const dataRegras = await listarRegras({ quadraId: quadra.id });
          const regras = dataRegras?.regras || [];
          regras.forEach(regra => todasRegras.push({ ...regra, quadra_id: quadra.id }));
        } catch {
          // continua para próxima quadra
        }
      }
      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro ao carregar regras:", error);
    }
  };

  const dataTemRegras = useCallback((dataISO) => {
    if (!dataISO || regrasHorarios.length === 0) return false;
    const data = new Date(`${dataISO}T12:00:00`);
    return regrasHorarios.some(regra => regra.dia_semana === data.getDay());
  }, [regrasHorarios]);

  const gruposQuadras = useMemo(() => {
    const grupos = {};
    quadras.forEach((quadra) => {
      const nome = formatarNomeQuadra(quadra);
      if (!grupos[nome]) grupos[nome] = [];
      grupos[nome].push(quadra);
    });
    return grupos;
  }, [quadras]);

  const agregarSlots = useCallback(
    (quadrasGrupo) => agregarSlotsGrupo(quadrasGrupo, slotsPorQuadra),
    [slotsPorQuadra]
  );

  const avancarMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  const retrocederMes = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));

  const irParaHoje = () => {
    const hoje = new Date();
    setDataSelecionada(hoje.toISOString().split("T")[0]);
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaClicado(null);
  };

  const abrirModal = (dadosReserva) => {
    setReservaSelecionada(dadosReserva);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setReservaSelecionada(null);
  };

  const handleMudanca = () => {
    carregarReservas();
    const dataSlots = modoVisualizacao === "dia" ? dataSelecionada : diaClicado;
    if (dataSlots) carregarSlotsTodasQuadras(dataSlots);
  };

  return {
    reservas,
    quadras,
    carregando,
    carregandoSlots,
    erro, setErro,
    modoVisualizacao, setModoVisualizacao,
    dataSelecionada, setDataSelecionada,
    mesAtual,
    diaClicado, setDiaClicado,
    modalAberto,
    reservaSelecionada,
    gruposQuadras,
    agregarSlots,
    dataTemRegras,
    avancarMes, retrocederMes, irParaHoje,
    abrirModal, fecharModal, handleMudanca,
  };
}
