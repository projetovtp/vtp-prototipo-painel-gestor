import { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "./api/index";
import { useAuth } from "../context/AuthContext";
import { parsePrecoBRL } from "../utils/formatters";
import { DIAS_SEMANA_REGRAS } from "../utils/constants";
import { validarRegraHorario } from "../utils/validacoes";
import { tratarErroRegra } from "../utils/errors";

export default function useGestorAgendaPage() {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const { listarRegras, criarRegra, editarRegra: editarRegraApi, excluirRegra } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [regras, setRegras] = useState([]);

  const [regraForm, setRegraForm] = useState({
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
    precoHora: ""
  });
  const [regraEditandoId, setRegraEditandoId] = useState(null);
  const [regraEditando, setRegraEditando] = useState(null);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalLimparTodasAberto, setModalLimparTodasAberto] = useState(false);
  const [modalExcluirRegra, setModalExcluirRegra] = useState({ aberto: false, regraId: null });
  const [modalLimparDia, setModalLimparDia] = useState({ aberto: false, diaSemana: null, diaNome: "" });
  const [modalRemoverDoModal, setModalRemoverDoModal] = useState(false);
  const [salvandoRegra, setSalvandoRegra] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!usuario) return;
    carregarQuadras();
  }, [usuario]);

  useEffect(() => {
    if (quadraSelecionadaId) {
      carregarRegras();
    } else {
      setRegras([]);
    }
  }, [quadraSelecionadaId]);

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const data = await listarQuadrasApi();
      const quadrasData = Array.isArray(data) ? data : [];
      setQuadras(quadrasData);
      if (quadrasData.length > 0 && !quadraSelecionadaId) {
        setQuadraSelecionadaId(quadrasData[0].id);
      }
    } catch (err) {
      console.error("[AGENDA] Erro ao carregar quadras:", err);
      setErro("Erro ao carregar quadras.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRegras() {
    if (!quadraSelecionadaId) return;
    try {
      setCarregando(true);
      setErro("");
      const dataRegras = await listarRegras({ quadraId: quadraSelecionadaId });
      setRegras(dataRegras?.regras || []);
    } catch (err) {
      console.error("[AGENDA] Erro ao carregar regras:", err);
      setErro("Erro ao carregar regras.");
    } finally {
      setCarregando(false);
    }
  }

  function toggleDiaSemana(diaValor) {
    setRegraForm(prev => {
      const diasAtuais = prev.diasSemana || [];
      if (diasAtuais.includes(diaValor)) {
        return { ...prev, diasSemana: diasAtuais.filter(d => d !== diaValor) };
      }
      return { ...prev, diasSemana: [...diasAtuais, diaValor] };
    });
  }

  async function handleSalvarRegra(e) {
    e.preventDefault();
    if (!quadraSelecionadaId) {
      setErro("Selecione uma quadra antes de criar a regra.");
      return;
    }
    if (!regraForm.diasSemana || regraForm.diasSemana.length === 0) {
      setErro("Selecione pelo menos um dia da semana.");
      return;
    }
    const erroValidacao = validarRegraHorario(regraForm);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    const preco = parsePrecoBRL(regraForm.precoHora);
    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");
      const diasSemanaValidos = regraForm.diasSemana.filter(d =>
        !isNaN(Number(d)) && Number(d) >= 0 && Number(d) <= 6
      );
      if (diasSemanaValidos.length === 0) {
        setErro("Selecione pelo menos um dia da semana válido.");
        setSalvandoRegra(false);
        return;
      }
      if (regraEditandoId) {
        await editarRegraApi(regraEditandoId, {
          quadraId: quadraSelecionadaId,
          diaSemana: Number(regraForm.diasSemana[0]),
          horaInicio: regraForm.horaInicio,
          horaFim: regraForm.horaFim,
          precoHora: preco,
          ativo: true
        });
        setMensagem("Regra atualizada com sucesso!");
      } else {
        await Promise.all(diasSemanaValidos.map(diaSemanaNum =>
          criarRegra({
            quadraId: quadraSelecionadaId,
            diaSemana: Number(diaSemanaNum),
            horaInicio: regraForm.horaInicio,
            horaFim: regraForm.horaFim,
            precoHora: preco,
            ativo: true
          })
        ));
        const diasNomes = diasSemanaValidos.map(d => {
          const dia = DIAS_SEMANA_REGRAS.find(ds => ds.valor === Number(d));
          return dia ? dia.nome : d;
        }).join(", ");
        setMensagem(`Regras criadas com sucesso para: ${diasNomes}!`);
      }
      resetRegraForm();
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar regra:", err);
      setErro(tratarErroRegra(err));
    } finally {
      setSalvandoRegra(false);
    }
  }

  function iniciarEdicaoRegra(regra) {
    setRegraEditando(regra);
    setRegraEditandoId(regra.id);
    setRegraForm({
      diasSemana: [regra.dia_semana],
      horaInicio: regra.hora_inicio,
      horaFim: regra.hora_fim,
      precoHora: regra.preco_hora ? String(regra.preco_hora) : ""
    });
    setModalEdicaoAberto(true);
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false);
    setRegraEditando(null);
    resetRegraForm();
  }

  async function handleSalvarEdicaoModal(e) {
    e.preventDefault();
    if (!regraEditando) return;
    const erroValidacao = validarRegraHorario(regraForm);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");
      const preco = parsePrecoBRL(regraForm.precoHora);
      await editarRegraApi(regraEditandoId, {
        quadraId: quadraSelecionadaId,
        diaSemana: regraEditando.dia_semana,
        horaInicio: regraForm.horaInicio,
        horaFim: regraForm.horaFim,
        precoHora: preco,
        ativo: true
      });
      setMensagem("Regra atualizada com sucesso!");
      fecharModalEdicao();
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar edição:", err);
      setErro(tratarErroRegra(err));
    } finally {
      setSalvandoRegra(false);
    }
  }

  async function handleRemoverDoModal() {
    if (!regraEditando) return;
    try {
      setErro("");
      setMensagem("");
      setModalRemoverDoModal(false);
      fecharModalEdicao();
      await excluirRegra(regraEditando.id);
      setMensagem("Regra removida com sucesso!");
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      setErro(tratarErroRegra(err));
    }
  }

  async function handleExcluirRegra() {
    const regraId = modalExcluirRegra.regraId;
    if (!regraId) {
      setErro("ID da regra não informado.");
      return;
    }
    try {
      setErro("");
      setMensagem("");
      setModalExcluirRegra({ aberto: false, regraId: null });
      await excluirRegra(regraId);
      setMensagem("Regra removida com sucesso!");
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      setErro(tratarErroRegra(err));
    }
  }

  function abrirModalLimparTodas() {
    if (regras.length === 0) {
      setErro("Não há regras para remover.");
      return;
    }
    setModalLimparTodasAberto(true);
  }

  async function handleLimparTodasRegras() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setModalLimparTodasAberto(false);
      await Promise.all(regras.map(regra => excluirRegra(regra.id)));
      setMensagem(`Todas as ${regras.length} regras foram removidas com sucesso!`);
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao limpar regras:", err);
      setErro(tratarErroRegra(err));
    } finally {
      setCarregando(false);
    }
  }

  function abrirModalLimparDia(diaSemana) {
    const dia = DIAS_SEMANA_REGRAS.find(d => d.valor === diaSemana);
    setModalLimparDia({ aberto: true, diaSemana, diaNome: dia?.nome || "" });
  }

  async function handleLimparDia() {
    const { diaSemana, diaNome } = modalLimparDia;
    const regrasDoDia = regras.filter(r => r.dia_semana === diaSemana);
    if (regrasDoDia.length === 0) {
      setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" });
      return;
    }
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");
      setModalLimparDia({ aberto: false, diaSemana: null, diaNome: "" });
      await Promise.all(regrasDoDia.map(regra => excluirRegra(regra.id)));
      setMensagem(`Regras de ${diaNome} removidas com sucesso!`);
      await carregarRegras();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao limpar regras do dia:", err);
      setErro(tratarErroRegra(err));
    } finally {
      setCarregando(false);
    }
  }

  function resetRegraForm() {
    setRegraForm({ diasSemana: [], horaInicio: "", horaFim: "", precoHora: "" });
    setRegraEditandoId(null);
  }

  const regrasPorDia = DIAS_SEMANA_REGRAS.map(dia => ({
    ...dia,
    regras: regras.filter(r => r.dia_semana === dia.valor)
  }));

  return {
    // Estado
    quadras,
    quadraSelecionadaId,
    setQuadraSelecionadaId,
    regras,
    regraForm,
    setRegraForm,
    regraEditandoId,
    regraEditando,
    modalEdicaoAberto,
    modalLimparTodasAberto,
    modalExcluirRegra,
    setModalExcluirRegra,
    modalLimparDia,
    modalRemoverDoModal,
    setModalRemoverDoModal,
    salvandoRegra,
    carregando,
    erro,
    setErro,
    mensagem,
    regrasPorDia,

    // Handlers
    toggleDiaSemana,
    handleSalvarRegra,
    iniciarEdicaoRegra,
    fecharModalEdicao,
    handleSalvarEdicaoModal,
    handleRemoverDoModal,
    handleExcluirRegra,
    abrirModalLimparTodas,
    handleLimparTodasRegras,
    abrirModalLimparDia,
    handleLimparDia,
    resetRegraForm,

    setModalLimparDia,
    setModalLimparTodasAberto,
  };
}
