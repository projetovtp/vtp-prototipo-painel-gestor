import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultPeriodo30() {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminRepassesPage() {
  const def = useMemo(() => defaultPeriodo30(), []);
  const [from, setFrom] = useState(def.inicio);
  const [to, setTo] = useState(def.fim);

  const [gestores, setGestores] = useState([]);
  const [gestorId, setGestorId] = useState("");

  const [status, setStatus] = useState(""); // pendente | pago | ""
  const [repasses, setRepasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [repasseSelecionado, setRepasseSelecionado] = useState(null);
  const [pagamentosDoRepasse, setPagamentosDoRepasse] = useState([]);

  async function carregarGestores() {
    try {
      const { data } = await api.get("/admin/gestores-resumo");
      setGestores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("[ADMIN/REPASSES] falha ao carregar gestores:", e);
      setGestores([]);
    }
  }

  async function listarRepasses() {
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.get("/admin/repasses", {
        params: {
          gestorId: gestorId || undefined,
          status: status || undefined
        }
      });
      setRepasses(data?.repasses || []);
    } catch (e) {
      console.error("[ADMIN/REPASSES] erro listar:", e);
      setErro(e?.response?.data?.error || "Erro ao listar repasses.");
      setRepasses([]);
    } finally {
      setLoading(false);
    }
  }

  async function gerarRepasse() {
    if (!gestorId) {
      setErro("Selecione um Gestor para gerar repasse.");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const body = {
        gestorId,
        from,
        to
        // competencia é opcional; backend aceita, mas não é obrigatório
      };

      const { data } = await api.post("/admin/repasses/gerar", body);

      await listarRepasses();

      if (data?.repasse?.id) {
        await abrirDetalhe(data.repasse.id);
      }
    } catch (e) {
      console.error("[ADMIN/REPASSES] erro gerar:", e);
      setErro(e?.response?.data?.error || "Erro ao gerar repasse.");
    } finally {
      setLoading(false);
    }
  }

  async function abrirDetalhe(repasseId) {
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.get(`/admin/repasses/${repasseId}`);
      setRepasseSelecionado(data?.repasse || null);
      setPagamentosDoRepasse(data?.pagamentos || []);
    } catch (e) {
      console.error("[ADMIN/REPASSES] erro detalhe:", e);
      setErro(e?.response?.data?.error || "Erro ao buscar detalhe do repasse.");
      setRepasseSelecionado(null);
      setPagamentosDoRepasse([]);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoPago(repasseId) {
    setLoading(true);
    setErro("");
    try {
      const body = {
        observacao: "Pago manualmente via painel Admin"
      };

      // ✅ endpoint correto (padrão backend que você está usando)
      await api.put(`/admin/repasses/${repasseId}/marcar-pago`, body);

      await listarRepasses();
      await abrirDetalhe(repasseId);
    } catch (e) {
      console.error("[ADMIN/REPASSES] erro marcar-pago:", e);
      setErro(e?.response?.data?.error || "Erro ao marcar repasse como pago.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarGestores();
    listarRepasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Repasses (Admin)</h1>
        <div style={{ opacity: 0.75, marginTop: 6, fontSize: 13 }}>
          Liste repasses, gere por período e marque como pago.
        </div>
      </div>

      {erro ? <div style={errorBox}>{erro}</div> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.2fr 0.8fr 0.8fr",
          gap: 10,
          marginBottom: 12
        }}
      >
        <div>
          <label style={labelSmall} htmlFor="admin_rep_from">De</label>
          <input
            id="admin_rep_from"
            name="admin_rep_from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelSmall} htmlFor="admin_rep_to">Até</label>
          <input
            id="admin_rep_to"
            name="admin_rep_to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelSmall} htmlFor="admin_rep_gestor">Gestor</label>
          <select
            id="admin_rep_gestor"
            name="admin_rep_gestor"
            value={gestorId}
            onChange={(e) => setGestorId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecione…</option>
            {gestores.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome || g.email || g.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelSmall} htmlFor="admin_rep_status">Status</label>
          <select
            id="admin_rep_status"
            name="admin_rep_status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
          <button type="button" style={btn} onClick={listarRepasses} disabled={loading}>
            {loading ? "..." : "Listar"}
          </button>
          <button type="button" style={btnPrimary} onClick={gerarRepasse} disabled={loading}>
            {loading ? "..." : "Gerar"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={panel}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Repasses</div>

          {repasses.length === 0 ? (
            <div style={{ opacity: 0.75, padding: 10 }}>Nenhum repasse encontrado.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={rowHead}>
                <div>ID</div>
                <div>Gestor</div>
                <div>Status</div>
                <div style={{ textAlign: "right" }}>Líquido</div>
                <div>Ações</div>
              </div>

              {repasses.map((r) => (
                <div key={r.id} style={row}>
                  <div style={mono} title={r.id}>
                    {String(r.id).slice(0, 8)}…
                  </div>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.gestor_nome || r.gestor_id || "-"}
                  </div>
                  <div>{r.status || "-"}</div>
                  <div style={{ textAlign: "right" }}>
                    {formatBRL(r.total_liquido ?? r.valor_total_liquido ?? 0)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={btn}
                      onClick={() => abrirDetalhe(r.id)}
                      disabled={loading}
                    >
                      Ver
                    </button>
                    {String(r.status) === "pendente" ? (
                      <button
                        type="button"
                        style={btnPrimary}
                        onClick={() => marcarComoPago(r.id)}
                        disabled={loading}
                      >
                        Marcar pago
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={panel}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Detalhe</div>

          {!repasseSelecionado ? (
            <div style={{ opacity: 0.75, padding: 10 }}>
              Selecione um repasse para ver os pagamentos vinculados.
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                <div><b>ID:</b> <span style={mono}>{repasseSelecionado.id}</span></div>
                <div><b>Status:</b> {repasseSelecionado.status}</div>
                <div><b>Competência:</b> {String(repasseSelecionado.competencia || "").slice(0, 10) || "-"}</div>
                <div><b>Líquido:</b> {formatBRL(repasseSelecionado.valor_total_liquido ?? repasseSelecionado.total_liquido ?? 0)}</div>
              </div>

              <div style={{ fontWeight: 700, marginBottom: 8 }}>Pagamentos</div>
              {pagamentosDoRepasse.length === 0 ? (
                <div style={{ opacity: 0.75, padding: 10 }}>Nenhum pagamento vinculado.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={rowHeadPag}>
                    <div>ID</div>
                    <div>Data</div>
                    <div style={{ textAlign: "right" }}>Bruto</div>
                    <div style={{ textAlign: "right" }}>Taxa</div>
                    <div style={{ textAlign: "right" }}>Líquido</div>
                  </div>

                  {pagamentosDoRepasse.map((p) => (
                    <div key={p.id} style={rowPag}>
                      <div style={mono} title={p.id}>{String(p.id).slice(0, 8)}…</div>
                      <div style={mono}>{p.created_at ? String(p.created_at).slice(0, 10) : "-"}</div>
                      <div style={{ textAlign: "right" }}>{formatBRL(p.valor_total)}</div>
                      <div style={{ textAlign: "right" }}>{formatBRL(p.taxa_plataforma)}</div>
                      <div style={{ textAlign: "right" }}>{formatBRL(p.valor_liquido_gestor)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const labelSmall = { display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 };

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  outline: "none"
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  cursor: "pointer"
};

const btnPrimary = {
  ...btn,
  background: "rgba(0, 160, 255, 0.18)",
  borderColor: "rgba(0, 160, 255, 0.35)"
};

const errorBox = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255, 80, 80, 0.35)",
  background: "rgba(255, 80, 80, 0.10)",
  marginBottom: 12
};

const panel = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)"
};

const mono = { fontFamily: "monospace" };

const rowHead = {
  display: "grid",
  gridTemplateColumns: "120px 1fr 110px 130px 220px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  fontWeight: 700,
  opacity: 0.9,
  alignItems: "center"
};

const row = {
  display: "grid",
  gridTemplateColumns: "120px 1fr 110px 130px 220px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.18)",
  alignItems: "center"
};

const rowHeadPag = {
  display: "grid",
  gridTemplateColumns: "120px 100px 110px 110px 110px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  fontWeight: 700,
  opacity: 0.9,
  alignItems: "center"
};

const rowPag = {
  display: "grid",
  gridTemplateColumns: "120px 100px 110px 110px 110px",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.18)",
  alignItems: "center"
};
