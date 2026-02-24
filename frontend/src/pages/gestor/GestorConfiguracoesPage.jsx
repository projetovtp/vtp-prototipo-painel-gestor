import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function GestorConfiguracoesPage() {
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Estados dos formulários
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
    logoPreview: null
  });

  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    chavePix: "",
    nomeTitular: ""
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      // TODO: Quando integrar com API real, usar:
      // const { data } = await api.get("/gestor/empresas");
      // Preencher os campos com os dados retornados
      
      // Mock de dados para ilustração
      setDadosComplexo({
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
        logoPreview: null
      });

      setDadosFinanceiros({
        chavePix: "contato@complexoabc.com.br",
        nomeTitular: "Complexo Esportivo ABC Ltda"
      });
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao carregar:", error);
      setMensagemErro("Erro ao carregar dados. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMensagemErro("A imagem deve ter no máximo 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setDadosComplexo({
          ...dadosComplexo,
          logo: file,
          logoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
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

  async function handleSalvarDadosComplexo() {
    try {
      setSalvando(true);
      setMensagemErro("");
      setMensagemSucesso("");
      
      // Validações
      if (!dadosComplexo.nome || !dadosComplexo.email || !dadosComplexo.telefone) {
        setMensagemErro("Nome, Email e Telefone são obrigatórios.");
        return;
      }

      // TODO: Quando integrar com API real, usar:
      // const formData = new FormData();
      // formData.append('nome', dadosComplexo.nome);
      // formData.append('cnpj', dadosComplexo.cnpj);
      // ... outros campos
      // if (dadosComplexo.logo) {
      //   formData.append('logo', dadosComplexo.logo);
      // }
      // await api.put("/gestor/empresas/:id", formData);
      
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMensagemSucesso("Dados do complexo atualizados com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
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
      
      // Validações
      if (!dadosComplexo.cep || !dadosComplexo.cidade || !dadosComplexo.estado || !dadosComplexo.bairro || !dadosComplexo.endereco || !dadosComplexo.numero) {
        setMensagemErro("CEP, Cidade, Estado, Bairro, Rua e Número são obrigatórios.");
        return;
      }

      // TODO: Quando integrar com API real, usar:
      // await api.put("/gestor/empresas/:id/endereco", {
      //   cep: dadosComplexo.cep,
      //   cidade: dadosComplexo.cidade,
      //   estado: dadosComplexo.estado,
      //   bairro: dadosComplexo.bairro,
      //   endereco: dadosComplexo.endereco,
      //   numero: dadosComplexo.numero,
      //   complemento: dadosComplexo.complemento
      // });
      
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMensagemSucesso("Endereço atualizado com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
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
      
      // Validações
      if (!dadosFinanceiros.chavePix || !dadosFinanceiros.nomeTitular) {
        setMensagemErro("Chave PIX e Nome do Titular são obrigatórios.");
        return;
      }

      // TODO: Quando integrar com API real, usar:
      // await api.put("/gestor/empresas/:id/financeiro", dadosFinanceiros);
      
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMensagemSucesso("Dados financeiros atualizados com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch (error) {
      console.error("[CONFIGURAÇÕES] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar dados financeiros. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div>Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Configurações do Complexo</h1>
      </div>

      {mensagemSucesso && (
        <div className="card" style={{ backgroundColor: "#d1fae5", border: "1px solid #86efac", color: "#065f46", padding: "8px 12px", marginBottom: 12 }}>
          {mensagemSucesso}
        </div>
      )}

      {mensagemErro && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "8px 12px", marginBottom: 12 }}>
          {mensagemErro}
        </div>
      )}

      {/* Container com dois cards lado a lado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 0 }}>
        {/* Dados do Complexo - Card Esquerdo */}
        <div className="card" style={{ marginTop: 0, marginBottom: 16, padding: "16px 20px" }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#111827" }}>
            Dados do Complexo
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Nome do Complexo *</label>
              <input
                type="text"
                value={dadosComplexo.nome}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, nome: e.target.value })}
                placeholder="Digite o nome do complexo"
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>CNPJ</label>
              <input
                type="text"
                value={dadosComplexo.cnpj}
                onChange={(e) => {
                  const formatted = formatarCNPJ(e.target.value);
                  setDadosComplexo({ ...dadosComplexo, cnpj: formatted });
                }}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Email *</label>
              <input
                type="email"
                value={dadosComplexo.email}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, email: e.target.value })}
                placeholder="contato@complexo.com.br"
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Telefone de Contato *</label>
              <input
                type="tel"
                value={dadosComplexo.telefone}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, telefone: e.target.value })}
                placeholder="(11) 3456-7890"
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Descrição do Complexo</label>
              <textarea
                value={dadosComplexo.descricao}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, descricao: e.target.value })}
                placeholder="Descreva seu complexo esportivo..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none"
                }}
              />
            </div>

            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Logo do Complexo</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {dadosComplexo.logoPreview && (
                  <div style={{ width: "100%", maxWidth: 120 }}>
                    <img
                      src={dadosComplexo.logoPreview}
                      alt="Preview logo"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb"
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ fontSize: 12 }}
                />
                <span style={{ fontSize: 10, color: "#6b7280" }}>
                  Formatos aceitos: JPG, PNG. Dimensão: 50x50. Tamanho máximo: 5MB
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSalvarDadosComplexo}
              disabled={salvando}
              style={{ backgroundColor: "#37648c", borderColor: "#37648c", padding: "8px 16px", fontSize: 14 }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        {/* Endereço - Card Direito */}
        <div className="card" style={{ marginTop: 0, marginBottom: 16, padding: "16px 20px" }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#111827" }}>
            Endereço
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* CEP - linha completa */}
            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>CEP *</label>
              <input
                type="text"
                value={dadosComplexo.cep}
                onChange={(e) => {
                  const formatted = formatarCEP(e.target.value);
                  setDadosComplexo({ ...dadosComplexo, cep: formatted });
                }}
                placeholder="00000-000"
                maxLength={9}
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            {/* Cidade e Estado - duas colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-field" style={{ gap: 4 }}>
                <label style={{ fontSize: 13, marginBottom: 2 }}>Cidade *</label>
                <input
                  type="text"
                  value={dadosComplexo.cidade}
                  onChange={(e) => setDadosComplexo({ ...dadosComplexo, cidade: e.target.value })}
                  placeholder="Nome da cidade"
                  style={{ padding: "6px 10px", fontSize: 13 }}
                />
              </div>

              <div className="form-field" style={{ gap: 4 }}>
                <label style={{ fontSize: 13, marginBottom: 2 }}>Estado *</label>
                <select
                  value={dadosComplexo.estado}
                  onChange={(e) => setDadosComplexo({ ...dadosComplexo, estado: e.target.value })}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 13,
                    fontFamily: "inherit",
                    backgroundColor: "#ffffff",
                    color: "#111827",
                    cursor: "pointer",
                    outline: "none",
                    width: "100%",
                    transition: "border-color 0.2s, box-shadow 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#37648c";
                    e.target.style.boxShadow = "0 0 0 3px rgba(55, 100, 140, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            {/* Bairro - linha completa */}
            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Bairro *</label>
              <input
                type="text"
                value={dadosComplexo.bairro}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, bairro: e.target.value })}
                placeholder="Nome do bairro"
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            {/* Rua - linha completa */}
            <div className="form-field" style={{ gap: 4 }}>
              <label style={{ fontSize: 13, marginBottom: 2 }}>Rua *</label>
              <input
                type="text"
                value={dadosComplexo.endereco}
                onChange={(e) => setDadosComplexo({ ...dadosComplexo, endereco: e.target.value })}
                placeholder="Rua, Avenida, etc."
                style={{ padding: "6px 10px", fontSize: 13 }}
              />
            </div>

            {/* Número e Complemento - duas colunas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-field" style={{ gap: 4 }}>
                <label style={{ fontSize: 13, marginBottom: 2 }}>Número *</label>
                <input
                  type="text"
                  value={dadosComplexo.numero}
                  onChange={(e) => setDadosComplexo({ ...dadosComplexo, numero: e.target.value })}
                  placeholder="123"
                  style={{ padding: "6px 10px", fontSize: 13 }}
                />
              </div>

              <div className="form-field" style={{ gap: 4 }}>
                <label style={{ fontSize: 13, marginBottom: 2 }}>Complemento</label>
                <input
                  type="text"
                  value={dadosComplexo.complemento}
                  onChange={(e) => setDadosComplexo({ ...dadosComplexo, complemento: e.target.value })}
                  placeholder="Apto, Sala, etc."
                  style={{ padding: "6px 10px", fontSize: 13 }}
                />
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSalvarEndereco}
              disabled={salvando}
              style={{ backgroundColor: "#37648c", borderColor: "#37648c", padding: "8px 16px", fontSize: 14 }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* Dados Financeiros */}
      <div className="card" style={{ marginTop: 0 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#111827" }}>
          Dados Financeiros
        </h3>
        
        <div className="form-grid">
          <div className="form-field" style={{ gridColumn: "span 2" }}>
            <label>Chave PIX * (CPF, CNPJ, email ou telefone)</label>
            <input
              type="text"
              value={dadosFinanceiros.chavePix}
              onChange={(e) => setDadosFinanceiros({ ...dadosFinanceiros, chavePix: e.target.value })}
              placeholder="CPF, CNPJ, Email ou Chave Aleatória"
            />
            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
              Informe a chave PIX que será usada para receber pagamentos
            </span>
          </div>

          <div className="form-field" style={{ gridColumn: "span 2" }}>
            <label>Nome do Titular *</label>
            <input
              type="text"
              value={dadosFinanceiros.nomeTitular}
              onChange={(e) => setDadosFinanceiros({ ...dadosFinanceiros, nomeTitular: e.target.value })}
              placeholder="Nome completo do titular da conta"
            />
            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
              Nome completo como está cadastrado na conta bancária
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSalvarDadosFinanceiros}
            disabled={salvando}
            style={{ backgroundColor: "#37648c", borderColor: "#37648c" }}
          >
            {salvando ? "Salvando..." : "Salvar Dados Financeiros"}
          </button>
        </div>
      </div>
    </div>
  );
}
