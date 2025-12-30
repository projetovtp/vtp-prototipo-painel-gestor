// src/components/gestor/AgendaCinemaView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { AgendaFilters } from "../../components/agenda/AgendaFilters";
import { AgendaLegend } from "../../components/agenda/AgendaLegend";
import { AgendaGrid } from "../../components/agenda/AgendaGrid";
import { fetchAgendaSlots } from "../../api/agendaApi";

function formatLabelBR(iso) {
  // iso: YYYY-MM-DD
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = dt.toLocaleDateString("pt-BR", { weekday: "short" });
    return `${dow} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function mapStatus(status) {
  const s = String(status || "").toUpperCase();
  if (s === "DISPONIVEL") return "disponivel";
  if (s === "RESERVADO") return "reservada";
  if (s === "BLOQUEADO") return "bloqueada";
  return "disponivel";
}

function slotDescricao(slot) {
  if (slot?.bloqueio?.motivo) return slot.bloqueio.motivo;
  if (slot?.reserva?.phone) return `Reserva (${slot.reserva.phone})`;
  if (slot?.reserva?.cpf) return `Reserva (${slot.reserva.cpf})`;
  if (slot?.reserva?.id) return `Reserva #${String(slot.reserva.id).slice(0, 6)}`;
  return "Livre";
}

/**
 * Visão tipo cinema (REAL)
 * props:
 * - quadraId (obrigatório para carregar)
 * - mode: "GESTOR" | "ADMIN"
 */
function AgendaCinemaView({ quadraId, mode = "GESTOR" }) {
  const [periodo, setPeriodo] = useState("semana");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [diasRaw, setDiasRaw] = useState([]); // vem do backend

  const diasUI = useMemo(() => {
    // AgendaGrid espera: [{ id, label, slots:[{hora,status,descricao}] }]
    return (diasRaw || []).map((d) => ({
      id: d.data,
      label: formatLabelBR(d.data),
      slots: (d.slots || []).map((s) => ({
        hora: String(s.hora_inicio || s.hora || "").slice(0, 5),
        status: mapStatus(s.status),
        descricao: slotDescricao(s),
      })),
    }));
  }, [diasRaw]);

  async function carregar() {
    if (!quadraId) return;
    try {
      setCarregando(true);
      setErro("");

      const resp = await fetchAgendaSlots({
        mode,
        quadraId,
        periodo,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        filtro: filtroStatus,
      });

      setDiasRaw(resp?.dias || []);
    } catch (e) {
      console.error("[AgendaCinemaView] erro:", e);
      setErro(e?.message || "Erro ao carregar slots da agenda.");
      setDiasRaw([]);
    } finally {
      setCarregando(false);
    }
  }

  function handleAplicar() {
    carregar();
  }

  function handleLimpar() {
    setPeriodo("semana");
    setDataInicio("");
    setDataFim("");
    setFiltroStatus("todas");
    // recarrega com default
    setTimeout(() => carregar(), 0);
  }

  // auto-carrega ao trocar quadra
  useEffect(() => {
    if (!quadraId) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quadraId]);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Visão geral da agenda</h3>
        <span style={{ fontSize: 12, color: "#666" }}>
          {String(mode).toUpperCase() === "ADMIN" ? "Modo Admin" : "Modo Gestor"}
        </span>
      </div>

      {!quadraId && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
          Selecione uma quadra acima para visualizar a agenda tipo cinema.
        </p>
      )}

      {quadraId && (
        <>
          <AgendaFilters
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            dataInicio={dataInicio}
            onDataInicioChange={setDataInicio}
            dataFim={dataFim}
            onDataFimChange={setDataFim}
            filtroStatus={filtroStatus}
            onFiltroStatusChange={setFiltroStatus}
            onAplicar={handleAplicar}
            onLimpar={handleLimpar}
          />

          {erro && (
            <p className="form-message error" style={{ marginTop: 8 }}>
              {erro}
            </p>
          )}

          {carregando ? (
            <p style={{ marginTop: 8 }}>Carregando visão geral...</p>
          ) : (
            <>
              <AgendaLegend />
              <AgendaGrid dias={diasUI} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AgendaCinemaView;
