import { useState } from "react";
import { MOCK_QUADRAS, MOCK_EMPRESAS } from "../mocks/mockQuadras";
import { validarFormQuadra } from "../utils/validacoes";

const FORM_INICIAL = {
  estrutura: "", material: "", modalidades: [],
  inputModalidade: "", quantidadeQuadras: "", apelido: "",
};

export function useGestorConfiguracoesQuadrasPage() {
  const [quadras, setQuadras] = useState(MOCK_QUADRAS);
  const [empresas] = useState(MOCK_EMPRESAS);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoQuadraId, setEditandoQuadraId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [quadraParaExcluir, setQuadraParaExcluir] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  const empresasComQuadras = empresas
    .map((empresa) => ({ ...empresa, quadras: quadras.filter((q) => q.empresa_id === empresa.id) }))
    .filter((empresa) => empresa.quadras?.length > 0);

  function handleNovaQuadra() {
    setEditandoQuadraId(null);
    setFormData(FORM_INICIAL);
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEditandoQuadraId(null);
    setFormData(FORM_INICIAL);
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function handleEditarQuadra(id) {
    const quadra = quadras.find(q => q.id === id);
    if (!quadra) return;
    setEditandoQuadraId(id);
    setFormData({
      estrutura: quadra.estrutura || "",
      material: quadra.material || "",
      modalidades: quadra.modalidades || [],
      inputModalidade: "",
      quantidadeQuadras: quadra.quantidade_quadras?.toString() || "",
      apelido: quadra.apelido || "",
    });
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagemErro("");
    setMensagemSucesso("");

    const erroValidacao = validarFormQuadra(formData);
    if (erroValidacao) {
      setMensagemErro(erroValidacao);
      setSalvando(false);
      return;
    }

    const quantidade = parseInt(formData.quantidadeQuadras);
    const primeiraModalidade = formData.modalidades[0] || "";
    const nomeQuadra = formData.apelido.trim()
      ? formData.apelido.trim()
      : `${formData.estrutura}${primeiraModalidade ? ` - ${primeiraModalidade}` : ""}`;

    if (editandoQuadraId) {
      setQuadras(prev => prev.map(q =>
        q.id === editandoQuadraId
          ? { ...q, estrutura: formData.estrutura, material: formData.material, modalidades: formData.modalidades, quantidade_quadras: quantidade, apelido: formData.apelido.trim() || null, nome: nomeQuadra }
          : q
      ));
      setMensagemSucesso("Quadra atualizada com sucesso!");
    } else {
      setQuadras(prev => [...prev, {
        id: Date.now(), nome: nomeQuadra, estrutura: formData.estrutura,
        material: formData.material, modalidades: formData.modalidades,
        quantidade_quadras: quantidade, apelido: formData.apelido.trim() || null,
        empresa_id: 1, status: "ativa", created_at: new Date().toISOString(),
      }]);
      setMensagemSucesso("Quadra adicionada com sucesso!");
    }

    setSalvando(false);
    setTimeout(handleFecharModal, 2000);
  }

  function handleToggleStatus(quadra) {
    const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";
    setQuadras(prev => prev.map(q =>
      q.id === quadra.id ? { ...q, status: estaAtiva ? "inativa" : "ativa" } : q
    ));
    setMensagemSucesso(`Quadra ${estaAtiva ? "desativada" : "ativada"} com sucesso!`);
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  function handleConfirmarExclusao() {
    if (!quadraParaExcluir) return;
    setQuadras(prev => prev.filter(q => q.id !== quadraParaExcluir.id));
    setQuadraParaExcluir(null);
    setMensagemSucesso("Quadra excluída com sucesso!");
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  function buildNamePreview() {
    if (formData.apelido.trim()) return `Nome da quadra: ${formData.apelido.trim()}`;
    if (formData.estrutura && formData.modalidades?.length) {
      const extra = formData.modalidades.length > 1 ? ` (+${formData.modalidades.length - 1})` : "";
      return `Nome da quadra será: ${formData.estrutura} - ${formData.modalidades[0]}${extra}`;
    }
    return "Se não informado, o nome será: Estrutura - Modalidade";
  }

  return {
    quadras,
    modalAberto,
    editandoQuadraId,
    salvando,
    mensagemSucesso,
    mensagemErro,
    quadraParaExcluir,
    setQuadraParaExcluir,
    formData,
    empresasComQuadras,
    handleNovaQuadra,
    handleFecharModal,
    handleEditarQuadra,
    handleChange,
    handleSubmit,
    handleToggleStatus,
    handleConfirmarExclusao,
    buildNamePreview,
  };
}
