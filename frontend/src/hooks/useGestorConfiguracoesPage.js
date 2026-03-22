import { useState, useEffect } from "react";
import { useGestorConfiguracoes } from "./api";

export function useGestorConfiguracoesPage() {
  const {
    obterComplexo,
    salvarComplexo,
    salvarEndereco,
    salvarFinanceiro,
    uploadLogo,
  } = useGestorConfiguracoes();

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [dadosComplexo, setDadosComplexo] = useState({
    nome: "",
    cnpj: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    email: "",
    telefone: "",
    descricao: "",
    logo: null,
    logoPreview: null,
  });

  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    chavePix: "",
    nomeTitular: "",
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const data = await obterComplexo();
        if (!data) throw new Error("Dados vazios");
        setDadosComplexo({
          nome: data.nome || "",
          cnpj: data.cnpj || "",
          cep: data.cep || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          email: data.email || "",
          telefone: data.telefone || "",
          descricao: data.descricao || "",
          logo: null,
          logoPreview: data.logoUrl || null,
        });
        setDadosFinanceiros({
          chavePix: data.chavePix || "",
          nomeTitular: data.nomeTitular || "",
        });
      } catch {
        setMensagemErro("Erro ao carregar configurações. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [obterComplexo]);

  function updateComplexo(field, value) {
    setDadosComplexo((prev) => ({ ...prev, [field]: value }));
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMensagemErro("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDadosComplexo((prev) => ({
        ...prev,
        logo: file,
        logoPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  }

  function showSuccess(msg) {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  function iniciarSalvamento() {
    setSalvando(true);
    setMensagemErro("");
    setMensagemSucesso("");
  }

  async function handleSalvarDadosComplexo() {
    try {
      iniciarSalvamento();
      if (
        !dadosComplexo.nome ||
        !dadosComplexo.email ||
        !dadosComplexo.telefone
      ) {
        setMensagemErro("Nome, Email e Telefone são obrigatórios.");
        return;
      }
      await salvarComplexo({
        nome: dadosComplexo.nome,
        cnpj: dadosComplexo.cnpj,
        email: dadosComplexo.email,
        telefone: dadosComplexo.telefone,
        descricao: dadosComplexo.descricao,
      });
      if (dadosComplexo.logo) {
        const formData = new FormData();
        formData.append("logo", dadosComplexo.logo);
        await uploadLogo(formData);
      }
      showSuccess("Dados do complexo atualizados com sucesso!");
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar dados do complexo. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvarEndereco() {
    try {
      iniciarSalvamento();
      if (
        !dadosComplexo.cep ||
        !dadosComplexo.cidade ||
        !dadosComplexo.estado ||
        !dadosComplexo.bairro ||
        !dadosComplexo.endereco ||
        !dadosComplexo.numero
      ) {
        setMensagemErro(
          "CEP, Cidade, Estado, Bairro, Rua e Número são obrigatórios.",
        );
        return;
      }
      await salvarEndereco({
        cep: dadosComplexo.cep,
        cidade: dadosComplexo.cidade,
        estado: dadosComplexo.estado,
        bairro: dadosComplexo.bairro,
        endereco: dadosComplexo.endereco,
        numero: dadosComplexo.numero,
        complemento: dadosComplexo.complemento,
      });
      showSuccess("Endereço atualizado com sucesso!");
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar endereço. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleSalvarDadosFinanceiros() {
    try {
      iniciarSalvamento();
      if (!dadosFinanceiros.chavePix || !dadosFinanceiros.nomeTitular) {
        setMensagemErro("Chave PIX e Nome do Titular são obrigatórios.");
        return;
      }
      await salvarFinanceiro(dadosFinanceiros);
      showSuccess("Dados financeiros atualizados com sucesso!");
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar dados financeiros. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return {
    salvando,
    mensagemSucesso,
    mensagemErro,
    carregando,
    dadosComplexo,
    dadosFinanceiros,
    setDadosFinanceiros,
    updateComplexo,
    handleLogoChange,
    handleSalvarDadosComplexo,
    handleSalvarEndereco,
    handleSalvarDadosFinanceiros,
  };
}
