// src/pages/admin/AdminEmpresasPage.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useAdminEmpresas, useAdminGestores } from "../../hooks/api"
import useFocusTrap from "../../hooks/useFocusTrap"
import { ConfirmacaoModal } from "../../components/ui"
import "./admin.css"

const AdminEmpresasPage = () => {
  const [form, setForm] = useState({
    nome: "",
    enderecoResumo: "",
    linkMaps: "",
    linkRede: "",
    descricao: "",
    taxa: "",
    gestorId: "",
  });

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { empresas, listar: listarEmpresas, criar: criarEmpresa, editar: editarEmpresa, excluir: excluirEmpresa, consultar, obterDetalheGestor, obterDetalheEmpresa, obterAuditLog } = useAdminEmpresas();
  const { gestores, listar: listarGestores } = useAdminGestores();
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoGestores, setCarregandoGestores] = useState(false);

  // ===== EDIÇÃO =====
  const [editandoId, setEditandoId] = useState(null);

  // ===== MODAL CONSULTAR =====
  const [modalConsultarOpen, setModalConsultarOpen] = useState(false);
  const [consultaQ, setConsultaQ] = useState("");
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [consultaErro, setConsultaErro] = useState("");
  const [consultaRes, setConsultaRes] = useState({ gestores: [], empresas: [] });

  // ===== MODAL HISTÓRICO (audit_log) =====
const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false);
const [historicoLoading, setHistoricoLoading] = useState(false);
const [historicoErro, setHistoricoErro] = useState("");
const [historicoItens, setHistoricoItens] = useState([]);
const [historicoMeta, setHistoricoMeta] = useState({ entidade_tipo: "", entidade_id: "" });

// historicoRef: { entidade: "EMPRESA" | "GESTOR", id }

  // ===== MODAL CONFIRMAÇÃO =====
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null); // { titulo, mensagem, textoConfirmar, executar }

  const refModalConsultar = useFocusTrap(modalConsultarOpen, fecharModalConsultar);
  const refModalHistorico = useFocusTrap(modalHistoricoOpen, fecharHistorico);

  const [selecionado, setSelecionado] = useState(null);
  // selecionado: { tipo: "GESTOR" | "EMPRESA", id, label }

  const [detalheLoading, setDetalheLoading] = useState(false);
  const [detalheErro, setDetalheErro] = useState("");
  const [detalheData, setDetalheData] = useState(null);

  const debounceRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "taxa") {
      const onlyNumbers = value.replace(/[^0-9.,]/g, "");
      setForm((prev) => ({ ...prev, taxa: onlyNumbers }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleLimpar() {
    setForm({
      nome: "",
      enderecoResumo: "",
      linkMaps: "",
      linkRede: "",
      descricao: "",
      taxa: "",
      gestorId: "",
    });
    setMensagemSucesso("");
    setMensagemErro("");
    setEditandoId(null);
  }

  async function carregarEmpresas() {
    try {
      setCarregandoLista(true);
      await listarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao listar empresas:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(
        msgBackend ||
          "Erro ao carregar a lista de complexos. Tente novamente mais tarde."
      );
    } finally {
      setCarregandoLista(false);
    }
  }

  async function carregarGestores() {
    try {
      setCarregandoGestores(true);
      await listarGestores();
    } catch (err) {
      console.error("[ADMIN/GESTORES-RESUMO] Erro ao listar gestores:", err);
    } finally {
      setCarregandoGestores(false);
    }
  }

  useEffect(() => {
    carregarEmpresas();
    carregarGestores();
  }, []);

  function parseTaxaParaNumero(taxaStr) {
    let taxaNumero = null;
    if (taxaStr) {
      const normalizado = taxaStr.replace(",", ".");
      const parsed = parseFloat(normalizado);
      if (!isNaN(parsed)) taxaNumero = parsed;
      else throw new Error("Taxa inválida. Use apenas números, ponto ou vírgula.");
    }
    return Number.isFinite(taxaNumero) ? taxaNumero : 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    try {
      setEnviando(true);

      if (!form.nome.trim() || !form.enderecoResumo.trim() || !form.gestorId) {
        throw new Error(
          "Preencha pelo menos: Nome, Endereço resumido e selecione um Gestor."
        );
      }

      const taxaNumero = parseTaxaParaNumero(form.taxa);

      const payload = {
        nome: form.nome.trim(),
        endereco_resumo: form.enderecoResumo.trim(),
        link_google_maps: form.linkMaps?.trim() || null,
        link_site_ou_rede: form.linkRede?.trim() || null,
        descricao_complexo: form.descricao?.trim() || null,
        taxa_plataforma: taxaNumero,
        gestor_id: form.gestorId,
      };

      if (editandoId) {
        const data = await editarEmpresa(editandoId, payload);
        console.log("[ADMIN/EMPRESAS] Empresa atualizada:", data);
        setMensagemSucesso("Complexo atualizado com sucesso.");
      } else {
        const data = await criarEmpresa(payload);
        console.log("[ADMIN/EMPRESAS] Empresa criada com sucesso:", data);
        setMensagemSucesso("Complexo salvo com sucesso na base de dados.");
      }

      setMensagemErro("");
      handleLimpar();
      await carregarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao salvar empresa:", err);
      const msgBackend = err.response?.data?.error || err.message;
      setMensagemErro(
        msgBackend ||
          "Erro ao salvar o complexo. Verifique os dados e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  // =========================
  // AÇÕES DA LISTA (Admin)
  // =========================
  function preencherFormParaEditar(empresa) {
    setMensagemSucesso("");
    setMensagemErro("");
    setEditandoId(empresa.id);

    setForm({
      nome: empresa.nome || "",
      enderecoResumo: empresa.endereco_resumo || "",
      linkMaps: empresa.link_google_maps || "",
      linkRede: empresa.link_site_ou_rede || "",
      descricao: empresa.descricao_complexo || "",
      taxa:
        empresa.taxa_plataforma != null
          ? String(empresa.taxa_plataforma).replace(".", ",")
          : "",
      gestorId: empresa.gestor_id || "",
    });

    // sobe pro topo pra edição ficar visível
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function pedirConfirmacaoArquivar(empresaId) {
    setAcaoPendente({
      titulo: "Arquivar complexo",
      mensagem: "Arquivar este complexo?",
      textoConfirmar: "Arquivar",
      executar: () => acaoArquivar(empresaId),
    });
    setConfirmacaoAberta(true);
  }

  async function acaoArquivar(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");
      await editarEmpresa(empresaId, { status: "ARQUIVADA" });
      setMensagemSucesso("Complexo arquivado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao arquivar:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao arquivar o complexo.");
    }
  }

  function pedirConfirmacaoBloquear(empresaId) {
    setAcaoPendente({
      titulo: "Bloquear complexo",
      mensagem: "Bloquear este complexo?",
      textoConfirmar: "Bloquear",
      executar: () => acaoBloquear(empresaId),
    });
    setConfirmacaoAberta(true);
  }

  async function acaoBloquear(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");
      await editarEmpresa(empresaId, { status: "BLOQUEADA" });
      setMensagemSucesso("Complexo bloqueado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao bloquear:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao bloquear o complexo.");
    }
  }

  function pedirConfirmacaoExcluir(empresaId) {
    setAcaoPendente({
      titulo: "Excluir definitivamente",
      mensagem: "⚠️ EXCLUIR DEFINITIVAMENTE? Isso é HARD DELETE. Só continue se tiver certeza.",
      textoConfirmar: "Excluir",
      executar: () => acaoExcluirHard(empresaId),
    });
    setConfirmacaoAberta(true);
  }

  async function acaoExcluirHard(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");
      await excluirEmpresa(empresaId);
      setMensagemSucesso("Complexo excluído definitivamente.");
      await carregarEmpresas();
      if (editandoId === empresaId) handleLimpar();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao excluir:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao excluir o complexo.");
    }
  }

  async function handleConfirmarAcao() {
    if (acaoPendente?.executar) {
      await acaoPendente.executar();
    }
    setConfirmacaoAberta(false);
    setAcaoPendente(null);
  }

  // =========================
  // MODAL CONSULTAR (busca + detalhe)
  // =========================
  function abrirModalConsultar() {
    setModalConsultarOpen(true);
    setConsultaQ("");
    setConsultaErro("");
    setConsultaRes({ gestores: [], empresas: [] });
    setSelecionado(null);
    setDetalheLoading(false);
    setDetalheErro("");
    setDetalheData(null);
  }

  function fecharModalConsultar() {
    setModalConsultarOpen(false);
    setConsultaQ("");
    setConsultaErro("");
    setConsultaRes({ gestores: [], empresas: [] });
    setSelecionado(null);
    setDetalheLoading(false);
    setDetalheErro("");
    setDetalheData(null);
  }

  async function buscarConsulta(q) {
    const termo = (q || "").trim();
    if (termo.length < 2) {
      setConsultaRes({ gestores: [], empresas: [] });
      setConsultaErro("");
      return;
    }

    try {
      setConsultaLoading(true);
      setConsultaErro("");

      const data = await consultar(termo);

      setConsultaRes({
        gestores: Array.isArray(data?.gestores) ? data.gestores : [],
        empresas: Array.isArray(data?.empresas) ? data.empresas : [],
      });
    } catch (err) {
      console.error("[ADMIN/CONSULTA] Erro:", err);
      const msgBackend = err.response?.data?.error;
      setConsultaErro(msgBackend || "Erro ao consultar. Tente novamente.");
      setConsultaRes({ gestores: [], empresas: [] });
    } finally {
      setConsultaLoading(false);
    }
  }

  // debounce do input do modal
  useEffect(() => {
    if (!modalConsultarOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buscarConsulta(consultaQ);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [consultaQ, modalConsultarOpen]);

  async function carregarDetalheSelecionado(item) {
    const detalheContainer = document.getElementById("admin-detalhe-scroll");
if (detalheContainer) {
  detalheContainer.scrollTop = 0;
}

    try {
      setSelecionado(item);
      setDetalheLoading(true);
      setDetalheErro("");
      setDetalheData(null);

      if (item.tipo === "GESTOR") {
        const data = await obterDetalheGestor(item.id);
        setDetalheData({ tipo: "GESTOR", ...data });
      } else {
        const data = await obterDetalheEmpresa(item.id);
        setDetalheData({ tipo: "EMPRESA", ...data });
      }
    } catch (err) {
      console.error("[ADMIN/DETALHE] Erro:", err);
      const msgBackend = err.response?.data?.error;
      setDetalheErro(msgBackend || "Erro ao carregar detalhe.");
      setDetalheData(null);
    } finally {
      setDetalheLoading(false);
    }
  }

  const quadrasPorEmpresaNoDetalheGestor = useMemo(() => {
    if (!detalheData || detalheData.tipo !== "GESTOR") return {};
    const quadras = Array.isArray(detalheData.quadras) ? detalheData.quadras : [];
    const map = {};
    for (const q of quadras) {
      const eid = q.empresa_id || "SEM_EMPRESA";
      if (!map[eid]) map[eid] = [];
      map[eid].push(q);
    }
    return map;
  }, [detalheData]);

  async function abrirHistorico(entidade_tipo, entidade_id) {
  if (!entidade_tipo || !entidade_id) {
    console.warn("[ADMIN/HISTORICO] entidade_tipo ou entidade_id ausente", {
      entidade_tipo,
      entidade_id,
    });
    setHistoricoErro("Não foi possível abrir o histórico (ID inválido).");
    return;
  }

  try {
    setModalHistoricoOpen(true);
    setHistoricoErro("");
    setHistoricoItens([]);
    setHistoricoMeta({ entidade_tipo, entidade_id });

    setHistoricoLoading(true);
    const data = await obterAuditLog({ entidade_tipo, entidade_id, limit: 80 });

    setHistoricoItens(Array.isArray(data?.itens) ? data.itens : []);
  } catch (err) {
    console.error("[ADMIN/HISTORICO] Erro:", err);
    setHistoricoErro(
      err?.response?.data?.error || "Erro ao carregar histórico."
    );
  } finally {
    setHistoricoLoading(false);
  }
}


function fecharHistorico() {
  setModalHistoricoOpen(false);
  setHistoricoErro("");
  setHistoricoItens([]);
  setHistoricoMeta({ entidade_tipo: "", entidade_id: "" });
}


  const BotaoPequeno = ({ children, onClick, className, title, disabled }) => (
    <button
      type="button"
      className={`${className || ""} btn-pequeno`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  )

  return (
    <div>
      <div className="flex-row">
        <h2 className="margin-0">Empresas / Complexos (Admin)</h2>
        <button type="button" className="btn-outlined btn-h36" onClick={abrirModalConsultar}>
          Consultar
        </button>
      </div>

      <p style={{ marginBottom: "16px" }}>
        Aqui o Admin pode criar, editar e gerenciar qualquer complexo da
        plataforma. Este formulário inclui a taxa (%) da plataforma e o vínculo
        com um gestor.
      </p>

      {/* CARD DO FORMULÁRIO */}
      <div className="card">
        <div className="flex-row-between">
          <h3 className="margin-0">
            {editandoId ? "Edição de Complexo" : "Cadastro de Complexo"}
          </h3>
          {editandoId && (
            <span className="text-muted-sm">
              Editando ID: <strong>{editandoId}</strong>
            </span>
          )}
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* NOME */}
          <div className="form-field">
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
            <small>Nome exibido no Flow e no painel.</small>
          </div>

          {/* ENDEREÇO RESUMIDO */}
          <div className="form-field">
            <label htmlFor="enderecoResumo">Endereço resumido *</label>
            <input
              id="enderecoResumo"
              name="enderecoResumo"
              type="text"
              value={form.enderecoResumo}
              onChange={handleChange}
              placeholder="Ex.: Rua X, 123 – Bairro Y – Cidade"
              required
            />
            <small>Usado no card do Flow para identificar a localização.</small>
          </div>

          {/* LINK MAPS */}
          <div className="form-field">
            <label htmlFor="linkMaps">Link Google Maps</label>
            <input
              id="linkMaps"
              name="linkMaps"
              type="url"
              value={form.linkMaps}
              onChange={handleChange}
              placeholder="Cole o link de compartilhamento do Maps"
            />
            <small>Usado para o botão “Ver no mapa”.</small>
          </div>

          {/* LINK REDE */}
          <div className="form-field">
            <label htmlFor="linkRede">Link de rede/social</label>
            <input
              id="linkRede"
              name="linkRede"
              type="url"
              value={form.linkRede}
              onChange={handleChange}
              placeholder="Ex.: https://instagram.com/seu_complexo"
            />
            <small>Opcional.</small>
          </div>

          {/* DESCRIÇÃO */}
          <div className="form-field form-field-full">
            <label htmlFor="descricao">Descrição do complexo</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={3}
              value={form.descricao}
              onChange={handleChange}
              placeholder="Resumo do que o complexo oferece."
            ></textarea>
            <small>Texto exibido na página de detalhes do complexo no Flow.</small>
          </div>

          {/* TAXA DO ADMIN */}
          <div className="form-field">
            <label htmlFor="taxa">Taxa da plataforma (%) *</label>
            <input
              id="taxa"
              name="taxa"
              type="text"
              value={form.taxa}
              onChange={handleChange}
              placeholder="Ex.: 20"
              required
            />
            <small>
              Percentual retido pela plataforma. Ex.: valor 100 → plataforma recebe 20.
            </small>
          </div>

          {/* GESTOR RESPONSÁVEL */}
          <div className="form-field">
            <label htmlFor="gestorId">Gestor responsável *</label>
            <select
              id="gestorId"
              name="gestorId"
              value={form.gestorId}
              onChange={handleChange}
              required
            >
              <option value="">
                {carregandoGestores ? "Carregando gestores..." : "Selecione um gestor..."}
              </option>
              {gestores.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome} {g.cpf ? `- ${g.cpf}` : ""}{" "}
                  {g.status && g.status !== "ATIVO" ? `(status: ${g.status})` : ""}
                </option>
              ))}
            </select>
            <small>Este será o dono do complexo no painel do Gestor e no Flow.</small>
          </div>

          {/* BOTÕES */}
          <div className="form-actions acoes-row">
            <button
              type="button"
              className="btn-outlined"
              onClick={handleLimpar}
              disabled={enviando}
            >
              {editandoId ? "Cancelar edição" : "Limpar"}
            </button>

            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando
                ? "Salvando..."
                : editandoId
                ? "Salvar alterações"
                : "Salvar complexo"}
            </button>
          </div>

          {mensagemSucesso && <p className="form-message success">{mensagemSucesso}</p>}
          {mensagemErro && <p className="form-message error">{mensagemErro}</p>}
        </form>
      </div>

      {/* CARD DA LISTA */}
      <div className="card card-mb-lg">
        <div className="flex-row-between">
          <h3 className="margin-0">Lista de complexos cadastrados</h3>
          <button
            type="button"
            className="btn-outlined btn-h36"
            onClick={carregarEmpresas}
            disabled={carregandoLista}
          >
            {carregandoLista ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregandoLista && <p>Carregando complexos...</p>}

        {!carregandoLista && empresas.length === 0 && (
          <p>Nenhum complexo cadastrado ainda.</p>
        )}

        {!carregandoLista && empresas.length > 0 && (
          <div className="empresas-grid">
            {empresas.map((empresa) => (
              <div key={empresa.id} className="empresa-card">
                <div className="empresa-card-header flex-row-between">
                  <h4 className="empresa-nome margin-0">
                    {empresa.nome || "Complexo"}
                  </h4>
                  {empresa.status && (
                    <span className="empresa-status">{empresa.status}</span>
                  )}
                </div>

                <div className="empresa-detalhes empresa-detalhes-mt">
                  {empresa.endereco_resumo && (
                    <p>
                      <strong>Endereço:</strong> {empresa.endereco_resumo}
                    </p>
                  )}
                  {empresa.descricao_complexo && (
                    <p>
                      <strong>Descrição:</strong> {empresa.descricao_complexo}
                    </p>
                  )}
                  {empresa.taxa_plataforma != null && (
                    <p>
                      <strong>Taxa:</strong> {empresa.taxa_plataforma}%
                    </p>
                  )}
                </div>

                <div className="empresa-card-acoes">
                  <BotaoPequeno className="btn-primary" onClick={() => preencherFormParaEditar(empresa)}>Editar</BotaoPequeno>
                  <BotaoPequeno className="btn-outlined" onClick={() => pedirConfirmacaoArquivar(empresa.id)}>Arquivar</BotaoPequeno>
                  <BotaoPequeno className="btn-outlined" onClick={() => pedirConfirmacaoBloquear(empresa.id)}>Bloquear</BotaoPequeno>
                  <BotaoPequeno className="btn-outlined btn-outlined--danger" onClick={() => pedirConfirmacaoExcluir(empresa.id)}>Excluir</BotaoPequeno>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================
          MODAL CONSULTAR
         ========================= */}
      {modalConsultarOpen && (
        <div className="modal-overlay" onMouseDown={fecharModalConsultar}>
          <div
            ref={refModalConsultar}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-empresas-modal-consultar-titulo"
            tabIndex="-1"
            className="modal-card-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <strong id="admin-empresas-modal-consultar-titulo" className="text-bold-md">Consultar (Admin)</strong>
                <div className="text-muted-xs">
                  Digite para buscar por contém (gestores + empresas)
                </div>
              </div>
              <button type="button" className="btn-outlined" aria-label="Fechar modal" onClick={fecharModalConsultar}>
                Fechar
              </button>
            </div>

            <div className="modal-busca-area">
              <label className="modal-busca-label">Buscar</label>
              <input
                type="text"
                value={consultaQ}
                onChange={(e) => setConsultaQ(e.target.value)}
                placeholder="Ex.: nome do gestor, email, CPF, nome do complexo..."
                className="modal-busca-input"
              />
              <div className="modal-busca-hint">
                {consultaLoading ? "Buscando..." : consultaQ.trim().length < 2 ? "Digite pelo menos 2 caracteres." : ""}
              </div>
              {consultaErro && <div className="modal-busca-erro">{consultaErro}</div>}
            </div>

            <div className="modal-body-grid">
              <div className="modal-lista-col">
                <div className="resultado-titulo">Resultados</div>

                <div className="resultado-secao">
                  <div className="resultado-secao-titulo">Gestores</div>

                  {(!consultaLoading && (consultaRes.gestores || []).length === 0) ? (
                    <div className="resultado-vazio">Sem gestores</div>
                  ) : (
                    <div className="resultado-grid">
                      {(consultaRes.gestores || []).map((g) => {
                        const label = `${g.nome || "Gestor"}${g.email ? ` • ${g.email}` : ""}${g.cpf ? ` • ${g.cpf}` : ""}`
                        const ativoTxt = g.ativo === false ? " (inativo)" : ""
                        const selecionado_ = selecionado?.tipo === "GESTOR" && selecionado?.id === g.id
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => carregarDetalheSelecionado({ tipo: "GESTOR", id: g.id, label: label + ativoTxt })}
                            className="resultado-item"
                            style={selecionado_ ? { background: "#f1f5f9", boxShadow: "inset 0 0 0 2px #2563eb" } : undefined}
                          >
                            <div className="resultado-item-nome">{g.nome || "Gestor"}{ativoTxt}</div>
                            <div className="resultado-item-sub">{g.email || "—"} {g.cpf ? `• ${g.cpf}` : ""}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {modalHistoricoOpen && (
                  <div className="modal-overlay modal-overlay--top" onMouseDown={fecharHistorico}>
                    <div
                      ref={refModalHistorico}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="admin-empresas-modal-historico-titulo"
                      tabIndex="-1"
                      className="modal-card-lg"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="modal-header">
                        <div>
                          <strong id="admin-empresas-modal-historico-titulo" className="text-bold-md">Histórico (Audit Log)</strong>
                          <div className="text-muted-xs">
                            {historicoMeta.entidade_tipo} • {historicoMeta.entidade_id}
                          </div>
                        </div>
                        <button type="button" className="btn-outlined" aria-label="Fechar modal" onClick={fecharHistorico}>Fechar</button>
                      </div>

                      <div style={{ padding: 16, overflow: "auto", maxHeight: "70vh" }}>
                        {historicoLoading && <div className="text-bold-sm">Carregando histórico...</div>}
                        {!historicoLoading && historicoErro && <div className="msg-erro-inline">{historicoErro}</div>}
                        {!historicoLoading && !historicoErro && historicoItens.length === 0 && (
                          <div className="msg-vazio">Sem registros.</div>
                        )}
                        {!historicoLoading && !historicoErro && historicoItens.length > 0 && (
                          <div className="resultado-grid">
                            {historicoItens.map((it) => (
                              <div key={it.id} className="historico-item">
                                <div className="historico-item-header">
                                  <div className="historico-item-acao">{it.acao || "AÇÃO"}</div>
                                  <div className="historico-item-data">
                                    {it.created_at ? new Date(it.created_at).toLocaleString() : "—"}
                                  </div>
                                </div>
                                <div className="historico-item-entidade">
                                  Entidade: <strong>{it.entidade_label || `${it.entidade_tipo || "—"} • ${it.entidade_id || "—"}`}</strong>
                                </div>
                                {it.resumo && <div className="historico-item-resumo">{it.resumo}</div>}
                                <div className="historico-item-ator">
                                  Ator: <strong>{it.actor_label || `${it.actor_tipo || "—"} • ${it.actor_id || "—"}`}</strong>
                                </div>
                                {it.payload && (
                                  <details>
                                    <summary style={{ cursor: "pointer", fontSize: 12 }}>Ver payload</summary>
                                    <pre className="historico-payload-pre">{JSON.stringify(it.payload, null, 2)}</pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="modal-footer">
                        <button type="button" className="btn-outlined" onClick={fecharHistorico}>Fechar</button>
                      </div>
                    </div>
                  </div>
                )}


                <div>
                  <div className="resultado-secao-titulo">Empresas / Complexos</div>
                  {(!consultaLoading && (consultaRes.empresas || []).length === 0) ? (
                    <div className="resultado-vazio">
                      <div>Nenhuma empresa encontrada para o termo.</div>
                      {selecionado?.tipo === "GESTOR" && detalheData?.tipo === "GESTOR" && Array.isArray(detalheData?.empresas) && detalheData.empresas.length > 0 && (
                        <div className="text-muted-xs">
                          Este gestor tem <strong>{detalheData.empresas.length}</strong> empresas (veja no detalhe).
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="resultado-grid">
                      {(consultaRes.empresas || []).map((e) => {
                        const label = `${e.nome || "Complexo"}${e.slug ? ` • ${e.slug}` : ""}`
                        const ativoTxt = e.ativo === false ? " (inativo)" : ""
                        const selecionado_ = selecionado?.tipo === "EMPRESA" && selecionado?.id === e.id
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => carregarDetalheSelecionado({ tipo: "EMPRESA", id: e.id, label: label + ativoTxt })}
                            className="resultado-item"
                            style={selecionado_ ? { background: "#f1f5f9", boxShadow: "inset 0 0 0 2px #2563eb" } : undefined}
                          >
                            <div className="resultado-item-nome">{e.nome || "Complexo"}{ativoTxt}</div>
                            <div className="resultado-item-sub">{e.endereco_resumo || e.slug || "—"}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div id="admin-detalhe-scroll" className="modal-detalhe-col">
                <div className="resultado-titulo">Detalhe</div>

                {!selecionado && <div className="msg-vazio">Selecione um item na lista para ver o detalhe aqui.</div>}

                {detalheLoading && (
                  <div className="resultado-grid">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton-item" />)}
                  </div>
                )}

                {detalheErro && <div className="msg-erro-inline">{detalheErro}</div>}

                {!detalheLoading && !detalheErro && detalheData && detalheData.tipo === "GESTOR" && (
                  <div className="resultado-grid">
                    <div className="card kpi-card">
                      <div className="detalhe-titulo">{detalheData.gestor?.nome || "Gestor"}</div>
                      <div className="detalhe-subtitulo">
                        {detalheData.gestor?.email || "—"} {detalheData.gestor?.cpf ? `• ${detalheData.gestor.cpf}` : ""}
                      </div>
                      <div className="detalhe-meta">
                        Empresas: <strong>{detalheData.contagens?.empresas ?? 0}</strong> • Quadras: <strong>{detalheData.contagens?.quadras ?? 0}</strong>
                      </div>
                      <div className="detalhe-acoes">
                        <button type="button" className="btn-outlined" onClick={() => abrirHistorico("GESTOR", detalheData.gestor.id)}>Histórico</button>
                      </div>
                    </div>

                    <div className="card kpi-card">
                      <div className="text-bold-sm margin-bottom-sm">Empresas vinculadas</div>
                      {(detalheData.empresas || []).length === 0 ? (
                        <div className="msg-vazio">Nenhuma empresa vinculada.</div>
                      ) : (
                        <div className="resultado-grid">
                          {(detalheData.empresas || []).map((emp) => {
                            const qds = quadrasPorEmpresaNoDetalheGestor[emp.id] || []
                            return (
                              <div key={emp.id} className="empresa-detalhe-card">
                                <div className="empresa-detalhe-nome">{emp.nome || "Complexo"}</div>
                                <div className="empresa-detalhe-end">{emp.endereco_resumo || "—"}</div>
                                <div className="empresa-detalhe-qtd">Quadras: <strong>{qds.length}</strong></div>
                                {qds.length > 0 && (
                                  <div className="empresa-detalhe-quadras">
                                    {qds.slice(0, 8).map((q) => (
                                      <div key={q.id} className="empresa-detalhe-quadra-item">
                                        • {q.informacoes || "Quadra"} {q.modalidade ? `(${q.modalidade})` : ""} {q.status ? `— ${q.status}` : ""}
                                      </div>
                                    ))}
                                    {qds.length > 8 && <div className="text-muted-xs">+{qds.length - 8} quadras...</div>}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!detalheLoading && !detalheErro && detalheData && detalheData.tipo === "EMPRESA" && (
                  <div className="resultado-grid">
                    <div className="card kpi-card">
                      <div className="detalhe-titulo">{detalheData.empresa?.nome || "Complexo"}</div>
                      <div className="detalhe-subtitulo">{detalheData.empresa?.endereco_resumo || "—"}</div>
                      <div className="detalhe-meta">Quadras: <strong>{detalheData.contagens?.quadras ?? 0}</strong></div>
                      <div className="detalhe-acoes-multi">
                        <BotaoPequeno className="btn-primary" onClick={() => { preencherFormParaEditar(detalheData.empresa); fecharModalConsultar() }}>Editar</BotaoPequeno>
                        <BotaoPequeno className="btn-outlined" onClick={() => pedirConfirmacaoArquivar(detalheData.empresa?.id)}>Arquivar</BotaoPequeno>
                        <BotaoPequeno className="btn-outlined" onClick={() => pedirConfirmacaoBloquear(detalheData.empresa?.id)}>Bloquear</BotaoPequeno>
                        <BotaoPequeno className="btn-outlined" onClick={() => pedirConfirmacaoExcluir(detalheData.empresa?.id)} title="Hard delete">Excluir</BotaoPequeno>
                        {detalheData?.empresa?.id && (
                          <BotaoPequeno className="btn-outlined" onClick={() => abrirHistorico("EMPRESA", detalheData.empresa.id)}>Histórico</BotaoPequeno>
                        )}
                      </div>
                    </div>

                    <div className="card kpi-card">
                      <div className="text-bold-sm margin-bottom-sm">Gestor dono</div>
                      {detalheData.gestor ? (
                        <div>
                          <div><strong>{detalheData.gestor.nome || "Gestor"}</strong></div>
                          <div className="detalhe-subtitulo">{detalheData.gestor.email || "—"} {detalheData.gestor.cpf ? `• ${detalheData.gestor.cpf}` : ""}</div>
                        </div>
                      ) : (
                        <div className="msg-vazio">Não encontrado (ou não retornou do backend).</div>
                      )}
                    </div>

                    <div className="card kpi-card">
                      <div className="text-bold-sm margin-bottom-sm">Quadras</div>
                      {(detalheData.quadras || []).length === 0 ? (
                        <div className="msg-vazio">Nenhuma quadra cadastrada para esta empresa.</div>
                      ) : (
                        <div className="resultado-grid">
                          {(detalheData.quadras || []).map((q) => (
                            <div key={q.id} className="text-bold-sm">
                              <strong>{q.informacoes || "Quadra"}</strong> {q.modalidade ? `(${q.modalidade})` : ""} {q.status ? `— ${q.status}` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outlined" onClick={fecharModalConsultar}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        titulo={acaoPendente?.titulo || "Confirmar"}
        mensagem={acaoPendente?.mensagem || ""}
        onFechar={() => { setConfirmacaoAberta(false); setAcaoPendente(null); }}
        onConfirmar={handleConfirmarAcao}
        textoConfirmar={acaoPendente?.textoConfirmar || "Confirmar"}
      />
    </div>
  )
}

export default AdminEmpresasPage

