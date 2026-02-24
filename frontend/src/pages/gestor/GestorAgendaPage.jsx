import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

const DIAS_SEMANA = [
  { valor: 1, nome: "Segunda-feira", abreviacao: "Seg" },
  { valor: 2, nome: "Terça-feira", abreviacao: "Ter" },
  { valor: 3, nome: "Quarta-feira", abreviacao: "Qua" },
  { valor: 4, nome: "Quinta-feira", abreviacao: "Qui" },
  { valor: 5, nome: "Sexta-feira", abreviacao: "Sex" },
  { valor: 6, nome: "Sábado", abreviacao: "Sáb" },
  { valor: 0, nome: "Domingo", abreviacao: "Dom" }
];

export default function GestorAgendaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");
  const [regras, setRegras] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);

  // Form de regra
  const [regraForm, setRegraForm] = useState({
    diasSemana: [], // Array de dias selecionados
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
  const [salvandoRegra, setSalvandoRegra] = useState(false);

  // Calendário para bloqueios
  const [mesBloqueio, setMesBloqueio] = useState(new Date());
  const [horariosBloqueio, setHorariosBloqueio] = useState([]);
  const [dataBloqueioSelecionada, setDataBloqueioSelecionada] = useState("");
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);
  const [removendoBloqueio, setRemovendoBloqueio] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Carregar quadras
  useEffect(() => {
    if (!usuario) return;
    carregarQuadras();
  }, [usuario]);

  // Carregar regras e bloqueios quando quadra mudar
  useEffect(() => {
    if (quadraSelecionadaId) {
      carregarAgenda();
    } else {
      setRegras([]);
      setBloqueios([]);
    }
  }, [quadraSelecionadaId]);

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const { data } = await api.get("/gestor/quadras");
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

  async function carregarAgenda() {
    if (!quadraSelecionadaId) return;

    try {
      setCarregando(true);
      setErro("");

      const [respRegras, respBloqueios] = await Promise.all([
        api.get("/gestor/agenda/regras", { params: { quadraId: quadraSelecionadaId } }),
        api.get("/gestor/agenda/bloqueios", { params: { quadraId: quadraSelecionadaId } })
      ]);

      setRegras(respRegras.data?.regras || []);
      setBloqueios(respBloqueios.data?.bloqueios || []);
    } catch (err) {
      console.error("[AGENDA] Erro ao carregar agenda:", err);
      setErro("Erro ao carregar agenda.");
    } finally {
      setCarregando(false);
    }
  }

  // Gerar horários de hora em hora entre inicio e fim
  function gerarHorarios(horaInicio, horaFim) {
    const horarios = [];
    const inicio = parseInt(horaInicio.split(":")[0]);
    const fim = parseInt(horaFim.split(":")[0]);
    
    for (let h = inicio; h < fim; h++) {
      horarios.push(String(h).padStart(2, "0") + ":00");
    }
    
    return horarios;
  }

  function toggleDiaSemana(diaValor) {
    setRegraForm(prev => {
      const diasAtuais = prev.diasSemana || [];
      if (diasAtuais.includes(diaValor)) {
        return { ...prev, diasSemana: diasAtuais.filter(d => d !== diaValor) };
      } else {
        return { ...prev, diasSemana: [...diasAtuais, diaValor] };
      }
    });
  }

  async function handleSalvarRegra(e) {
    e.preventDefault();
    
    // Validações
    if (!quadraSelecionadaId) {
      setErro("Selecione uma quadra antes de criar a regra.");
      return;
    }

    if (!regraForm.diasSemana || regraForm.diasSemana.length === 0) {
      setErro("Selecione pelo menos um dia da semana.");
      return;
    }

    if (!regraForm.horaInicio || !regraForm.horaFim) {
      setErro("Preencha os horários inicial e final.");
      return;
    }

    // Validar formato de hora
    const horaInicioMatch = regraForm.horaInicio.match(/^(\d{2}):(\d{2})$/);
    const horaFimMatch = regraForm.horaFim.match(/^(\d{2}):(\d{2})$/);
    
    if (!horaInicioMatch || !horaFimMatch) {
      setErro("Formato de horário inválido. Use o formato HH:MM (ex: 08:00).");
      return;
    }

    const horaInicioNum = parseInt(regraForm.horaInicio.split(":")[0]);
    const horaFimNum = parseInt(regraForm.horaFim.split(":")[0]);
    const minutoInicio = parseInt(regraForm.horaInicio.split(":")[1]);
    const minutoFim = parseInt(regraForm.horaFim.split(":")[1]);

    // Validar que os minutos são 00 (hora cheia)
    if (minutoInicio !== 0 || minutoFim !== 0) {
      setErro("Os horários devem ser de hora em hora (ex: 08:00, 09:00). Minutos diferentes de 00 não são permitidos.");
      // Corrigir automaticamente
      const horaInicioCorrigida = String(horaInicioNum).padStart(2, "0") + ":00";
      const horaFimCorrigida = String(horaFimNum).padStart(2, "0") + ":00";
      setRegraForm({ ...regraForm, horaInicio: horaInicioCorrigida, horaFim: horaFimCorrigida });
      return;
    }

    if (horaInicioNum >= horaFimNum) {
      setErro("A hora final deve ser maior que a hora inicial.");
      return;
    }

    if (horaInicioNum < 0 || horaInicioNum > 23 || horaFimNum < 0 || horaFimNum > 23) {
      setErro("Os horários devem estar entre 00:00 e 23:00.");
      return;
    }

    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");

      // Validar dias da semana
      const diasSemanaValidos = regraForm.diasSemana.filter(d => 
        !isNaN(Number(d)) && Number(d) >= 0 && Number(d) <= 6
      );
      
      if (diasSemanaValidos.length === 0) {
        setErro("Selecione pelo menos um dia da semana válido.");
        setSalvandoRegra(false);
        return;
      }

      // Validar e normalizar preço (obrigatório)
      if (!regraForm.precoHora || regraForm.precoHora.trim() === "") {
        setErro("O preço por hora é obrigatório.");
        setSalvandoRegra(false);
        return;
      }

      const precoLimpo = String(regraForm.precoHora).replace(",", ".").trim();
      const precoHoraNum = Number(precoLimpo);
      
      if (isNaN(precoHoraNum) || precoHoraNum <= 0) {
        setErro("Preço por hora inválido. Informe um valor maior que zero (ex: 100 ou 100.50).");
        setSalvandoRegra(false);
        return;
      }

      if (regraEditandoId) {
        // Edição: criar regra para um único dia (o dia da regra sendo editada)
        const diaSemanaNum = Number(regraForm.diasSemana[0]);
        const payload = {
          quadraId: quadraSelecionadaId,
          diaSemana: diaSemanaNum,
          horaInicio: regraForm.horaInicio,
          horaFim: regraForm.horaFim,
          precoHora: precoHoraNum,
          ativo: true
        };
        const response = await api.put(`/gestor/agenda/regras/${regraEditandoId}`, payload);
        setMensagem("Regra atualizada com sucesso!");
      } else {
        // Criação: criar regras para todos os dias selecionados
        const promises = diasSemanaValidos.map(diaSemanaNum => {
          const payload = {
            quadraId: quadraSelecionadaId,
            diaSemana: Number(diaSemanaNum),
            horaInicio: regraForm.horaInicio,
            horaFim: regraForm.horaFim,
            precoHora: precoHoraNum,
            ativo: true
          };
          return api.post("/gestor/agenda/regras", payload);
        });

        await Promise.all(promises);
        const diasNomes = diasSemanaValidos.map(d => {
          const dia = DIAS_SEMANA.find(ds => ds.valor === Number(d));
          return dia ? dia.nome : d;
        }).join(", ");
        setMensagem(`Regras criadas com sucesso para: ${diasNomes}!`);
      }

      resetRegraForm();
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar regra:", err);
      console.error("[AGENDA] Detalhes do erro:", err.response?.data);
      
      // Tratamento específico de erros
      if (err.response?.status === 409) {
        setErro("Já existe uma regra para este dia e horário. Use a opção 'Editar' para modificar ou remova a regra existente.");
      } else if (err.response?.status === 400) {
        setErro(err.response?.data?.error || "Dados inválidos. Verifique os campos preenchidos.");
      } else if (err.response?.status === 403) {
        setErro("Você não tem permissão para criar regras nesta quadra.");
      } else if (err.response?.status === 404) {
        setErro("Quadra não encontrada.");
      } else {
        setErro(err.response?.data?.error || "Erro ao salvar regra. Tente novamente.");
      }
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

    // Validações
    if (!regraForm.horaInicio || !regraForm.horaFim) {
      setErro("Preencha os horários inicial e final.");
      return;
    }

    const horaInicioMatch = regraForm.horaInicio.match(/^(\d{2}):(\d{2})$/);
    const horaFimMatch = regraForm.horaFim.match(/^(\d{2}):(\d{2})$/);
    
    if (!horaInicioMatch || !horaFimMatch) {
      setErro("Formato de horário inválido. Use o formato HH:MM (ex: 08:00).");
      return;
    }

    const horaInicioNum = parseInt(regraForm.horaInicio.split(":")[0]);
    const horaFimNum = parseInt(regraForm.horaFim.split(":")[0]);
    const minutoInicio = parseInt(regraForm.horaInicio.split(":")[1]);
    const minutoFim = parseInt(regraForm.horaFim.split(":")[1]);

    if (minutoInicio !== 0 || minutoFim !== 0) {
      setErro("Os horários devem ser de hora em hora (ex: 08:00, 09:00).");
      return;
    }

    if (horaInicioNum >= horaFimNum) {
      setErro("A hora final deve ser maior que a hora inicial.");
      return;
    }

    if (!regraForm.precoHora || regraForm.precoHora.trim() === "") {
      setErro("O preço por hora é obrigatório.");
      return;
    }

    try {
      setSalvandoRegra(true);
      setErro("");
      setMensagem("");

      const precoLimpo = String(regraForm.precoHora).replace(",", ".").trim();
      const precoHoraNum = Number(precoLimpo);
      
      if (isNaN(precoHoraNum) || precoHoraNum <= 0) {
        setErro("Preço por hora inválido. Informe um valor maior que zero.");
        setSalvandoRegra(false);
        return;
      }

      const payload = {
        quadraId: quadraSelecionadaId,
        diaSemana: regraEditando.dia_semana,
        horaInicio: regraForm.horaInicio,
        horaFim: regraForm.horaFim,
        precoHora: precoHoraNum,
        ativo: true
      };

      await api.put(`/gestor/agenda/regras/${regraEditandoId}`, payload);
      setMensagem("Regra atualizada com sucesso!");
      fecharModalEdicao();
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar edição:", err);
      if (err.response?.status === 409) {
        setErro("Já existe uma regra para este dia e horário.");
      } else if (err.response?.status === 400) {
        setErro(err.response?.data?.error || "Dados inválidos.");
      } else {
        setErro(err.response?.data?.error || "Erro ao atualizar regra.");
      }
    } finally {
      setSalvandoRegra(false);
    }
  }

  const [modalRemoverDoModal, setModalRemoverDoModal] = useState(false);

  function abrirModalRemoverDoModal() {
    setModalRemoverDoModal(true);
  }

  function fecharModalRemoverDoModal() {
    setModalRemoverDoModal(false);
  }

  async function handleRemoverDoModal() {
    if (!regraEditando) return;

    try {
      setErro("");
      setMensagem("");
      fecharModalRemoverDoModal();
      fecharModalEdicao();

      await api.delete(`/gestor/agenda/regras/${regraEditando.id}`);
      
      setMensagem("Regra removida com sucesso!");
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      setErro(err.response?.data?.error || "Erro ao remover regra.");
    }
  }

  function resetRegraForm() {
    setRegraForm({
      diasSemana: [],
      horaInicio: "",
      horaFim: "",
      precoHora: ""
    });
    setRegraEditandoId(null);
  }

  function abrirModalExcluirRegra(regraId) {
    setModalExcluirRegra({ aberto: true, regraId });
  }

  function fecharModalExcluirRegra() {
    setModalExcluirRegra({ aberto: false, regraId: null });
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
      fecharModalExcluirRegra();

      // O backend não precisa de dados no body, apenas o ID na URL
      await api.delete(`/gestor/agenda/regras/${regraId}`);
      
      setMensagem("Regra removida com sucesso!");
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao excluir regra:", err);
      console.error("[AGENDA] Detalhes do erro:", err.response?.data);
      
      // Tratamento específico de erros
      if (err.response?.status === 404) {
        setErro("Regra não encontrada. Ela pode já ter sido removida.");
      } else if (err.response?.status === 403) {
        setErro("Você não tem permissão para remover esta regra.");
      } else {
        setErro(err.response?.data?.error || "Erro ao remover regra. Tente novamente.");
      }
    }
  }

  function abrirModalLimparTodas() {
    if (regras.length === 0) {
      setErro("Não há regras para remover.");
      return;
    }
    setModalLimparTodasAberto(true);
  }

  function fecharModalLimparTodas() {
    setModalLimparTodasAberto(false);
  }

  async function handleLimparTodasRegras() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");
      fecharModalLimparTodas();

      // Deletar todas as regras em paralelo
      await Promise.all(
        regras.map(regra =>
          api.delete(`/gestor/agenda/regras/${regra.id}`, {
            data: { quadraId: quadraSelecionadaId }
          })
        )
      );

      setMensagem(`Todas as ${regras.length} regras foram removidas com sucesso!`);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao limpar regras:", err);
      setErro(err.response?.data?.error || "Erro ao remover regras. Tente novamente.");
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

      const payload = {
        quadraIds: [quadraSelecionadaId],
        data: dataBloqueioSelecionada,
        horaInicio: String(horaInicio).padStart(2, "0") + ":00",
        horaFim: String(horaFim).padStart(2, "0") + ":00",
        motivo: "Bloqueio manual"
      };

      await api.post("/gestor/agenda/bloqueios/lote", payload);
      setMensagem("Horários bloqueados com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao salvar bloqueio:", err);
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

      const payload = {
        quadraIds: [quadraSelecionadaId],
        data: dataBloqueioSelecionada,
        horaInicio: "00:00",
        horaFim: "23:59",
        motivo: "Bloqueio de dia inteiro"
      };

      await api.post("/gestor/agenda/bloqueios/lote", payload);
      setMensagem("Dia inteiro bloqueado com sucesso!");
      setDataBloqueioSelecionada("");
      setHorariosBloqueio([]);
      await carregarAgenda();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      console.error("[AGENDA] Erro ao bloquear dia inteiro:", err);
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
      console.error("[AGENDA] Erro ao desbloquear horários:", err);
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
      console.error("[AGENDA] Erro ao desbloquear dia inteiro:", err);
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

  const regrasPorDia = DIAS_SEMANA.map(dia => ({
    ...dia,
    regras: regras.filter(r => r.dia_semana === dia.valor)
  }));

  const diasDoMes = gerarDiasDoMes();
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Regra de Horários</h1>
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

      {!quadraSelecionadaId && (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Selecione uma quadra para configurar a agenda
        </div>
      )}

      {quadraSelecionadaId && (
        <>
          {/* Regras de Horários */}
          <div className="card" style={{ marginTop: 0, marginBottom: 24 }}>
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
                  onChange={(e) => setQuadraSelecionadaId(e.target.value)}
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
                  onFocus={(e) => {
                    e.target.style.borderColor = "#37648c";
                    e.target.style.boxShadow = "0 0 0 3px rgba(55, 100, 140, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = "#d1d5db";
                    }
                  }}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  Regras de Horários
                </h3>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                  Configure os horários disponíveis de hora em hora. O sistema gerará automaticamente os horários entre o início e o fim informados.
                </p>
              </div>
              {regras.length > 0 && (
                <button
                  type="button"
                  onClick={abrirModalLimparTodas}
                  disabled={carregando}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: carregando ? "#d1d5db" : "#fee2e2",
                    color: carregando ? "#6b7280" : "#991b1b",
                    border: `1px solid ${carregando ? "#9ca3af" : "#fca5a5"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: carregando ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = "#fecaca";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = "#fee2e2";
                    }
                  }}
                >
                  {carregando ? (
                    <>
                      <span>Removendo...</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                      </svg>
                      Limpar Todas as Regras ({regras.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Form de Regra */}
            <form onSubmit={handleSalvarRegra} style={{ marginBottom: 24 }}>
              <div className="form-grid">
                <div className="form-field form-field-full">
                  <label>Dias da Semana {regraEditandoId && "(edição de uma regra específica)"}</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                    {DIAS_SEMANA.map(dia => {
                      const isSelecionado = regraForm.diasSemana.includes(dia.valor);
                      return (
                        <label
                          key={dia.valor}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 16px",
                            backgroundColor: isSelecionado ? "#37648c" : "#fff",
                            color: isSelecionado ? "#fff" : "#111827",
                            border: `2px solid ${isSelecionado ? "#37648c" : "#d1d5db"}`,
                            borderRadius: 8,
                            cursor: regraEditandoId ? "not-allowed" : "pointer",
                            fontSize: 14,
                            fontWeight: isSelecionado ? 600 : 500,
                            transition: "all 0.2s",
                            userSelect: "none",
                            opacity: regraEditandoId && !isSelecionado ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelecionado && !regraEditandoId) {
                              e.currentTarget.style.borderColor = "#37648c";
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelecionado && !regraEditandoId) {
                              e.currentTarget.style.borderColor = "#d1d5db";
                              e.currentTarget.style.backgroundColor = "#fff";
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelecionado}
                            onChange={() => toggleDiaSemana(dia.valor)}
                            disabled={!!regraEditandoId}
                            style={{ cursor: regraEditandoId ? "not-allowed" : "pointer" }}
                          />
                          <span>{dia.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                  <small style={{ marginTop: 8, display: "block" }}>
                    {regraEditandoId 
                      ? "Você está editando uma regra específica. Para criar regras em múltiplos dias, cancele a edição e crie uma nova regra."
                      : "Selecione um ou mais dias da semana. A mesma regra de horários será aplicada a todos os dias selecionados."}
                  </small>
                </div>

                <div className="form-field">
                  <label>Horário Inicial</label>
                  <input
                    type="time"
                    value={regraForm.horaInicio}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // Garantir que os minutos sejam sempre 00
                      if (valor) {
                        const [hora, minuto] = valor.split(":");
                        if (minuto && minuto !== "00") {
                          const horaCorrigida = `${hora}:00`;
                          setRegraForm({ ...regraForm, horaInicio: horaCorrigida });
                        } else {
                          setRegraForm({ ...regraForm, horaInicio: valor });
                        }
                      } else {
                        setRegraForm({ ...regraForm, horaInicio: valor });
                      }
                    }}
                    step="3600"
                    required
                  />
                  <small>Apenas horas cheias (ex: 08:00, 09:00). Minutos serão automaticamente definidos como 00.</small>
                </div>

                <div className="form-field">
                  <label>Horário Final</label>
                  <input
                    type="time"
                    value={regraForm.horaFim}
                    onChange={(e) => {
                      const valor = e.target.value;
                      // Garantir que os minutos sejam sempre 00
                      if (valor) {
                        const [hora, minuto] = valor.split(":");
                        if (minuto && minuto !== "00") {
                          const horaCorrigida = `${hora}:00`;
                          setRegraForm({ ...regraForm, horaFim: horaCorrigida });
                        } else {
                          setRegraForm({ ...regraForm, horaFim: valor });
                        }
                      } else {
                        setRegraForm({ ...regraForm, horaFim: valor });
                      }
                    }}
                    step="3600"
                    required
                  />
                  <small>Apenas horas cheias (ex: 22:00). O sistema criará horários até 21:00.</small>
                </div>

                <div className="form-field">
                  <label>Preço por Hora (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={regraForm.precoHora}
                    onChange={(e) => setRegraForm({ ...regraForm, precoHora: e.target.value })}
                    placeholder="Ex: 100.00"
                    required
                  />
                  <small>Campo obrigatório. Informe o valor por hora (ex: 100.00)</small>
                </div>
              </div>

              {regraForm.horaInicio && regraForm.horaFim && (
                <div style={{ marginTop: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                  <strong>Horários que serão criados:</strong>{" "}
                  {gerarHorarios(regraForm.horaInicio, regraForm.horaFim).join(", ")}
                </div>
              )}

              <div className="form-actions">
                {regraEditandoId && (
                  <button
                    type="button"
                    onClick={resetRegraForm}
                    className="btn-outlined"
                  >
                    Cancelar Edição
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={salvandoRegra}
                  style={{ backgroundColor: "#37648c", borderColor: "#37648c" }}
                >
                  {salvandoRegra ? "Salvando..." : regraEditandoId ? "Atualizar Regra" : "Criar Regra"}
                </button>
              </div>
            </form>

            {/* Lista de Regras por Dia */}
            {regrasPorDia.map(({ valor, nome, abreviacao, regras: regrasDia }) => {
              if (regrasDia.length === 0) return null;

              return (
                <div key={valor} style={{ marginBottom: 24, padding: 16, backgroundColor: "#f9fafb", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>{nome}</h4>
                    <button
                      type="button"
                      onClick={() => abrirModalLimparDia(valor)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fca5a5",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer"
                      }}
                    >
                      Limpar {nome}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {regrasDia.map(regra => {
                      const horarios = gerarHorarios(regra.hora_inicio, regra.hora_fim);
                      return (
                        <div
                          key={regra.id}
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#fff",
                            border: "2px solid #37648c",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 12
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                              {regra.hora_inicio} às {regra.hora_fim}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                              {regra.preco_hora ? formatBRL(regra.preco_hora) + "/hora" : "Sem preço definido"}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => iniciarEdicaoRegra(regra)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#37648c",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer"
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirModalExcluirRegra(regra.id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#fee2e2",
                                color: "#991b1b",
                                border: "1px solid #fca5a5",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer"
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {regras.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                Nenhuma regra cadastrada. Crie uma regra acima para começar.
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {modalEdicaoAberto && regraEditando && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalEdicao();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>
                Editar Regra de Horários
              </h3>
              <button
                type="button"
                onClick={fecharModalEdicao}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  color: "#6b7280"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: 16, padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: 8, fontSize: 14, color: "#6b7280" }}>
              <strong style={{ color: "#111827" }}>Dia da semana:</strong> {DIAS_SEMANA.find(d => d.valor === regraEditando.dia_semana)?.nome || "—"}
            </div>

            <form onSubmit={handleSalvarEdicaoModal}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                    Horário Inicial
                  </label>
                  <input
                    type="time"
                    value={regraForm.horaInicio}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (valor) {
                        const [hora, minuto] = valor.split(":");
                        if (minuto && minuto !== "00") {
                          const horaCorrigida = `${hora}:00`;
                          setRegraForm({ ...regraForm, horaInicio: horaCorrigida });
                        } else {
                          setRegraForm({ ...regraForm, horaInicio: valor });
                        }
                      } else {
                        setRegraForm({ ...regraForm, horaInicio: valor });
                      }
                    }}
                    step="3600"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 15,
                      outline: "none"
                    }}
                  />
                  <small style={{ display: "block", marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                    Apenas horas cheias (ex: 08:00, 09:00)
                  </small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                    Horário Final
                  </label>
                  <input
                    type="time"
                    value={regraForm.horaFim}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (valor) {
                        const [hora, minuto] = valor.split(":");
                        if (minuto && minuto !== "00") {
                          const horaCorrigida = `${hora}:00`;
                          setRegraForm({ ...regraForm, horaFim: horaCorrigida });
                        } else {
                          setRegraForm({ ...regraForm, horaFim: valor });
                        }
                      } else {
                        setRegraForm({ ...regraForm, horaFim: valor });
                      }
                    }}
                    step="3600"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 15,
                      outline: "none"
                    }}
                  />
                  <small style={{ display: "block", marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                    Apenas horas cheias (ex: 22:00)
                  </small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                    Preço por Hora (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={regraForm.precoHora}
                    onChange={(e) => setRegraForm({ ...regraForm, precoHora: e.target.value })}
                    placeholder="Ex: 100.00"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 15,
                      outline: "none"
                    }}
                  />
                  <small style={{ display: "block", marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                    Campo obrigatório
                  </small>
                </div>

                {regraForm.horaInicio && regraForm.horaFim && (
                  <div style={{ padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                    <strong>Horários que serão atualizados:</strong>{" "}
                    {gerarHorarios(regraForm.horaInicio, regraForm.horaFim).join(", ")}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={abrirModalRemoverDoModal}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fecaca"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#fee2e2"}
                >
                  Remover Horário
                </button>
                <button
                  type="button"
                  onClick={fecharModalEdicao}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#fff",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#fff";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoRegra}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: salvandoRegra ? "#9ca3af" : "#37648c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: salvandoRegra ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!salvandoRegra) {
                      e.target.style.backgroundColor = "#2d5070";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!salvandoRegra) {
                      e.target.style.backgroundColor = "#37648c";
                    }
                  }}
                >
                  {salvandoRegra ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Limpar Todas as Regras */}
      {modalLimparTodasAberto && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              fecharModalLimparTodas();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 450,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: "50%", 
                backgroundColor: "#fee2e2", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: 16
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#991b1b"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                Limpar Todas as Regras?
              </h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>
                Tem certeza que deseja remover <strong>TODAS as {regras.length} regras</strong> desta quadra? Esta ação não pode ser desfeita e todas as regras de horários serão permanentemente excluídas.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={fecharModalLimparTodas}
                disabled={carregando}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: carregando ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!carregando) {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!carregando) {
                    e.target.style.backgroundColor = "#fff";
                    e.target.style.borderColor = "#d1d5db";
                  }
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLimparTodasRegras}
                disabled={carregando}
                style={{
                  padding: "10px 20px",
                  backgroundColor: carregando ? "#9ca3af" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: carregando ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!carregando) {
                    e.target.style.backgroundColor = "#b91c1c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!carregando) {
                    e.target.style.backgroundColor = "#dc2626";
                  }
                }}
              >
                {carregando ? "Removendo..." : "Sim, Limpar Todas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
