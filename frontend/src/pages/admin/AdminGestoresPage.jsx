// src/pages/admin/AdminGestoresPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

export default function AdminGestoresPage() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [gestores, setGestores] = useState([]);

  // Busca
  const [busca, setBusca] = useState("");

  // Filtros UX
   const [filtroStatus, setFiltroStatus] = useState("TODOS"); // TODOS | ATIVO | INATIVO
   const [filtroAtivacao, setFiltroAtivacao] = useState("TODOS"); // TODOS | PENDENTE | ATIVADO

  // Modal: Novo Gestor
  const [modalNovo, setModalNovo] = useState(false);
  const [novo, setNovo] = useState({
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  taxa_plataforma_global: "",
  tipo: "GESTOR",
});

  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [linkDevCriacao, setLinkDevCriacao] = useState("");

  // Modal: Editar
  const [modalEditar, setModalEditar] = useState(false);
  const [edit, setEdit] = useState(null);
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  const gestoresFiltrados = useMemo(() => {
  const q = busca.trim().toLowerCase();
  let lista = Array.isArray(gestores) ? gestores : [];

  // Filtro por status
  if (filtroStatus !== "TODOS") {
    lista = lista.filter(
      (g) => String(g.status || "").toUpperCase() === filtroStatus
    );
  }

  // Filtro por ativação (pendente = sem senha)
  if (filtroAtivacao !== "TODOS") {
    lista = lista.filter((g) => {
      const ativado = !!g.senha_hash;
      if (filtroAtivacao === "ATIVADO") return ativado;
      if (filtroAtivacao === "PENDENTE") return !ativado;
      return true;
    });
  }

  // Busca por texto
  if (!q) return lista;

  return lista.filter((g) => {
    const nome = String(g.nome || "").toLowerCase();
    const email = String(g.email || "").toLowerCase();
    const cpf = String(g.cpf || "");
    const status = String(g.status || "").toLowerCase();

    // 🔥 empresas/complexos (precisa vir do backend em g.empresas)
    const empresasTxt = Array.isArray(g.empresas)
      ? g.empresas
          .map((e) => String(e?.nome || ""))
          .join(" ")
          .toLowerCase()
      : "";

    return (
      nome.includes(q) ||
      email.includes(q) ||
      cpf.includes(q) ||
      status.includes(q) ||
      empresasTxt.includes(q)
    );
  });
}, [gestores, busca, filtroStatus, filtroAtivacao]);


const contagem = useMemo(() => {
  const lista = Array.isArray(gestores) ? gestores : [];
  const total = lista.length;

  const ativos = lista.filter((g) => String(g.status || "").toUpperCase() === "ATIVO").length;
  const inativos = lista.filter((g) => String(g.status || "").toUpperCase() === "INATIVO").length;

  const pendentes = lista.filter((g) => !g.senha_hash).length; // sem senha definida
  const ativados = total - pendentes;

  return { total, ativos, inativos, pendentes, ativados };
}, [gestores]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      // Você já tem /admin/gestores-resumo no backend
      const { data } = await api.get("/admin/gestores-resumo");
      setGestores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.error ||
          "Falha ao carregar gestores. Verifique o backend."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setErro("");
    setLinkDevCriacao("");
    setNovo({
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      taxa_plataforma_global: "",
    });
    setModalNovo(true);
  }

  function abrirEditar(gestor) {
    setErro("");
    setEdit({
      id: gestor.id,
      nome: gestor.nome || "",
      email: gestor.email || "",
      cpf: gestor.cpf || "",
      status: gestor.status || "ATIVO",
      taxa_plataforma_global:
        gestor.taxa_plataforma_global === undefined ||
        gestor.taxa_plataforma_global === null
          ? ""
          : String(gestor.taxa_plataforma_global),
      tipo: gestor.tipo,    
    });
    setModalEditar(true);
  }

  async function criarGestor(e) {
    e.preventDefault();
    setErro("");
    setLinkDevCriacao("");

    const payload = {
      nome: String(novo.nome || "").trim(),
      email: String(novo.email || "").trim().toLowerCase(),
      telefone: String(novo.telefone || "").trim() || null,
      cpf: String(novo.cpf || "").replace(/\D/g, "").trim(),
      taxa_plataforma_global:
        novo.taxa_plataforma_global === "" || novo.taxa_plataforma_global == null
          ? null
          : Number(novo.taxa_plataforma_global),
      tipo: novo.tipo,    
    };

    if (!payload.nome || !payload.email || !payload.cpf) {
      setErro("Nome, email e CPF são obrigatórios.");
      return;
    }
    if (payload.cpf.length !== 11) {
      setErro("CPF inválido (precisa ter 11 dígitos).");
      return;
    }
    if (
      payload.taxa_plataforma_global != null &&
      Number.isNaN(payload.taxa_plataforma_global)
    ) {
      setErro("Taxa plataforma inválida.");
      return;
    }

    setSalvandoNovo(true);
    try {
      // POST /admin/gestores (Modelo A)
      const { data } = await api.post("/admin/usuarios", payload);

      await carregar();

      // Se estiver em dev mode no backend, ele retorna link_dev
      if (data?.link_dev) {
        setLinkDevCriacao(data.link_dev);
        // mantém modal aberto para copiar
      } else {
        setModalNovo(false);
      }
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.error ||
          "Erro ao criar gestor. Verifique os dados e tente novamente."
      );
    } finally {
      setSalvandoNovo(false);
    }
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    setErro("");

    if (!edit?.id) return;

    const payload = {
      status: String(edit.status || "ATIVO").toUpperCase(),
      taxa_plataforma_global:
        edit.taxa_plataforma_global === "" || edit.taxa_plataforma_global == null
          ? null
          : Number(edit.taxa_plataforma_global),
    };

    if (!["ATIVO", "INATIVO"].includes(payload.status)) {
      setErro("Status inválido. Use ATIVO ou INATIVO.");
      return;
    }
    if (
      payload.taxa_plataforma_global != null &&
      Number.isNaN(payload.taxa_plataforma_global)
    ) {
      setErro("Taxa plataforma inválida.");
      return;
    }

    setSalvandoEdit(true);
    try {
      // Precisa existir no backend:
      // PUT /admin/gestores/:id
      await api.put(`/admin/gestores/${edit.id}`, payload);

      await carregar();
      setModalEditar(false);
      setEdit(null);
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.error ||
          "Erro ao salvar edição. Verifique o backend."
      );
    } finally {
      setSalvandoEdit(false);
    }
  }
  async function promoverParaAdmin() {
  if (!edit?.id) return;

  const ok = window.confirm(
    `Tem certeza que deseja evoluir "${edit.nome}" para ADMIN?\n\nEle terá acesso TOTAL ao sistema.`
  );
  if (!ok) return;

  setErro("");
  try {
    await api.put(`/admin/usuarios/${edit.id}/promover`);
    await carregar();
    setModalEditar(false);
    setEdit(null);
  } catch (err) {
    console.error(err);
    setErro(
      err?.response?.data?.error ||
        "Erro ao promover usuário para ADMIN."
    );
  }
}

  async function reenviarAtivacao(gestorId) {
    setErro("");
    try {
      // Precisa existir no backend:
      // POST /admin/gestores/:id/reenviar-ativacao
      const { data } = await api.post(
        `/admin/gestores/${gestorId}/reenviar-ativacao`
      );

      if (data?.link_dev) {
        await copiarTexto(data.link_dev);
        alert("Link de ativação (DEV) copiado!");
      } else {
        alert("Ativação reenviada (se email estiver configurado).");
      }
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.error ||
          "Erro ao reenviar ativação. Verifique o backend."
      );
    }
  }
  async function alternarStatus(g) {
  const atual = String(g.status || "ATIVO").toUpperCase();
  const novoStatus = atual === "ATIVO" ? "INATIVO" : "ATIVO";

  const ok = window.confirm(
    novoStatus === "INATIVO"
      ? `Bloquear "${g.nome}"?\nEle NÃO conseguirá logar.`
      : `Reativar "${g.nome}"?\nEle voltará a conseguir logar.`
  );
  if (!ok) return;

  setErro("");
  try {
    await api.put(`/admin/gestores/${g.id}`, { status: novoStatus });
    await carregar();
  } catch (err) {
    console.error(err);
    setErro(err?.response?.data?.error || "Erro ao alterar status.");
  }
}

  function chipStatus(status) {
    const s = String(status || "").toUpperCase();
    const ativo = s === "ATIVO";
    const bg = ativo ? "#052e16" : "#450a0a";
    const br = ativo ? "#166534" : "#991b1b";
    const tx = ativo ? "#86efac" : "#fca5a5";

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 999,
          border: `1px solid ${br}`,
          background: bg,
          color: tx,
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {s || "-"}
      </span>
    );
  }

  return (
    <div className="page-root">
      <div
        className="page-header"
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="page-title">Gestores</h1>
          <p className="page-subtitle">
            Cadastre e gerencie clientes (tipo GESTOR). Ativação por link
            temporário (Modelo A).
          </p>
        </div>

        <button
          onClick={abrirNovo}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #1f2937",
            background: "#0b1220",
            color: "#f9fafb",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          + Novo Gestor
        </button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div
          className="card-body"
          style={{ display: "flex", gap: 10, alignItems: "center" }}
        >
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, email, CPF, status ou complexo…"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              outline: "none",
            }}
          />

          <button
            onClick={carregar}
            disabled={carregando}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: carregando ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>
          <div className="card" style={{ marginBottom: 12 }}>
  <div
    className="card-body"
    style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
  >
    <Badge label={`Total: ${contagem.total}`} tone="neutral" />
    <Badge label={`Ativos: ${contagem.ativos}`} tone="success" />
    <Badge label={`Inativos: ${contagem.inativos}`} tone="danger" />
    <Badge label={`Pendentes: ${contagem.pendentes}`} tone="warning" />

    <div style={{ flex: 1 }} />

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Status</div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={selectMini}
        >
          <option value="TODOS">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Ativação</div>
        <select
          value={filtroAtivacao}
          onChange={(e) => setFiltroAtivacao(e.target.value)}
          style={selectMini}
        >
          <option value="TODOS">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="ATIVADO">Ativado</option>
        </select>
      </div>
    </div>
  </div>
</div>

      {erro ? (
        <div className="card" style={{ borderColor: "#fecaca", marginBottom: 12 }}>
          <div className="card-body" style={{ color: "#b91c1c", fontWeight: 700 }}>
            {erro}
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="card-body">
          {carregando ? (
            <p style={{ margin: 0, opacity: 0.8 }}>Carregando…</p>
          ) : gestoresFiltrados.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.8 }}>Nenhum gestor encontrado.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      Nome
                    </th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      Email
                    </th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      CPF
                    </th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      Status
                    </th>
                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      Taxa (%)
                    </th>

                    <th style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb" }}>
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {gestoresFiltrados.map((g) => (
                    <tr key={g.id}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ fontWeight: 900 }}>{g.nome}</div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
  {Array.isArray(g.empresas) && g.empresas.length > 0
    ? g.empresas.map((e) => e.nome).join(" • ")
    : "Sem complexos cadastrados"}
</div>
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        {g.email}
                      </td>

                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        {g.cpf}
                      </td>

                     <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                     <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {chipStatus(g.status)}
                         {!g.senha_hash ? <Badge label="Ativação pendente" tone="warning" /> : null}
                    </div>
                    </td>


                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        {g.taxa_plataforma_global == null ? "-" : String(g.taxa_plataforma_global)}
                      </td>


                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            onClick={() => abrirEditar(g)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              cursor: "pointer",
                              fontWeight: 800,
                            }}
                          >
                            Editar
                          </button>
                          <button
  onClick={() => alternarStatus(g)}
  style={{
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  }}
>
  {String(g.status || "").toUpperCase() === "ATIVO" ? "Bloquear" : "Ativar"}
</button>

{!g.senha_hash ? (
  <button
    onClick={() => reenviarAtivacao(g.id)}
    style={{
      padding: "8px 10px",
      borderRadius: 10,
      border: "1px solid #1f2937",
      background: "#0b1220",
      color: "#f9fafb",
      cursor: "pointer",
      fontWeight: 800,
    }}
  >
    Reenviar ativação
  </button>
) : null}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO */}
      {modalNovo ? (
        <Modal title="Novo Gestor" onClose={() => setModalNovo(false)}>
          <form onSubmit={criarGestor}>
            <Campo
              label="Nome completo"
              value={novo.nome}
              onChange={(v) => setNovo({ ...novo, nome: v })}
            />
            <Campo
              label="Email"
              type="email"
              value={novo.email}
              onChange={(v) => setNovo({ ...novo, email: v })}
            />
            <Campo
              label="Telefone (opcional)"
              value={novo.telefone}
              onChange={(v) => setNovo({ ...novo, telefone: v })}
            />
            <Campo
              label="CPF (11 dígitos)"
              value={novo.cpf}
              onChange={(v) => setNovo({ ...novo, cpf: v })}
            />
            <div style={{ marginBottom: 12 }}>
  <label style={{ display: "block", marginBottom: 6, fontWeight: 800 }}>
    Tipo de usuário
  </label>
  <select
    value={novo.tipo}
    onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
    style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      outline: "none",
      background: "#fff",
      fontWeight: 800,
    }}
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
              onChange={(v) =>
                setNovo({ ...novo, taxa_plataforma_global: v })
              }
            />

            {linkDevCriacao ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #166534",
                  background: "#052e16",
                  color: "#86efac",
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                  Link de ativação (DEV)
                </div>
                <div style={{ wordBreak: "break-all" }}>{linkDevCriacao}</div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => copiarTexto(linkDevCriacao)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #166534",
                      background: "#0b1220",
                      color: "#f9fafb",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Copiar link
                  </button>
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                disabled={salvandoNovo}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: salvandoNovo ? "not-allowed" : "pointer",
                  fontWeight: 900,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvandoNovo}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #1f2937",
                  background: "#0b1220",
                  color: "#f9fafb",
                  cursor: salvandoNovo ? "not-allowed" : "pointer",
                  fontWeight: 900,
                }}
              >
                {salvandoNovo ? "Salvando..." : "Salvar gestor"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {/* MODAL EDITAR */}
{modalEditar && edit ? (
  <Modal title="Editar Gestor" onClose={() => setModalEditar(false)}>
    <form onSubmit={salvarEdicao}>
      <Campo label="Nome" value={edit.nome} onChange={() => {}} disabled />
      <Campo
        label="Email"
        type="email"
        value={edit.email}
        onChange={(v) => setEdit({ ...edit, email: v })}
      />
      <Campo label="CPF" value={edit.cpf} onChange={() => {}} disabled />

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 900 }}>
          Status
        </label>
        <select
          value={edit.status}
          onChange={(e) => setEdit({ ...edit, status: e.target.value })}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            outline: "none",
          }}
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

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 16,
        }}
      >
        {edit.tipo === "GESTOR" ? (
          <button
            type="button"
            onClick={promoverParaAdmin}
            disabled={salvandoEdit}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #991b1b",
              background: "#450a0a",
              color: "#fca5a5",
              cursor: salvandoEdit ? "not-allowed" : "pointer",
              fontWeight: 900,
              marginRight: "auto",
            }}
          >
            Evoluir para ADMIN
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setModalEditar(false)}
          disabled={salvandoEdit}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: salvandoEdit ? "not-allowed" : "pointer",
            fontWeight: 900,
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvandoEdit}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #1f2937",
            background: "#0b1220",
            color: "#f9fafb",
            cursor: salvandoEdit ? "not-allowed" : "pointer",
            fontWeight: 900,
          }}
        >
          {salvandoEdit ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  </Modal>
) : null}

    </div>
  );
}

/* -------------------- COMPONENTES AUX -------------------- */

function Campo({ label, value, onChange, type = "text", step, disabled = false }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 6, fontWeight: 800 }}>
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          outline: "none",
          background: disabled ? "#f8fafc" : "#fff",
        }}
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            X
          </button>
        </div>

        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (e) {
    window.prompt("Copie o link:", texto);
    return true;
  }
}
function Badge({ label, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#0b1220", br: "#1f2937", tx: "#e5e7eb" },
    success: { bg: "#052e16", br: "#166534", tx: "#86efac" },
    danger: { bg: "#450a0a", br: "#991b1b", tx: "#fca5a5" },
    warning: { bg: "#3b2f00", br: "#a16207", tx: "#fde68a" },
  };

  const c = map[tone] || map.neutral;

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${c.br}`,
        background: c.bg,
        color: c.tx,
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {label}
    </span>
  );
}

const selectMini = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  background: "#fff",
  fontWeight: 800,
};
