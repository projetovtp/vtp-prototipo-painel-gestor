import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/ui";
import { formatarCNPJ, formatarCEP } from "../../utils/formatters";
import { ESTADOS_BR, ESTADOS_NOME } from "../../utils/constants";
import IconArrowLeft from "../../components/icons/IconArrowLeft";
import { useGestorConfiguracoesPage } from "../../hooks/useGestorConfiguracoesPage";

const GestorConfiguracoesPage = () => {
  const navigate = useNavigate();
  const {
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
  } = useGestorConfiguracoesPage();

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
          <IconArrowLeft size={20} />
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
};

export default GestorConfiguracoesPage;
