import React, { useMemo, useState } from "react";
import api from "../../services/api"; // (vamos usar depois quando você definir as funções)
import "../../index.css"; // garante estilos globais (se já está importado no main.jsx, pode remover)

function formatBRDate(iso) {
  if (!iso) return "-";
  // aceita "YYYY-MM-DD" ou ISO completo
  const s = String(iso).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

function maskId(id) {
  const s = String(id || "");
  if (s.length <= 10) return s;
  return `${s.slice(0, 8)}…`;
}

export default function AdminReservasPage() {
  // =========================
  // Estado (layout first)
  // =========================
  const [status, setStatus] = useState("todas");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [busca, setBusca] = useState("");

  // Lista (por enquanto vazia; depois pluga no backend)
  const [reservas, setReservas] = useState([]);

  // Modais
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [selecionada, setSelecionada] = useState(null);

  // Campos do modal editar (layout)
  const [editData, setEditData] = useState("");
  const [editHora, setEditHora] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editValor, setEditValor] = useState("");

  const reservasFiltradas = useMemo(() => {
    // Só para UX (layout). Depois vamos filtrar no backend.
    let lista = Array.isArray(reservas) ? reservas : [];

    if (status && status !== "todas") {
      lista = lista.filter((r) => String(r.status || "") === status);
    }

    if (busca) {
      const q = busca.toLowerCase();
      lista = lista.filter((r) => {
        const id = String(r.id || "").toLowerCase();
        const nome = String(r.nome_cliente || "").toLowerCase();
        const cpf = String(r.cpf || "").toLowerCase();
        const phone = String(r.phone || "").toLowerCase();
        const quadra = String(r.quadra_nome || "").toLowerCase();
        const empresa = String(r.empresa_nome || "").toLowerCase();
        return (
          id.includes(q) ||
          nome.includes(q) ||
          cpf.includes(q) ||
          phone.includes(q) ||
          quadra.includes(q) ||
          empresa.includes(q)
        );
      });
    }

    // periodo (apenas visual)
    if (inicio) {
      lista = lista.filter((r) => String(r.data || "").slice(0, 10) >= inicio);
    }
    if (fim) {
      lista = lista.filter((r) => String(r.data || "").slice(0, 10) <= fim);
    }

    return lista;
  }, [reservas, status, inicio, fim, busca]);

  function abrirEditar(reserva) {
    setSelecionada(reserva);
    setEditData(String(reserva?.data || "").slice(0, 10));
    setEditHora(String(reserva?.hora || ""));
    setEditCpf(String(reserva?.cpf || ""));
    setEditPhone(String(reserva?.phone || ""));
    setEditValor(
      reserva?.preco_total !== undefined && reserva?.preco_total !== null
        ? String(reserva.preco_total)
        : ""
    );
    setModalEditarOpen(true);
  }

  function abrirCancelar(reserva) {
    setSelecionada(reserva);
    setModalCancelarOpen(true);
  }

  function fecharModais() {
    setModalEditarOpen(false);
    setModalCancelarOpen(false);
    setSelecionada(null);
  }

  // =========================
  // Ações (placeholder)
  // =========================
  function aplicarFiltros() {
    // Layout first: depois vamos buscar no backend com params.
    // Aqui só deixo como placeholder pra UX.
    console.log("[ADMIN/RESERVAS] aplicar filtros (layout)", {
      status,
      inicio,
      fim,
      busca,
    });
  }

  function limparFiltros() {
    setStatus("todas");
    setInicio("");
    setFim("");
    setBusca("");
  }

  async function salvarEdicao(e) {
    e.preventDefault();

    // Layout first: depois pluga no backend e atualiza a lista
    console.log("[ADMIN/RESERVAS] salvar edição (layout)", {
      id: selecionada?.id,
      editData,
      editHora,
      editCpf,
      editPhone,
      editValor,
    });

    setModalEditarOpen(false);
  }

  async function confirmarCancelamento() {
    // Layout first: depois pluga no backend e atualiza a lista
    console.log("[ADMIN/RESERVAS] cancelar (layout)", {
      id: selecionada?.id,
    });

    setModalCancelarOpen(false);
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservas Admin</h1>
          <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
            Visão global das reservas (layout). Em breve: filtros avançados e
            ações administrativas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card filters-card">
        <div className="form-grid">
          <div className="form-field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #cccccc",
                fontSize: 14,
              }}
            >
              <option value="todas">Todas</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          <div className="form-field">
            <label>Início</label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Fim</label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>

          <div className="form-field form-field-full">
            <label>Busca</label>
            <input
              placeholder="Buscar por cliente, CPF, telefone, quadra, empresa, ID..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn-outlined" type="button" onClick={limparFiltros}>
              Limpar
            </button>
            <button className="btn-primary" type="button" onClick={aplicarFiltros}>
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card no-padding-card">
        <table className="tabela-reservas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Quadra</th>
              <th>Data/Hora</th>
              <th>Valor</th>
              <th>Status</th>
              <th style={{ width: 90 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 18, color: "#777" }}>
                  Nenhuma reserva para exibir (layout). Quando você definir as
                  regras do Admin, ligaremos no backend.
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r) => {
                const st = String(r.status || "");
                const badgeClass =
                  st === "paid"
                    ? "status-badge status-badge-verde"
                    : st === "pending"
                    ? "status-badge status-badge-amarelo"
                    : "status-badge status-badge-vermelho";

                return (
                  <tr key={r.id}>
                    <td title={r.id} style={{ fontFamily: "monospace" }}>
                      {maskId(r.id)}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "#222" }}>
                        {r.nome_cliente || "—"}
                      </div>
                      <div className="reserva-data-hora">
                        {r.phone ? `📱 ${r.phone}` : ""}
                        {r.cpf ? `  •  CPF: ${r.cpf}` : ""}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "#222" }}>
                        {r.quadra_nome || "—"}
                      </div>
                      <div className="reserva-data-hora">
                        {r.empresa_nome || ""}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "#222" }}>
                        {formatBRDate(r.data)}
                      </div>
                      <div className="reserva-data-hora">{r.hora || "—"}</div>
                    </td>

                    <td>
                      {Number(r.preco_total || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td>
                      <span className={badgeClass}>{st || "—"}</span>
                    </td>

                    <td>
                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() => abrirEditar(r)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        title="Cancelar"
                        onClick={() => abrirCancelar(r)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* =========================
          MODAL EDITAR (layout igual ao padrão)
         ========================= */}
      {modalEditarOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharModais();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            className="card"
            style={{
              width: "min(720px, 100%)",
              marginTop: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ marginBottom: 6 }}>Editar Reserva</h3>
                <div style={{ fontSize: 13, color: "#666" }}>
                  ID: <span style={{ fontFamily: "monospace" }}>{selecionada?.id}</span>
                </div>
              </div>

              <button className="btn-outlined" type="button" onClick={fecharModais}>
                Fechar
              </button>
            </div>

            <form onSubmit={salvarEdicao} style={{ marginTop: 16 }}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Data</label>
                  <input
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Hora</label>
                  <input
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                    placeholder="Ex: 18:00"
                  />
                </div>

                <div className="form-field">
                  <label>CPF</label>
                  <input
                    value={editCpf}
                    onChange={(e) => setEditCpf(e.target.value)}
                    placeholder="Somente números"
                  />
                </div>

                <div className="form-field">
                  <label>Telefone</label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="55 + DDD + número"
                  />
                </div>

                <div className="form-field">
                  <label>Valor</label>
                  <input
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    placeholder="Ex: 120"
                  />
                  <small>Em breve: validação e cálculo.</small>
                </div>

                <div className="form-actions">
                  <button className="btn-outlined" type="button" onClick={fecharModais}>
                    Cancelar
                  </button>
                  <button className="btn-primary" type="submit">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* =========================
          MODAL CANCELAR
         ========================= */}
      {modalCancelarOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharModais();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            className="card"
            style={{
              width: "min(560px, 100%)",
              marginTop: 0,
            }}
          >
            <h3 style={{ marginBottom: 8, color: "#b91c1c" }}>
              Cancelar Reserva
            </h3>

            <p style={{ color: "#444", marginBottom: 12 }}>
              Você tem certeza que deseja cancelar esta reserva?
            </p>

            <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              ID:{" "}
              <span style={{ fontFamily: "monospace" }}>{selecionada?.id}</span>
            </div>

            <div className="form-actions" style={{ marginTop: 0 }}>
              <button className="btn-outlined" type="button" onClick={fecharModais}>
                Voltar
              </button>
              <button className="btn-danger" type="button" onClick={confirmarCancelamento}>
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
