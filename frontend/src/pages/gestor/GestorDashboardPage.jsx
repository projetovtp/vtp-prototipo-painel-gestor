import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/useDevice";
import { ConfirmacaoModal, ErrorMessage } from "../../components/ui";
import { HistoricoModal } from "../../components/modals";
import { DashboardKpis, DashboardReservas, DashboardInbox } from "../../components/dashboard";
import { gerarReservasExemplo, gerarMockHistoricoContato, mockQuadrasConfig } from "../../mocks/mockDashboard";
import { useGestorDashboard } from "../../hooks/api/useGestorDashboard";
import { useGestorReservas } from "../../hooks/api/useGestorReservas";
import { useGestorQuadras } from "../../hooks/api/useGestorQuadras";
import { useGestorAgenda } from "../../hooks/api/useGestorAgenda";
import { agregarSlotsGrupo, formatarNomeQuadra, toISODate } from "../../utils/formatters";
import { podeCancelar } from "../../utils/validacoes";
import SlotCard from "../../components/ui/SlotCard";


const GestorDashboardPage = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();

  const { kpis, obterKpis } = useGestorDashboard();
  const { listar: listarReservas, loading: carregandoReservas } = useGestorReservas();
  const { listar: listarQuadras } = useGestorQuadras();
  const { listarRegras } = useGestorAgenda();

  const [reservas, setReservas] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [regrasHorarios, setRegrasHorarios] = useState([]);

  const [dataSelecionada, setDataSelecionada] = useState(() => toISODate(new Date()));
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [contatoHistorico, setContatoHistorico] = useState(null);
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isMobile || isTablet) {
      navigate("/gestor/mensagens", { replace: true });
    }
  }, [isMobile, isTablet, navigate]);

  const carregarReservas = useCallback(async () => {
    try {
      const dados = await listarReservas();
      setReservas(dados?.reservas || []);
      let quadrasCarregadas = dados?.quadras || [];

      const quadrasExpandidas = [];
      const quadrasPorNome = {};
      quadrasCarregadas.forEach((quadra) => {
        const nome = formatarNomeQuadra(quadra);
        if (!quadrasPorNome[nome]) quadrasPorNome[nome] = [];
        quadrasPorNome[nome].push(quadra);
      });

      Object.entries(quadrasPorNome).forEach(([nomeQuadra, quadrasGrupo]) => {
        if (nomeQuadra.includes("Beach tennis") || nomeQuadra.includes("Beach Tennis")) {
          quadrasGrupo.forEach((q, i) => { q.indexInGroup = i; });
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 6; i++) {
            quadrasExpandidas.push({ ...primeira, id: `beach-tennis-${i + 1}-${primeira.id}`, originalId: primeira.id, indexInGroup: i });
          }
        }
        if (nomeQuadra.includes("Pádel") || nomeQuadra.includes("Padel")) {
          quadrasGrupo.forEach((q, i) => { q.indexInGroup = i; });
          const primeira = quadrasGrupo[0];
          for (let i = quadrasGrupo.length; i < 3; i++) {
            quadrasExpandidas.push({ ...primeira, id: `padel-${i + 1}-${primeira.id}`, originalId: primeira.id, indexInGroup: i });
          }
        }
      });

      setQuadras([...quadrasCarregadas, ...quadrasExpandidas]);
    } catch (error) {
      console.error("[RESERVAS] Erro ao carregar:", error);
    }
  }, [listarReservas]);

  const carregarRegrasHorarios = useCallback(async () => {
    try {
      const quadrasData = await listarQuadras();
      const quadrasArr = Array.isArray(quadrasData) ? quadrasData : quadrasData?.quadras || [];
      const todasRegras = [];
      for (const quadra of quadrasArr) {
        try {
          const regrasData = await listarRegras({ quadraId: quadra.id });
          const lista = regrasData?.regras || (Array.isArray(regrasData) ? regrasData : []);
          lista.forEach((regra) => todasRegras.push({ ...regra, quadra_id: quadra.id }));
        } catch (error) {
          console.error(`[REGRAS] Erro quadra ${quadra.id}:`, error);
        }
      }
      setRegrasHorarios(todasRegras);
    } catch (error) {
      console.error("[REGRAS] Erro:", error);
    }
  }, [listarQuadras, listarRegras]);

  useEffect(() => {
    const id = setTimeout(() => {
      obterKpis();
      carregarReservas();
      carregarRegrasHorarios();
    });
    return () => clearTimeout(id);
  }, [obterKpis, carregarReservas, carregarRegrasHorarios]);

  const slotsPorQuadra = useMemo(() => {
    if (!dataSelecionada || quadras.length === 0) return {};
    const slotsAgrupados = {};
    const data = new Date(`${dataSelecionada}T12:00:00`);
    const diaSemana = data.getDay();
    const horarios = [];
    for (let h = 8; h <= 22; h++) {
      horarios.push({ hora: `${String(h).padStart(2, "0")}:00`, hora_fim: `${String(h + 1).padStart(2, "0")}:00` });
    }
    for (const quadra of quadras) {
      let regrasQ = regrasHorarios.filter((r) => r.quadra_id === quadra.id && r.dia_semana === diaSemana);
      if (regrasQ.length === 0 && quadra.originalId) {
        regrasQ = regrasHorarios.filter((r) => r.quadra_id === quadra.originalId && r.dia_semana === diaSemana);
      }
      const slots = [];
      for (const hor of horarios) {
        const regra = regrasQ.find((r) => {
          const hi = parseInt(r.hora_inicio?.split(":")[0] || 0);
          const hf = parseInt(r.hora_fim?.split(":")[0] || 0);
          const hs = parseInt(hor.hora.split(":")[0]);
          return hs >= hi && hs < hf;
        });
        const precoHora = regra ? (regra.valor || 100) : 100;
        const reservaReal = reservas.find((r) => {
          const rd = r.data?.split("T")[0] || r.data;
          const rh = r.hora || "";
          return r.quadra_id === quadra.id && rd === dataSelecionada && rh.startsWith(hor.hora.split(":")[0]);
        });
        const exemplo = (reservaReal || !import.meta.env.DEV) ? null : gerarReservasExemplo(quadra, dataSelecionada, hor.hora, reservas);
        const statusFinal = reservaReal ? "RESERVADO" : (exemplo?.status || "DISPONIVEL");
        const reservaFinal = reservaReal
          ? { ...reservaReal, quadra, nome: reservaReal.nome || reservaReal.usuario_nome || reservaReal.user_name || "Cliente" }
          : (exemplo?.reserva ? { ...exemplo.reserva, quadra } : null);
        slots.push({ ...hor, quadra_id: quadra.id, preco_hora: precoHora, status: statusFinal, reserva: reservaFinal });
      }
      if (slots.length > 0) slotsAgrupados[quadra.id] = slots;
    }
    return slotsAgrupados;
  }, [dataSelecionada, quadras, regrasHorarios, reservas]);

  const handleReservaChanged = () => {
    carregarReservas();
  };

  const gruposQuadras = useMemo(() => {
    const grupos = {};
    quadras.forEach((q) => {
      const nome = formatarNomeQuadra(q);
      if (!grupos[nome]) grupos[nome] = [];
      grupos[nome].push(q);
    });
    return grupos;
  }, [quadras]);

  const gruposFiltrados = useMemo(() => {
    if (!quadraSelecionadaId) return gruposQuadras;

    if (import.meta.env.DEV) {
      const configIndex = mockQuadrasConfig.findIndex((q) => q.id === quadraSelecionadaId);
      if (configIndex >= 0) {
        const grupoEntries = Object.entries(gruposQuadras);
        if (configIndex < grupoEntries.length) {
          const [nome, quadrasGrupo] = grupoEntries[configIndex];
          return { [nome]: quadrasGrupo };
        }
        return gruposQuadras;
      }
    }

    const sel = quadras.find((q) => q.id === quadraSelecionadaId);
    if (!sel) return gruposQuadras;
    const nome = formatarNomeQuadra(sel);
    return { [nome]: gruposQuadras[nome] || [] };
  }, [quadraSelecionadaId, gruposQuadras, quadras]);

  const gruposComSlots = useMemo(() => {
    if (!dataSelecionada || Object.keys(gruposFiltrados).length === 0) return [];
    return Object.entries(gruposFiltrados)
      .map(([nomeGrupo, qg]) => {
        if (!qg || qg.length === 0) return null;
        return { nomeGrupo, quadrasGrupo: qg, totalQuadras: qg.length, slotsAgregados: agregarSlotsGrupo(qg, slotsPorQuadra) };
      })
      .filter(Boolean);
  }, [gruposFiltrados, dataSelecionada, slotsPorQuadra]);

  const abrirHistoricoContato = async (contato) => {
    try {
      setContatoHistorico(contato);
      setModalHistoricoAberto(true);
      setCarregandoHistorico(true);
      setHistoricoReservas([]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (import.meta.env.DEV) setHistoricoReservas(gerarMockHistoricoContato());
      setCarregandoHistorico(false);
    } catch (error) {
      console.error("[HISTÓRICO] Erro:", error);
      setCarregandoHistorico(false);
    }
  };

  const fecharHistorico = () => {
    setModalHistoricoAberto(false);
    setContatoHistorico(null);
    setHistoricoReservas([]);
  };

  const confirmarCancelamento = async () => {
    if (!reservaParaCancelar) return;
    try {
      setHistoricoReservas((prev) =>
        prev.map((r) => r.id === reservaParaCancelar.id ? { ...r, status: "canceled" } : r)
      );
      setModalConfirmacaoAberto(false);
      setReservaParaCancelar(null);
    } catch (error) {
      console.error("[CANCELAR] Erro:", error);
      setErro("Erro ao cancelar reserva. Tente novamente.");
    }
  };

  return (
    <div className="page" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ErrorMessage mensagem={erro} onDismiss={() => setErro("")} />
      <div className="dash-grid">
        <DashboardKpis kpis={kpis} />

        <DashboardReservas
          dataSelecionada={dataSelecionada}
          onDataChange={setDataSelecionada}
          quadraSelecionadaId={quadraSelecionadaId}
          onQuadraChange={setQuadraSelecionadaId}
          gruposComSlots={gruposComSlots}
          carregandoReservas={carregandoReservas}
          quadras={quadras}
          onReservaChanged={handleReservaChanged}
        />

        <DashboardInbox onAbrirHistorico={abrirHistoricoContato} />
      </div>

      <HistoricoModal
        aberto={modalHistoricoAberto}
        subtitulo={contatoHistorico ? `${contatoHistorico.nome} • ${contatoHistorico.telefone}` : ""}
        infoTelefone={contatoHistorico?.telefone}
        historico={historicoReservas}
        carregando={carregandoHistorico}
        onFechar={fecharHistorico}
        onCancelar={(r) => { setReservaParaCancelar(r); setModalConfirmacaoAberto(true); }}
        podeCancelar={podeCancelar}
      />

      <ConfirmacaoModal
        aberto={modalConfirmacaoAberto}
        reserva={reservaParaCancelar}
        onFechar={() => { setModalConfirmacaoAberto(false); setReservaParaCancelar(null); }}
        onConfirmar={confirmarCancelamento}
      />
    </div>
  );
};

export default GestorDashboardPage;
