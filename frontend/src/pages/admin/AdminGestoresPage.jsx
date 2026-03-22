// src/pages/admin/AdminGestoresPage.jsx
import { useEffect, useMemo, useState } from "react"
import { useAdminGestores } from "../../hooks/api"
import { ErrorMessage, LoadingSpinner, ConfirmacaoModal } from "../../components/ui"
import useFocusTrap from "../../hooks/useFocusTrap"
import "./admin.css"

const Badge = ({ label, tone = "neutral" }) => (
  <span className={`badge-count badge-count--${tone}`}>{label}</span>
)

const chipStatus = (status) => {
  const s = String(status || "").toUpperCase()
  return <span className={s === "ATIVO" ? "chip-ativo" : "chip-inativo"}>{s || "-"}</span>
}

const Campo = ({ label, value, onChange, type = "text", step, disabled = false }) => (
  <div className="campo-form">
    <label className="campo-label">{label}</label>
    <input
      type={type}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="campo-input"
    />
  </div>
)

const Modal = ({ title, onClose, children }) => {
  const containerRef = useFocusTrap(true, onClose)

  return (
    <div className="modal-overlay-dark" onMouseDown={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex="-1"
        className="modal-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-titulo">{title}</div>
          <button type="button" onClick={onClose} className="modal-header-close" aria-label="Fechar modal">
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

const copiarTexto = async (texto) => {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    window.prompt("Copie o link:", texto)
    return true
  }
}

const AdminGestoresPage = () => {
  const { gestores, listar, criar, editar, promover, reenviarAtivacao: enviarAtivacao } = useAdminGestores()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")

  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("TODOS")
  const [filtroAtivacao, setFiltroAtivacao] = useState("TODOS")

  const [modalNovo, setModalNovo] = useState(false)
  const [novo, setNovo] = useState({
    nome: "", email: "", telefone: "", cpf: "", taxa_plataforma_global: "", tipo: "GESTOR",
  })
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [linkDevCriacao, setLinkDevCriacao] = useState("")

  const [modalEditar, setModalEditar] = useState(false)
  const [edit, setEdit] = useState(null)
  const [salvandoEdit, setSalvandoEdit] = useState(false)

  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false)
  const [acaoPendente, setAcaoPendente] = useState(null)

  const gestoresFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    let lista = Array.isArray(gestores) ? gestores : []

    if (filtroStatus !== "TODOS") {
      lista = lista.filter((g) => String(g.status || "").toUpperCase() === filtroStatus)
    }

    if (filtroAtivacao !== "TODOS") {
      lista = lista.filter((g) => {
        const ativado = !!g.senha_hash
        if (filtroAtivacao === "ATIVADO") return ativado
        if (filtroAtivacao === "PENDENTE") return !ativado
        return true
      })
    }

    if (!q) return lista

    return lista.filter((g) => {
      const nome = String(g.nome || "").toLowerCase()
      const email = String(g.email || "").toLowerCase()
      const cpf = String(g.cpf || "")
      const status = String(g.status || "").toLowerCase()
      const empresasTxt = Array.isArray(g.empresas)
        ? g.empresas.map((e) => String(e?.nome || "")).join(" ").toLowerCase()
        : ""
      return nome.includes(q) || email.includes(q) || cpf.includes(q) || status.includes(q) || empresasTxt.includes(q)
    })
  }, [gestores, busca, filtroStatus, filtroAtivacao])

  const contagem = useMemo(() => {
    const lista = Array.isArray(gestores) ? gestores : []
    const total = lista.length
    const ativos = lista.filter((g) => String(g.status || "").toUpperCase() === "ATIVO").length
    const inativos = lista.filter((g) => String(g.status || "").toUpperCase() === "INATIVO").length
    const pendentes = lista.filter((g) => !g.senha_hash).length
    const ativados = total - pendentes
    return { total, ativos, inativos, pendentes, ativados }
  }, [gestores])

  const carregar = async () => {
    setCarregando(true)
    setErro("")
    try {
      await listar()
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Falha ao carregar gestores. Verifique o backend.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const abrirNovo = () => {
    setErro("")
    setLinkDevCriacao("")
    setNovo({ nome: "", email: "", telefone: "", cpf: "", taxa_plataforma_global: "" })
    setModalNovo(true)
  }

  const abrirEditar = (gestor) => {
    setErro("")
    setEdit({
      id: gestor.id,
      nome: gestor.nome || "",
      email: gestor.email || "",
      cpf: gestor.cpf || "",
      status: gestor.status || "ATIVO",
      taxa_plataforma_global:
        gestor.taxa_plataforma_global == null ? "" : String(gestor.taxa_plataforma_global),
      tipo: gestor.tipo,
    })
    setModalEditar(true)
  }

  const criarGestor = async (e) => {
    e.preventDefault()
    setErro("")
    setLinkDevCriacao("")

    const payload = {
      nome: String(novo.nome || "").trim(),
      email: String(novo.email || "").trim().toLowerCase(),
      telefone: String(novo.telefone || "").trim() || null,
      cpf: String(novo.cpf || "").replace(/\D/g, "").trim(),
      taxa_plataforma_global: novo.taxa_plataforma_global === "" || novo.taxa_plataforma_global == null
        ? null : Number(novo.taxa_plataforma_global),
      tipo: novo.tipo,
    }

    if (!payload.nome || !payload.email || !payload.cpf) {
      setErro("Nome, email e CPF são obrigatórios.")
      return
    }
    if (payload.cpf.length !== 11) {
      setErro("CPF inválido (precisa ter 11 dígitos).")
      return
    }

    setSalvandoNovo(true)
    try {
      const data = await criar(payload)
      await carregar()
      if (data?.link_dev) {
        setLinkDevCriacao(data.link_dev)
      } else {
        setModalNovo(false)
      }
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Erro ao criar gestor. Verifique os dados e tente novamente.")
    } finally {
      setSalvandoNovo(false)
    }
  }

  const salvarEdicao = async (e) => {
    e.preventDefault()
    setErro("")
    if (!edit?.id) return

    const payload = {
      status: String(edit.status || "ATIVO").toUpperCase(),
      taxa_plataforma_global: edit.taxa_plataforma_global === "" || edit.taxa_plataforma_global == null
        ? null : Number(edit.taxa_plataforma_global),
    }

    setSalvandoEdit(true)
    try {
      await editar(edit.id, payload)
      await carregar()
      setModalEditar(false)
      setEdit(null)
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Erro ao salvar edição. Verifique o backend.")
    } finally {
      setSalvandoEdit(false)
    }
  }

  const pedirConfirmacaoPromover = () => {
    if (!edit?.id) return
    setAcaoPendente({
      titulo: "Promover para Admin",
      mensagem: `Tem certeza que deseja evoluir "${edit.nome}" para ADMIN? Ele terá acesso TOTAL ao sistema.`,
      textoConfirmar: "Promover",
      executar: promoverParaAdmin,
    })
    setConfirmacaoAberta(true)
  }

  const promoverParaAdmin = async () => {
    if (!edit?.id) return
    setErro("")
    try {
      await promover(edit.id)
      await carregar()
      setModalEditar(false)
      setEdit(null)
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Erro ao promover usuário para ADMIN.")
    }
  }

  const reenviarAtivacao = async (gestorId) => {
    setErro("")
    try {
      const data = await enviarAtivacao(gestorId)
      if (data?.link_dev) {
        await copiarTexto(data.link_dev)
        setMensagem("Link de ativação (DEV) copiado!")
      } else {
        setMensagem("Ativação reenviada (se email estiver configurado).")
      }
      setTimeout(() => setMensagem(""), 4000)
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Erro ao reenviar ativação. Verifique o backend.")
    }
  }

  const pedirConfirmacaoAlternarStatus = (g) => {
    const atual = String(g.status || "ATIVO").toUpperCase()
    const novoStatus = atual === "ATIVO" ? "INATIVO" : "ATIVO"
    setAcaoPendente({
      titulo: novoStatus === "INATIVO" ? "Bloquear gestor" : "Reativar gestor",
      mensagem: novoStatus === "INATIVO"
        ? `Bloquear "${g.nome}"? Ele NÃO conseguirá logar.`
        : `Reativar "${g.nome}"? Ele voltará a conseguir logar.`,
      textoConfirmar: novoStatus === "INATIVO" ? "Bloquear" : "Reativar",
      executar: () => alternarStatus(g),
    })
    setConfirmacaoAberta(true)
  }

  const alternarStatus = async (g) => {
    const atual = String(g.status || "ATIVO").toUpperCase()
    const novoStatus = atual === "ATIVO" ? "INATIVO" : "ATIVO"
    setErro("")
    try {
      await editar(g.id, { status: novoStatus })
      await carregar()
    } catch (err) {
      console.error(err)
      setErro(err?.response?.data?.error || "Erro ao alterar status.")
    }
  }

  const handleConfirmarAcao = async () => {
    if (acaoPendente?.executar) await acaoPendente.executar()
    setConfirmacaoAberta(false)
    setAcaoPendente(null)
  }

  return (
    <div className="page-root">
      <div className="page-header flex-row-between">
        <div>
          <h1 className="page-title">Gestores</h1>
          <p className="page-subtitle">
            Cadastre e gerencie clientes (tipo GESTOR). Ativação por link temporário (Modelo A).
          </p>
        </div>
        <button onClick={abrirNovo} className="btn-dark">
          + Novo Gestor
        </button>
      </div>

      <div className="card card-mb">
        <div className="busca-row">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, email, CPF, status ou complexo…"
            className="busca-input"
          />
          <button onClick={carregar} disabled={carregando} className="btn-light">
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      <div className="card card-mb">
        <div className="flex-wrap-row">
          <Badge label={`Total: ${contagem.total}`} tone="neutral" />
          <Badge label={`Ativos: ${contagem.ativos}`} tone="success" />
          <Badge label={`Inativos: ${contagem.inativos}`} tone="danger" />
          <Badge label={`Pendentes: ${contagem.pendentes}`} tone="warning" />

          <div className="flex-spacer" />

          <div className="flex-wrap-row">
            <div>
              <div className="filtro-label-mini">Status</div>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="select-mini">
                <option value="TODOS">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
            <div>
              <div className="filtro-label-mini">Ativação</div>
              <select value={filtroAtivacao} onChange={(e) => setFiltroAtivacao(e.target.value)} className="select-mini">
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATIVADO">Ativado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />
      {mensagem && <div className="alert-sucesso">{mensagem}</div>}

      <div className="card">
        {carregando ? (
          <LoadingSpinner mensagem="Carregando…" tamanho={24} />
        ) : gestoresFiltrados.length === 0 ? (
          <p className="msg-vazio">Nenhum gestor encontrado.</p>
        ) : (
          <div className="tabela-wrapper">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="tabela-th">Nome</th>
                  <th className="tabela-th">Email</th>
                  <th className="tabela-th">CPF</th>
                  <th className="tabela-th">Status</th>
                  <th className="tabela-th">Taxa (%)</th>
                  <th className="tabela-th">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gestoresFiltrados.map((g) => (
                  <tr key={g.id}>
                    <td className="tabela-td">
                      <div className="tabela-td-nome-principal">{g.nome}</div>
                      <div className="tabela-td-sub">
                        {Array.isArray(g.empresas) && g.empresas.length > 0
                          ? g.empresas.map((e) => e.nome).join(" • ")
                          : "Sem complexos cadastrados"}
                      </div>
                    </td>
                    <td className="tabela-td">{g.email}</td>
                    <td className="tabela-td">{g.cpf}</td>
                    <td className="tabela-td">
                      <div className="acoes-row">
                        {chipStatus(g.status)}
                        {!g.senha_hash ? <Badge label="Ativação pendente" tone="warning" /> : null}
                      </div>
                    </td>
                    <td className="tabela-td">
                      {g.taxa_plataforma_global == null ? "-" : String(g.taxa_plataforma_global)}
                    </td>
                    <td className="tabela-td">
                      <div className="acoes-row">
                        <button onClick={() => abrirEditar(g)} className="btn-light-small">
                          Editar
                        </button>
                        <button onClick={() => pedirConfirmacaoAlternarStatus(g)} className="btn-light-small">
                          {String(g.status || "").toUpperCase() === "ATIVO" ? "Bloquear" : "Ativar"}
                        </button>
                        {!g.senha_hash && (
                          <button onClick={() => reenviarAtivacao(g.id)} className="btn-dark-small">
                            Reenviar ativação
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalNovo && (
        <Modal title="Novo Gestor" onClose={() => setModalNovo(false)}>
          <form onSubmit={criarGestor}>
            <Campo label="Nome completo" value={novo.nome} onChange={(v) => setNovo({ ...novo, nome: v })} />
            <Campo label="Email" type="email" value={novo.email} onChange={(v) => setNovo({ ...novo, email: v })} />
            <Campo label="Telefone (opcional)" value={novo.telefone} onChange={(v) => setNovo({ ...novo, telefone: v })} />
            <Campo label="CPF (11 dígitos)" value={novo.cpf} onChange={(v) => setNovo({ ...novo, cpf: v })} />

            <div className="campo-form">
              <label className="campo-label">Tipo de usuário</label>
              <select
                value={novo.tipo}
                onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
                className="campo-select"
              >
                <option value="GESTOR">Gestor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <Campo
              label="Taxa plataforma global (opcional)"
              type="number"
              step="0.01"
              value={novo.taxa_plataforma_global}
              onChange={(v) => setNovo({ ...novo, taxa_plataforma_global: v })}
            />

            {linkDevCriacao && (
              <div className="link-dev-box">
                <div className="link-dev-titulo">Link de ativação (DEV)</div>
                <div className="link-dev-texto">{linkDevCriacao}</div>
                <div className="link-dev-acoes">
                  <button
                    type="button"
                    onClick={() => copiarTexto(linkDevCriacao)}
                    className="btn-dark-small"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
            )}

            <div className="modal-acoes">
              <button type="button" onClick={() => setModalNovo(false)} disabled={salvandoNovo} className="btn-light">
                Cancelar
              </button>
              <button type="submit" disabled={salvandoNovo} className="btn-dark">
                {salvandoNovo ? "Salvando..." : "Salvar gestor"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalEditar && edit && (
        <Modal title="Editar Gestor" onClose={() => setModalEditar(false)}>
          <form onSubmit={salvarEdicao}>
            <Campo label="Nome" value={edit.nome} onChange={() => {}} disabled />
            <Campo label="Email" type="email" value={edit.email} onChange={(v) => setEdit({ ...edit, email: v })} />
            <Campo label="CPF" value={edit.cpf} onChange={() => {}} disabled />

            <div className="campo-form">
              <label className="campo-label-heavy">Status</label>
              <select
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                className="campo-select"
              >
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </div>

            <Campo
              label="Taxa plataforma global"
              type="number"
              step="0.01"
              value={edit.taxa_plataforma_global}
              onChange={(v) => setEdit({ ...edit, taxa_plataforma_global: v })}
            />

            <div className="modal-acoes">
              {edit.tipo === "GESTOR" && (
                <button
                  type="button"
                  onClick={pedirConfirmacaoPromover}
                  disabled={salvandoEdit}
                  className="btn-danger-dark"
                >
                  Evoluir para ADMIN
                </button>
              )}
              <button type="button" onClick={() => setModalEditar(false)} disabled={salvandoEdit} className="btn-light">
                Cancelar
              </button>
              <button type="submit" disabled={salvandoEdit} className="btn-dark">
                {salvandoEdit ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </Modal>
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

export default AdminGestoresPage
