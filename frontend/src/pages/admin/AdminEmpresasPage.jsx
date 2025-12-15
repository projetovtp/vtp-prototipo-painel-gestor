// src/pages/admin/AdminEmpresasPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";

function AdminEmpresasPage() {
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

  const [empresas, setEmpresas] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [gestores, setGestores] = useState([]);
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
      const { data } = await api.get("/admin/empresas");
      setEmpresas(Array.isArray(data) ? data : []);
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
      const { data } = await api.get("/admin/gestores-resumo");
      setGestores(Array.isArray(data) ? data : []);
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
        const { data } = await api.put(`/admin/empresas/${editandoId}`, payload);
        console.log("[ADMIN/EMPRESAS] Empresa atualizada:", data);
        setMensagemSucesso("Complexo atualizado com sucesso.");
      } else {
        const { data } = await api.post("/admin/empresas", payload);
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

  async function acaoArquivar(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");
      const ok = window.confirm(
        "Arquivar este complexo?\n\n(Se sua regra for diferente, me diga quais campos/valores o backend espera.)"
      );
      if (!ok) return;

      // Ajuste aqui se seu backend usa outro campo (ex.: ativo=false)
      await api.put(`/admin/empresas/${empresaId}`, { status: "ARQUIVADA" });

      setMensagemSucesso("Complexo arquivado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao arquivar:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao arquivar o complexo.");
    }
  }

  async function acaoBloquear(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");
      const ok = window.confirm(
        "Bloquear este complexo?\n\n(Se sua regra for diferente, me diga quais campos/valores o backend espera.)"
      );
      if (!ok) return;

      // Ajuste aqui se seu backend usa outro campo (ex.: ativo=false)
      await api.put(`/admin/empresas/${empresaId}`, { status: "BLOQUEADA" });

      setMensagemSucesso("Complexo bloqueado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao bloquear:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao bloquear o complexo.");
    }
  }

  async function acaoExcluirHard(empresaId) {
    try {
      setMensagemSucesso("");
      setMensagemErro("");

      const ok = window.confirm(
        "⚠️ EXCLUIR DEFINITIVAMENTE?\n\nIsso é HARD DELETE.\nSó continue se tiver certeza."
      );
      if (!ok) return;

      await api.delete(`/admin/empresas/${empresaId}?confirm=DELETE`);

      setMensagemSucesso("Complexo excluído definitivamente.");
      await carregarEmpresas();

      // se estava editando esse item, limpa
      if (editandoId === empresaId) handleLimpar();
    } catch (err) {
      console.error("[ADMIN/EMPRESAS] Erro ao excluir:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(msgBackend || "Erro ao excluir o complexo.");
    }
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

      const { data } = await api.get(`/admin/consulta?q=${encodeURIComponent(termo)}`);

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
        const { data } = await api.get(`/admin/gestores/${item.id}/detalhe`);
        setDetalheData({ tipo: "GESTOR", ...data });
      } else {
        const { data } = await api.get(`/admin/empresas/${item.id}/detalhe`);
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
    const { data } = await api.get(
      `/admin/audit-log?entidade_tipo=${encodeURIComponent(
        entidade_tipo
      )}&entidade_id=${encodeURIComponent(entidade_id)}&limit=80`
    );

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


  // =========================
  // UI do Modal (estilo simples, sem depender de CSS externo)
  // =========================
  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  };

  const modalCardStyle = {
    width: "min(1100px, 98vw)",
    maxHeight: "90vh",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
  };

  const modalHeaderStyle = {
    padding: "14px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const modalBodyStyle = {
  padding: 16,
  display: "grid",
  gridTemplateColumns: "380px 1fr",
  gap: 16,
  height: "100%",
};


  const modalFooterStyle = {
    padding: 12,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  };

  function BotaoPequeno({ children, onClick, className, title, disabled }) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        title={title}
        disabled={disabled}
        style={{
          padding: "8px 10px",
          fontSize: 13,
          borderRadius: 8,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Empresas / Complexos (Admin)</h2>
        <button
          type="button"
          className="btn-outlined"
          onClick={abrirModalConsultar}
          style={{ height: 36 }}
        >
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>
            {editandoId ? "Edição de Complexo" : "Cadastro de Complexo"}
          </h3>
          {editandoId && (
            <span style={{ fontSize: 13, opacity: 0.8 }}>
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
          <div className="form-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
      <div className="card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Lista de complexos cadastrados</h3>
          <button
            type="button"
            className="btn-outlined"
            onClick={carregarEmpresas}
            disabled={carregandoLista}
            style={{ height: 36 }}
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
                <div className="empresa-card-header" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <h4 className="empresa-nome" style={{ margin: 0 }}>
                    {empresa.nome || "Complexo"}
                  </h4>
                  {empresa.status && (
                    <span className="empresa-status">{empresa.status}</span>
                  )}
                </div>

                <div className="empresa-detalhes" style={{ marginTop: 8 }}>
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

                {/* AÇÕES */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => preencherFormParaEditar(empresa)}
                    style={{ padding: "8px 10px", fontSize: 13, borderRadius: 8 }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-outlined"
                    onClick={() => acaoArquivar(empresa.id)}
                    style={{ padding: "8px 10px", fontSize: 13, borderRadius: 8 }}
                  >
                    Arquivar
                  </button>

                  <button
                    type="button"
                    className="btn-outlined"
                    onClick={() => acaoBloquear(empresa.id)}
                    style={{ padding: "8px 10px", fontSize: 13, borderRadius: 8 }}
                  >
                    Bloquear
                  </button>

                  <button
                    type="button"
                    className="btn-outlined"
                    onClick={() => acaoExcluirHard(empresa.id)}
                    style={{
                      padding: "8px 10px",
                      fontSize: 13,
                      borderRadius: 8,
                      borderColor: "#c00",
                      color: "#c00",
                    }}
                  >
                    Excluir
                  </button>
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
        <div style={modalOverlayStyle} onMouseDown={fecharModalConsultar}>
          <div style={modalCardStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <strong style={{ fontSize: 16 }}>Consultar (Admin)</strong>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Digite para buscar por contém (gestores + empresas)
                </div>
              </div>

              <button type="button" className="btn-outlined" onClick={fecharModalConsultar}>
                Fechar
              </button>
            </div>

            <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                Buscar
              </label>
              <input
                type="text"
                value={consultaQ}
                onChange={(e) => setConsultaQ(e.target.value)}
                placeholder="Ex.: nome do gestor, email, CPF, nome do complexo..."
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  outline: "none",
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                {consultaLoading
                  ? "Buscando..."
                  : consultaQ.trim().length < 2
                  ? "Digite pelo menos 2 caracteres."
                  : ""}
              </div>
              {consultaErro && (
                <div style={{ marginTop: 8, color: "#c00", fontSize: 13 }}>
                  {consultaErro}
                </div>
              )}
            </div>

            <div style={modalBodyStyle}>
              {/* COLUNA ESQUERDA: LISTA */}
                <div style={{ overflowY: "auto", maxHeight: "calc(90vh - 200px)" }}>

                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Resultados
                </div>

                {/* Gestores */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 6 }}>
                    Gestores
                  </div>

                  {(!consultaLoading && (consultaRes.gestores || []).length === 0) ? (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Sem gestores</div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {(consultaRes.gestores || []).map((g) => {
                        const label = `${g.nome || "Gestor"}${g.email ? ` • ${g.email}` : ""}${
                          g.cpf ? ` • ${g.cpf}` : ""
                        }`;
                        const ativoTxt =
                          g.ativo === false ? " (inativo)" : "";

                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() =>
                              carregarDetalheSelecionado({
                                tipo: "GESTOR",
                                id: g.id,
                                label: label + ativoTxt,
                              })
                            }
                            style={{
                              textAlign: "left",
                              padding: 10,
                              borderRadius: 10,
                              border: "1px solid #e6e6e6",
                              background:
                                selecionado?.tipo === "GESTOR" && selecionado?.id === g.id
                                   ? "#f1f5f9"
                                   : "#fff",
                              boxShadow:
                                selecionado?.tipo === "GESTOR" && selecionado?.id === g.id
                                   ? "inset 0 0 0 2px #2563eb"
                                   : "none",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 13 }}>
                              {g.nome || "Gestor"}{ativoTxt}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>
                              {g.email || "—"} {g.cpf ? `• ${g.cpf}` : ""}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* =========================
    MODAL HISTÓRICO (audit_log)
   ========================= */}
{modalHistoricoOpen && (
  <div style={modalOverlayStyle} onMouseDown={fecharHistorico}>
    <div style={modalCardStyle} onMouseDown={(e) => e.stopPropagation()}>
      <div style={modalHeaderStyle}>
        <div>
          <strong style={{ fontSize: 16 }}>Histórico (Audit Log)</strong>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {historicoMeta.entidade_tipo} • {historicoMeta.entidade_id}
          </div>
        </div>

        <button type="button" className="btn-outlined" onClick={fecharHistorico}>
          Fechar
        </button>
      </div>

      <div style={{ padding: 16, overflow: "auto", maxHeight: "70vh" }}>
        {historicoLoading && <div style={{ fontSize: 13 }}>Carregando histórico...</div>}

        {!historicoLoading && historicoErro && (
          <div style={{ fontSize: 13, color: "#c00" }}>{historicoErro}</div>
        )}

        {!historicoLoading && !historicoErro && historicoItens.length === 0 && (
          <div style={{ fontSize: 13, opacity: 0.75 }}>Sem registros.</div>
        )}

        {!historicoLoading && !historicoErro && historicoItens.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {historicoItens.map((it) => (
              <div
                key={it.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 10,
                  padding: 10,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{it.acao || "AÇÃO"}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {it.created_at ? new Date(it.created_at).toLocaleString() : "—"}
                  </div>
                </div>
                {/* NOVO: Entidade com label */}
<div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
  Entidade:{" "}
  <strong>{it.entidade_label || `${it.entidade_tipo || "—"} • ${it.entidade_id || "—"}`}</strong>
</div>

{it.resumo && (
  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{it.resumo}</div>
)}

{/* NOVO: Ator com label */}
<div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
  Ator:{" "}
  <strong>{it.actor_label || `${it.actor_tipo || "—"} • ${it.actor_id || "—"}`}</strong>
</div>
                {it.resumo && (
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{it.resumo}</div>
                )}

                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                  Ator: <strong>{it.actor_tipo || "—"}</strong>{" "}
                  {it.actor_label ? `• ${it.actor_label}` : ""}
                </div>

                {it.payload && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer", fontSize: 12 }}>
                      Ver payload
                    </summary>
                    <pre
                      style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 10,
                        background: "#0b1220",
                        color: "#f9fafb",
                        overflow: "auto",
                        fontSize: 12,
                      }}
                    >
                      {JSON.stringify(it.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={modalFooterStyle}>
        <button type="button" className="btn-outlined" onClick={fecharHistorico}>
          Fechar
        </button>
      </div>
    </div>
  </div>
)}


                {/* Empresas */}
<div>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      opacity: 0.8,
      marginBottom: 6,
    }}
  >
    Empresas / Complexos
  </div>

  {(!consultaLoading && (consultaRes.empresas || []).length === 0) ? (
    <div style={{ fontSize: 12, opacity: 0.7 }}>
      <div>Nenhuma empresa encontrada para o termo.</div>

      {(
        selecionado?.tipo === "GESTOR" &&
        detalheData?.tipo === "GESTOR" &&
        Array.isArray(detalheData?.empresas) &&
        detalheData.empresas.length > 0
      ) ? (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
          Este gestor tem <strong>{detalheData.empresas.length}</strong> empresas
          (veja no detalhe).
        </div>
      ) : null}
    </div>
  ) : (
    <div style={{ display: "grid", gap: 8 }}>
      {(consultaRes.empresas || []).map((e) => {
        const label = `${e.nome || "Complexo"}${e.slug ? ` • ${e.slug}` : ""}`;
        const ativoTxt = e.ativo === false ? " (inativo)" : "";

        return (
          <button
            key={e.id}
            type="button"
            onClick={() =>
              carregarDetalheSelecionado({
                tipo: "EMPRESA",
                id: e.id,
                label: label + ativoTxt,
              })
            }
            style={{
              textAlign: "left",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e6e6e6",
              background:
  selecionado?.tipo === "EMPRESA" && selecionado?.id === e.id
    ? "#f1f5f9"
    : "#fff",
boxShadow:
  selecionado?.tipo === "EMPRESA" && selecionado?.id === e.id
    ? "inset 0 0 0 2px #2563eb"
    : "none",

              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {e.nome || "Complexo"}
              {ativoTxt}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {e.endereco_resumo || e.slug || "—"}
            </div>
          </button>
        );
      })}
    </div>
  )}
</div>
</div>

{/* COLUNA DIREITA: DETALHE */}
<div
  id="admin-detalhe-scroll"
  style={{
    borderLeft: "1px solid #eee",
    paddingLeft: 16,
    overflowY: "auto",
    maxHeight: "calc(90vh - 200px)",
  }}
>


  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
    Detalhe
  </div>

  {!selecionado && (
    <div style={{ fontSize: 13, opacity: 0.75 }}>
      Selecione um item na lista para ver o detalhe aqui.
    </div>
  )}

  {detalheLoading && (
  <div style={{ display: "grid", gap: 10 }}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: 48,
          borderRadius: 10,
          background:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)",
          backgroundSize: "400% 100%",
          animation: "skeleton 1.4s ease infinite",
        }}
      />
    ))}
  </div>
)}


  {detalheErro && (
    <div style={{ fontSize: 13, color: "#c00" }}>{detalheErro}</div>
  )}

  {!detalheLoading &&
    !detalheErro &&
    detalheData &&
    detalheData.tipo === "GESTOR" && (
      <div style={{ display: "grid", gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            {detalheData.gestor?.nome || "Gestor"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {detalheData.gestor?.email || "—"}{" "}
            {detalheData.gestor?.cpf ? `• ${detalheData.gestor.cpf}` : ""}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Empresas:{" "}
            <strong>{detalheData.contagens?.empresas ?? 0}</strong> • Quadras:{" "}
            <strong>{detalheData.contagens?.quadras ?? 0}</strong>
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className="btn-outlined"
              onClick={() => abrirHistorico("GESTOR", detalheData.gestor.id)}

            >
              Histórico
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
            Empresas vinculadas
          </div>

          {(detalheData.empresas || []).length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Nenhuma empresa vinculada.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {(detalheData.empresas || []).map((emp) => {
                const qds = quadrasPorEmpresaNoDetalheGestor[emp.id] || [];
                return (
                  <div
                    key={emp.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      {emp.nome || "Complexo"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {emp.endereco_resumo || "—"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                      Quadras: <strong>{qds.length}</strong>
                    </div>

                    {qds.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "grid",
                          gap: 6,
                        }}
                      >
                        {qds.slice(0, 8).map((q) => (
                          <div
                            key={q.id}
                            style={{ fontSize: 12, opacity: 0.9 }}
                          >
                            • {q.informacoes || "Quadra"}{" "}
                            {q.modalidade ? `(${q.modalidade})` : ""}{" "}
                            {q.status ? `— ${q.status}` : ""}
                          </div>
                        ))}
                        {qds.length > 8 && (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            +{qds.length - 8} quadras...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

  {!detalheLoading &&
    !detalheErro &&
    detalheData &&
    detalheData.tipo === "EMPRESA" && (
      <div style={{ display: "grid", gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            {detalheData.empresa?.nome || "Complexo"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {detalheData.empresa?.endereco_resumo || "—"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Quadras: <strong>{detalheData.contagens?.quadras ?? 0}</strong>
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <BotaoPequeno
              className="btn-primary"
              onClick={() => {
                preencherFormParaEditar(detalheData.empresa);
                fecharModalConsultar();
              }}
            >
              Editar
            </BotaoPequeno>

            <BotaoPequeno
              className="btn-outlined"
              onClick={() => acaoArquivar(detalheData.empresa?.id)}
            >
              Arquivar
            </BotaoPequeno>

            <BotaoPequeno
              className="btn-outlined"
              onClick={() => acaoBloquear(detalheData.empresa?.id)}
            >
              Bloquear
            </BotaoPequeno>

            <BotaoPequeno
              className="btn-outlined"
              onClick={() => acaoExcluirHard(detalheData.empresa?.id)}
              title="Hard delete"
            >
              Excluir
            </BotaoPequeno>
            {detalheData?.empresa?.id && (
  <BotaoPequeno
    className="btn-outlined"
    onClick={() => abrirHistorico("EMPRESA", detalheData.empresa.id)}
  >
    Histórico
  </BotaoPequeno>
)}


          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
            Gestor dono
          </div>
          {detalheData.gestor ? (
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              <div>
                <strong>{detalheData.gestor.nome || "Gestor"}</strong>
              </div>
              <div style={{ opacity: 0.85 }}>
                {detalheData.gestor.email || "—"}{" "}
                {detalheData.gestor.cpf ? `• ${detalheData.gestor.cpf}` : ""}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Não encontrado (ou não retornou do backend).
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
            Quadras
          </div>

          {(detalheData.quadras || []).length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Nenhuma quadra cadastrada para esta empresa.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {(detalheData.quadras || []).map((q) => (
                <div key={q.id} style={{ fontSize: 13 }}>
                  <strong>{q.informacoes || "Quadra"}</strong>{" "}
                   {q.modalidade ? `(${q.modalidade})` : ""}{" "}
                   {q.status ? `— ${q.status}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
</div>
</div>

<div style={modalFooterStyle}>
  <button
    type="button"
    className="btn-outlined"
    onClick={fecharModalConsultar}
  >
    Fechar
  </button>
</div>
</div>
</div>
)}
</div>
);
}

export default AdminEmpresasPage;

