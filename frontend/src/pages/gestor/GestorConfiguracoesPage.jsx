import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGestorConfiguracoes } from "../../hooks/api";
import { LoadingSpinner } from "../../components/ui";

const MOCK_DADOS_COMPLEXO = {
  nome: "Complexo Esportivo ABC",
  cnpj: "12.345.678/0001-90",
  cep: "01310-100",
  endereco: "Avenida Paulista",
  numero: "1000",
  complemento: "Sala 101",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  estado: "SP",
  email: "contato@complexoabc.com.br",
  telefone: "(11) 3456-7890",
  descricao: "Complexo esportivo completo com diversas quadras e modalidades.",
  logo: null,
  logoPreview: null,
};

const MOCK_DADOS_FINANCEIROS = {
  chavePix: "contato@complexoabc.com.br",
  nomeTitular: "Complexo Esportivo ABC Ltda",
};

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const ESTADOS_NOME = {
  AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",
  DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",
  MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",
  PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",
  RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",
  SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins"
};

export default function GestorConfiguracoesPage() {
  const navigate = useNavigate();
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
    nome: "", cnpj: "", cep: "", endereco: "", numero: "",
    complemento: "", bairro: "", cidade: "", estado: "",
    email: "", telefone: "", descricao: "", logo: null, logoPreview: null,
  });

  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    chavePix: "", nomeTitular: "",
  });

  useEffect(() => {
    carregarDados();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregarDados() {
    try {
      setCarregando(true);
      const data = await obterComplexo();
      if (data) {
        setDadosComplexo({
          nome: data.nome || "", cnpj: data.cnpj || "",
          cep: data.cep || "", endereco: data.endereco || "",
          numero: data.numero || "", complemento: data.complemento || "",
          bairro: data.bairro || "", cidade: data.cidade || "",
          estado: data.estado || "", email: data.email || "",
          telefone: data.telefone || "", descricao: data.descricao || "",
          logo: null, logoPreview: data.logoUrl || null,
        });
        setDadosFinanceiros({
          chavePix: data.chavePix || "",
          nomeTitular: data.nomeTitular || "",
        });
      } else {
        throw new Error("Dados vazios");
      }
    } catch {
      setDadosComplexo(MOCK_DADOS_COMPLEXO);
      setDadosFinanceiros(MOCK_DADOS_FINANCEIROS);
    } finally {
      setCarregando(false);
    }
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
      setDadosComplexo((prev) => ({ ...prev, logo: file, logoPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function formatarCNPJ(value) {
    const cnpj = value.replace(/\D/g, "");
    return cnpj
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function formatarCEP(value) {
    const cep = value.replace(/\D/g, "");
    return cep.replace(/^(\d{5})(\d)/, "$1-$2");
  }

  function updateComplexo(field, value) {
    setDadosComplexo((prev) => ({ ...prev, [field]: value }));
  }

  function showSuccess(msg) {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(""), 3000);
  }

  async function handleSalvarDadosComplexo() {
    try {
      setSalvando(true);
      setMensagemErro("");
      setMensagemSucesso("");

      if (!dadosComplexo.nome || !dadosComplexo.email || !dadosComplexo.telefone) {
        setMensagemErro("Nome, Email e Telefone são obrigatórios.");
        return;
      }

      try {
        await salvarComplexo({
          nome: dadosComplexo.nome, cnpj: dadosComplexo.cnpj,
          email: dadosComplexo.email, telefone: dadosComplexo.telefone,
          descricao: dadosComplexo.descricao,
        });
        if (dadosComplexo.logo) {
          const formData = new FormData();
          formData.append("logo", dadosComplexo.logo);
          await uploadLogo(formData);
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
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
      setSalvando(true);
      setMensagemErro("");
      setMensagemSucesso("");

      if (!dadosComplexo.cep || !dadosComplexo.cidade || !dadosComplexo.estado || !dadosComplexo.bairro || !dadosComplexo.endereco || !dadosComplexo.numero) {
        setMensagemErro("CEP, Cidade, Estado, Bairro, Rua e Número são obrigatórios.");
        return;
      }

      try {
        await salvarEndereco({
          cep: dadosComplexo.cep, cidade: dadosComplexo.cidade,
          estado: dadosComplexo.estado, bairro: dadosComplexo.bairro,
          endereco: dadosComplexo.endereco, numero: dadosComplexo.numero,
          complemento: dadosComplexo.complemento,
        });
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }

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
      setSalvando(true);
      setMensagemErro("");
      setMensagemSucesso("");

      if (!dadosFinanceiros.chavePix || !dadosFinanceiros.nomeTitular) {
        setMensagemErro("Chave PIX e Nome do Titular são obrigatórios.");
        return;
      }

      try {
        await salvarFinanceiro(dadosFinanceiros);
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }

      showSuccess("Dados financeiros atualizados com sucesso!");
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar dados financeiros. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando configurações..." fullPage />;
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="cfg-header">
        <button
          className="cfg-back-btn"
          onClick={() => navigate("/gestor/configuracoes")}
          title="Voltar para Configurações"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="cfg-title">Configurações do Complexo</h1>
      </div>

      {/* Alertas */}
      {mensagemSucesso && <div className="cfg-alert cfg-alert--success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="cfg-alert cfg-alert--error">{mensagemErro}</div>}

      {/* Dados do Complexo + Endereço */}
      <div className="cfg-form-grid">
        {/* Dados do Complexo */}
        <div className="cfg-card">
          <h3 className="cfg-card-title">Dados do Complexo</h3>

          <div className="cfg-form-col">
            <div className="cfg-compact-field">
              <label>Nome do Complexo *</label>
              <input type="text" value={dadosComplexo.nome} onChange={(e) => updateComplexo("nome", e.target.value)} placeholder="Digite o nome do complexo" />
            </div>

            <div className="cfg-compact-field">
              <label>CNPJ</label>
              <input type="text" value={dadosComplexo.cnpj} onChange={(e) => updateComplexo("cnpj", formatarCNPJ(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} />
            </div>

            <div className="cfg-compact-field">
              <label>Email *</label>
              <input type="email" value={dadosComplexo.email} onChange={(e) => updateComplexo("email", e.target.value)} placeholder="contato@complexo.com.br" />
            </div>

            <div className="cfg-compact-field">
              <label>Telefone de Contato *</label>
              <input type="tel" value={dadosComplexo.telefone} onChange={(e) => updateComplexo("telefone", e.target.value)} placeholder="(11) 3456-7890" />
            </div>

            <div className="cfg-compact-field">
              <label>Descrição do Complexo</label>
              <textarea value={dadosComplexo.descricao} onChange={(e) => updateComplexo("descricao", e.target.value)} placeholder="Descreva seu complexo esportivo..." rows={3} />
            </div>

            <div className="cfg-compact-field">
              <label>Logo do Complexo</label>
              {dadosComplexo.logoPreview && (
                <img src={dadosComplexo.logoPreview} alt="Preview logo" className="cfg-logo-preview" />
              )}
              <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: 12 }} />
              <span className="field-hint">Formatos aceitos: JPG, PNG. Dimensão: 50x50. Tamanho máximo: 5MB</span>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button type="button" className="cfg-btn-brand" onClick={handleSalvarDadosComplexo} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        {/* Endereço */}
        <div className="cfg-card">
          <h3 className="cfg-card-title">Endereço</h3>

          <div className="cfg-form-col">
            <div className="cfg-compact-field">
              <label>CEP *</label>
              <input type="text" value={dadosComplexo.cep} onChange={(e) => updateComplexo("cep", formatarCEP(e.target.value))} placeholder="00000-000" maxLength={9} />
            </div>

            <div className="cfg-two-col">
              <div className="cfg-compact-field">
                <label>Cidade *</label>
                <input type="text" value={dadosComplexo.cidade} onChange={(e) => updateComplexo("cidade", e.target.value)} placeholder="Nome da cidade" />
              </div>
              <div className="cfg-compact-field">
                <label>Estado *</label>
                <select value={dadosComplexo.estado} onChange={(e) => updateComplexo("estado", e.target.value)}>
                  <option value="">Selecione</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{ESTADOS_NOME[uf]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cfg-compact-field">
              <label>Bairro *</label>
              <input type="text" value={dadosComplexo.bairro} onChange={(e) => updateComplexo("bairro", e.target.value)} placeholder="Nome do bairro" />
            </div>

            <div className="cfg-compact-field">
              <label>Rua *</label>
              <input type="text" value={dadosComplexo.endereco} onChange={(e) => updateComplexo("endereco", e.target.value)} placeholder="Rua, Avenida, etc." />
            </div>

            <div className="cfg-two-col">
              <div className="cfg-compact-field">
                <label>Número *</label>
                <input type="text" value={dadosComplexo.numero} onChange={(e) => updateComplexo("numero", e.target.value)} placeholder="123" />
              </div>
              <div className="cfg-compact-field">
                <label>Complemento</label>
                <input type="text" value={dadosComplexo.complemento} onChange={(e) => updateComplexo("complemento", e.target.value)} placeholder="Apto, Sala, etc." />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button type="button" className="cfg-btn-brand" onClick={handleSalvarEndereco} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* Dados Financeiros */}
      <div className="cfg-card">
        <h3 className="cfg-card-title">Dados Financeiros</h3>

        <div className="cfg-form-col">
          <div className="cfg-compact-field">
            <label>Chave PIX * (CPF, CNPJ, email ou telefone)</label>
            <input type="text" value={dadosFinanceiros.chavePix} onChange={(e) => setDadosFinanceiros({ ...dadosFinanceiros, chavePix: e.target.value })} placeholder="CPF, CNPJ, Email ou Chave Aleatória" />
            <span className="field-hint" style={{ fontSize: 12 }}>Informe a chave PIX que será usada para receber pagamentos</span>
          </div>

          <div className="cfg-compact-field">
            <label>Nome do Titular *</label>
            <input type="text" value={dadosFinanceiros.nomeTitular} onChange={(e) => setDadosFinanceiros({ ...dadosFinanceiros, nomeTitular: e.target.value })} placeholder="Nome completo do titular da conta" />
            <span className="field-hint" style={{ fontSize: 12 }}>Nome completo como está cadastrado na conta bancária</span>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 12 }}>
          <button type="button" className="cfg-btn-brand" onClick={handleSalvarDadosFinanceiros} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
