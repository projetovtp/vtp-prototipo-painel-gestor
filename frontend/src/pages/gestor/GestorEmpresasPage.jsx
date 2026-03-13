import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGestorEmpresas } from "../../hooks/api";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/ui";

function GestorEmpresasPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const {
    listar: listarEmpresas,
    criar: criarEmpresa,
    desativar: desativarEmpresa,
    reativar: reativarEmpresa,
  } = useGestorEmpresas();

  const [empresas, setEmpresas] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [erroLista, setErroLista] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    enderecoResumo: "",
    linkMaps: "",
    linkRede: "",
    descricao: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    return { nome: "", enderecoResumo: "", linkMaps: "", linkRede: "", descricao: "" };
  }

  function handleAbrirModal() {
    setForm(resetForm());
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setForm(resetForm());
    setMensagemErro("");
    setMensagemSucesso("");
  }

  async function carregarEmpresas() {
    if (!usuario?.id) return;
    try {
      setCarregandoLista(true);
      setErroLista("");
      const data = await listarEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao listar empresas:", err);
      setErroLista(
        err.response?.data?.error ||
        "Erro ao carregar a lista de complexos. Tente novamente mais tarde."
      );
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarEmpresas();
  }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!usuario?.id) {
      setMensagemErro("Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      setEnviando(true);
      const payload = {
        nome: form.nome.trim(),
        endereco_resumo: form.enderecoResumo.trim(),
        link_google_maps: form.linkMaps?.trim() || null,
        link_site_ou_rede: form.linkRede?.trim() || null,
        descricao_complexo: form.descricao?.trim() || null,
      };

      await criarEmpresa(payload);
      setMensagemSucesso("Complexo cadastrado com sucesso!");
      await carregarEmpresas();
      setTimeout(handleFecharModal, 1500);
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao salvar empresa:", err);
      setMensagemErro(
        err.response?.data?.error || err.message ||
        "Erro ao salvar o complexo. Verifique os dados e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleDesativar(empresaId) {
    if (!usuario?.id) return;
    const confirmacao = window.confirm(
      "Tem certeza que deseja desativar este complexo?\n\n" +
      "Ele deixará de aparecer para os clientes no WhatsApp, " +
      "mas você poderá reativá-lo depois."
    );
    if (!confirmacao) return;

    try {
      setEnviando(true);
      await desativarEmpresa(empresaId);
      await carregarEmpresas();
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao desativar empresa:", err);
      setErroLista(
        err.response?.data?.error || err.message ||
        "Erro ao desativar o complexo. Tente novamente mais tarde."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleReativar(empresaId) {
    if (!usuario?.id) return;
    const confirmacao = window.confirm(
      "Deseja reativar este complexo?\n\n" +
      "Ele voltará a aparecer para os clientes no WhatsApp."
    );
    if (!confirmacao) return;

    try {
      setEnviando(true);
      await reativarEmpresa(empresaId);
      await carregarEmpresas();
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao reativar empresa:", err);
      setErroLista(
        err.response?.data?.error || err.message ||
        "Erro ao reativar o complexo. Tente novamente mais tarde."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="cfg-header">
          <h1 className="cfg-title">Meus Complexos</h1>
        </div>
        <button className="btn-primary" onClick={handleAbrirModal}>
          + Adicionar Complexo
        </button>
      </div>

      {/* Alertas */}
      {erroLista && !carregandoLista && (
        <ErrorMessage mensagem={erroLista} onDismiss={() => setErroLista("")} />
      )}

      {/* Loading */}
      {carregandoLista && (
        <div className="card">
          <LoadingSpinner mensagem="Carregando complexos..." />
        </div>
      )}

      {/* Vazio */}
      {!carregandoLista && !erroLista && empresas.length === 0 && (
        <div className="card">
          <EmptyState
            titulo="Nenhum complexo cadastrado"
            descricao="Cadastre seu primeiro complexo para que ele apareça para os clientes no WhatsApp."
            acao={handleAbrirModal}
            acaoLabel="+ Adicionar Complexo"
          />
        </div>
      )}

      {/* Lista de empresas em cards */}
      {!carregandoLista && empresas.length > 0 && (
        <div className="emp-grid">
          {empresas.map((empresa) => {
            const estaAtivo = empresa.ativo !== false;

            return (
              <div
                key={empresa.id}
                className={`emp-card${estaAtivo ? "" : " emp-card--inactive"}`}
              >
                {/* Header: Nome + Badge */}
                <div className="emp-card-header">
                  <div>
                    <h3 className="emp-card-name">{empresa.nome}</h3>
                    {empresa.endereco_resumo && (
                      <p className="emp-card-address">{empresa.endereco_resumo}</p>
                    )}
                  </div>
                  <span
                    className={`cfg-status-badge ${estaAtivo ? "cfg-status-badge--active" : "cfg-status-badge--inactive"}`}
                  >
                    {estaAtivo ? "Ativo" : "Desativado"}
                  </span>
                </div>

                {/* Info */}
                <div className="emp-card-info">
                  {empresa.descricao_complexo ? (
                    <p className="emp-card-desc">
                      {empresa.descricao_complexo.length > 150
                        ? empresa.descricao_complexo.slice(0, 150) + "..."
                        : empresa.descricao_complexo}
                    </p>
                  ) : (
                    <p className="emp-card-noinfo">Sem descrição cadastrada</p>
                  )}

                  {(empresa.link_site_ou_rede || empresa.link_google_maps) && (
                    <div className="emp-card-links">
                      {empresa.link_site_ou_rede && (
                        <a
                          href={empresa.link_site_ou_rede}
                          target="_blank"
                          rel="noreferrer"
                          className="emp-card-link"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Site / Redes
                        </a>
                      )}
                      {empresa.link_google_maps && (
                        <a
                          href={empresa.link_google_maps}
                          target="_blank"
                          rel="noreferrer"
                          className="emp-card-link"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="emp-card-actions">
                  <button
                    className="cfg-btn-edit"
                    onClick={() => navigate(`/gestor/empresas/editar/${empresa.id}`)}
                  >
                    Editar
                  </button>
                  {estaAtivo ? (
                    <button
                      className="cfg-btn-delete"
                      onClick={() => handleDesativar(empresa.id)}
                      disabled={enviando}
                    >
                      Desativar
                    </button>
                  ) : (
                    <button
                      className="emp-btn-activate"
                      onClick={() => handleReativar(empresa.id)}
                      disabled={enviando}
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação */}
      {modalAberto && (
        <div
          className="cfg-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleFecharModal(); }}
        >
          <div className="cfg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cfg-modal-header">
              <h3 className="cfg-modal-title">Cadastrar Complexo</h3>
              <button type="button" className="cfg-modal-close" onClick={handleFecharModal}>
                ×
              </button>
            </div>

            {mensagemSucesso && (
              <div className="cfg-alert cfg-alert--success" style={{ marginBottom: 16 }}>
                {mensagemSucesso}
              </div>
            )}
            {mensagemErro && (
              <div className="cfg-alert cfg-alert--error" style={{ marginBottom: 16 }}>
                {mensagemErro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="cfg-modal-form">
              <div className="form-grid">
                <div className="form-field form-field-full">
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
                  <small>Nome que o cliente verá no WhatsApp e nas listas do painel.</small>
                </div>

                <div className="form-field form-field-full">
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
                  <small>Aparece resumido no card do complexo (Flow e painel).</small>
                </div>

                <div className="form-field">
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

                <div className="form-field">
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

                <div className="form-field form-field-full">
                  <label htmlFor="descricao">Descrição do complexo</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    value={form.descricao}
                    onChange={handleChange}
                    placeholder="Explique em poucas linhas o que o complexo oferece, diferenciais, estrutura, etc."
                  />
                </div>
              </div>

              <div className="cfg-modal-actions">
                <button type="button" className="cfg-btn-cancel" onClick={handleFecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="cfg-btn-submit" disabled={enviando}>
                  {enviando ? "Salvando..." : "Cadastrar Complexo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestorEmpresasPage;
