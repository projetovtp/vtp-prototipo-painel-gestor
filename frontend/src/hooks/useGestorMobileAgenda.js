import { useEffect, useState } from "react";
import { useGestorQuadras, useGestorAgenda } from "./api";
import { useAuth } from "../context/AuthContext";
import { tratarErroRegra, extrairErroApi } from "../utils/errors";
import { DIAS_SEMANA_REGRAS } from "../utils/constants";

export default function useGestorMobileAgenda() {
  const { usuario } = useAuth();
  const { listar: listarQuadrasApi } = useGestorQuadras();
  const {
    listarRegras,
    criarRegra,
    editarRegra: editarRegraApi,
    excluirRegra,
  } = useGestorAgenda();

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState("");
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
    precoHora: "",
  });
  const [editId, setEditId] = useState(null);

  const [confirmacao, setConfirmacao] = useState(null);

  useEffect(() => {
    if (usuario) carregarQuadras();
  }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quadraId) carregarRegras();
    else setRegras([]);
  }, [quadraId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formAberto) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [formAberto]);

  function mostrarToast(msg) {
    setMensagem(msg);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function carregarQuadras() {
    try {
      setCarregando(true);
      const d = await listarQuadrasApi();
      const q = Array.isArray(d) ? d : [];
      setQuadras(q);
      if (q.length > 0 && !quadraId) setQuadraId(q[0].id);
    } catch {
      setErro("Erro ao carregar quadras.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRegras() {
    if (!quadraId) return;
    try {
      setCarregando(true);
      setErro("");
      const d = await listarRegras({ quadraId });
      setRegras(d?.regras || []);
    } catch {
      setErro("Erro ao carregar regras.");
    } finally {
      setCarregando(false);
    }
  }

  function abrirCriar() {
    setEditId(null);
    setForm({ diasSemana: [], horaInicio: "", horaFim: "", precoHora: "" });
    setFormAberto(true);
  }

  function abrirEditar(regra) {
    setEditId(regra.id);
    setForm({
      diasSemana: [regra.dia_semana],
      horaInicio: regra.hora_inicio,
      horaFim: regra.hora_fim,
      precoHora: regra.preco_hora ? String(regra.preco_hora) : "",
    });
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEditId(null);
  }

  async function handleSalvar() {
    if (!quadraId) { setErro("Selecione uma quadra."); return; }
    if (!form.diasSemana.length) { setErro("Selecione um dia."); return; }
    if (!form.horaInicio || !form.horaFim) { setErro("Preencha os horários."); return; }
    const hi = parseInt(form.horaInicio.split(":")[0]),
      hf = parseInt(form.horaFim.split(":")[0]);
    if (hi >= hf) { setErro("Hora final deve ser maior que inicial."); return; }
    const preco = Number(String(form.precoHora).replace(",", ".").trim());
    if (!preco || preco <= 0) { setErro("Preço inválido."); return; }

    try {
      setSalvando(true);
      setErro("");
      if (editId) {
        await editarRegraApi(editId, {
          quadraId,
          diaSemana: form.diasSemana[0],
          horaInicio: form.horaInicio,
          horaFim: form.horaFim,
          precoHora: preco,
          ativo: true,
        });
        mostrarToast("Regra atualizada!");
      } else {
        await Promise.all(
          form.diasSemana.map((ds) =>
            criarRegra({
              quadraId,
              diaSemana: Number(ds),
              horaInicio: form.horaInicio,
              horaFim: form.horaFim,
              precoHora: preco,
              ativo: true,
            }),
          ),
        );
        mostrarToast("Regras criadas!");
      }
      fecharForm();
      await carregarRegras();
    } catch (e) {
      setErro(tratarErroRegra(e));
    } finally {
      setSalvando(false);
    }
  }

  function pedirConfirmacao(titulo, descricao, acao) {
    setConfirmacao({ titulo, descricao, acao });
  }

  async function removerRegra(id) {
    try {
      setErro("");
      await excluirRegra(id);
      mostrarToast("Regra removida!");
      await carregarRegras();
    } catch (e) {
      setErro(extrairErroApi(e, "Erro ao remover."));
    }
  }

  async function limparDia(diaSemana) {
    const rDia = regras.filter((r) => r.dia_semana === diaSemana);
    try {
      setCarregando(true);
      await Promise.all(rDia.map((r) => excluirRegra(r.id)));
      mostrarToast("Regras do dia removidas!");
      await carregarRegras();
    } catch (e) {
      setErro(extrairErroApi(e, "Erro ao limpar dia."));
    } finally {
      setCarregando(false);
    }
  }

  async function limparTodas() {
    try {
      setCarregando(true);
      await Promise.all(regras.map((r) => excluirRegra(r.id)));
      mostrarToast("Todas as regras removidas!");
      await carregarRegras();
    } catch (e) {
      setErro(extrairErroApi(e, "Erro ao limpar."));
    } finally {
      setCarregando(false);
    }
  }

  const regrasPorDia = DIAS_SEMANA_REGRAS.map((d) => ({
    ...d,
    regras: regras.filter((r) => r.dia_semana === d.valor),
  }));

  return {
    quadras,
    quadraId,
    setQuadraId,
    regras,
    regrasPorDia,
    carregando,
    erro,
    setErro,
    mensagem,
    salvando,
    formAberto,
    form,
    setForm,
    editId,
    confirmacao,
    setConfirmacao,
    abrirCriar,
    abrirEditar,
    fecharForm,
    handleSalvar,
    pedirConfirmacao,
    removerRegra,
    limparDia,
    limparTodas,
  };
}
