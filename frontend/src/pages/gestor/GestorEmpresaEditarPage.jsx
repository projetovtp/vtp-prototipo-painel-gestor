import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGestorEmpresas } from "../../hooks/api";
import { LoadingSpinner, ErrorMessage } from "../../components/ui";

function GestorEmpresaEditarPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const { obter: obterEmpresa, editar: editarEmpresa } = useGestorEmpresas();

  const [form, setForm] = useState({
    nome: "",
    enderecoResumo: "",
    linkMaps: "",
    linkRede: "",
    descricao: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function voltarLista() {
    navigate("/gestor/empresas");
  }

  useEffect(() => {
    async function carregarEmpresa() {
      try {
        setCarregando(true);
        setErroCarregamento("");
        const data = await obterEmpresa(empresaId);
        setForm({
          nome: data.nome || "",
          enderecoResumo: data.endereco_resumo || "",
          linkMaps: data.link_google_maps || "",
          linkRede: data.link_site_ou_rede || "",
          descricao: data.descricao_complexo || "",
        });
      } catch (err) {
        console.error("[GESTOR/EMPRESA-EDITAR] Erro ao carregar empresa:", err);
        setErroCarregamento(
          err.response?.data?.error ||
          "Erro ao carregar dados do complexo. Tente novamente mais tarde."
        );
      } finally {
        setCarregando(false);
      }
    }

    if (empresaId) {
      carregarEmpresa();
    }
  }, [empresaId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    try {
      setSalvando(true);
      const payload = {
        nome: form.nome.trim(),
        endereco_resumo: form.enderecoResumo.trim(),
        link_google_maps: form.linkMaps?.trim() || null,
        link_site_ou_rede: form.linkRede?.trim() || null,
        descricao_complexo: form.descricao?.trim() || null,
      };

      await editarEmpresa(empresaId, payload);
      setMensagemSucesso("Complexo atualizado com sucesso.");
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch (err) {
      console.error("[GESTOR/EMPRESA-EDITAR] Erro ao atualizar empresa:", err);
      setMensagemErro(
        err.response?.data?.error ||
        "Erro ao atualizar o complexo. Verifique os dados e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando dados do complexo..." fullPage />;
  }

  if (erroCarregamento) {
    return (
      <div className="page">
        <ErrorMessage
          mensagem={erroCarregamento}
          onRetry={() => window.location.reload()}
        />
        <button type="button" className="cfg-btn-cancel" onClick={voltarLista}>
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="cfg-header">
        <button
          className="cfg-back-btn"
          onClick={voltarLista}
          title="Voltar para lista de complexos"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="cfg-title">Editar Complexo</h1>
      </div>

      {/* Alertas */}
      {mensagemSucesso && <div className="cfg-alert cfg-alert--success">{mensagemSucesso}</div>}
      {mensagemErro && <div className="cfg-alert cfg-alert--error">{mensagemErro}</div>}

      {/* Formulário */}
      <div className="cfg-card">
        <h3 className="cfg-card-title">Dados do Complexo</h3>

        <form onSubmit={handleSubmit}>
          <div className="cfg-form-col">
            <div className="cfg-compact-field">
              <label htmlFor="nome">Nome do complexo *</label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex.: Complexo Grêmio Esportivo"
                required
              />
            </div>

            <div className="cfg-compact-field">
              <label htmlFor="enderecoResumo">Endereço resumido *</label>
              <input
                id="enderecoResumo"
                name="enderecoResumo"
                type="text"
                value={form.enderecoResumo}
                onChange={handleChange}
                placeholder="Ex.: Rua X, 123 – Bairro Y – Cidade/UF"
                required
              />
            </div>

            <div className="cfg-two-col">
              <div className="cfg-compact-field">
                <label htmlFor="linkMaps">Link do Google Maps</label>
                <input
                  id="linkMaps"
                  name="linkMaps"
                  type="url"
                  value={form.linkMaps}
                  onChange={handleChange}
                  placeholder="Cole aqui o link do Maps (opcional)"
                />
              </div>
              <div className="cfg-compact-field">
                <label htmlFor="linkRede">Link de rede social ou site</label>
                <input
                  id="linkRede"
                  name="linkRede"
                  type="url"
                  value={form.linkRede}
                  onChange={handleChange}
                  placeholder="Ex.: https://instagram.com/seu_complexo"
                />
              </div>
            </div>

            <div className="cfg-compact-field">
              <label htmlFor="descricao">Descrição do complexo</label>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                value={form.descricao}
                onChange={handleChange}
                placeholder="Explique em poucas linhas o que o complexo oferece, diferenciais, estrutura, etc."
              />
            </div>
          </div>

          <div className="cfg-modal-actions">
            <button
              type="button"
              className="cfg-btn-cancel"
              onClick={voltarLista}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="cfg-btn-brand" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GestorEmpresaEditarPage;
