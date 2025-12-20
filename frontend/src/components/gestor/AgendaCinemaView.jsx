// src/components/gestor/AgendaCinemaView.jsx
import React, { useState } from "react";
import { AgendaFilters } from "../../components/agenda/AgendaFilters";
import { AgendaLegend } from "../../components/agenda/AgendaLegend";
import { AgendaGrid } from "../../components/agenda/AgendaGrid";

/**
 * Componente "container" da visão tipo cinema.
 *
 * 🧠 Neste primeiro passo:
 * - Usa DADOS FICTÍCIOS em memória, só para você ver o layout funcionando.
 * - No próximo passo, a gente troca os dados fake pelo GET /gestor/agenda/slots.
 */
function AgendaCinemaView({ empresaId, quadraId }) {
  // Estado dos filtros (por enquanto só para UI; depois vamos mandar isso para o backend)
  const [periodo, setPeriodo] = useState("semana");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");

  // ------------------------------
  // DADOS FICTÍCIOS (MOCK)
  // ------------------------------
  /**
   * Formato esperado pelo <AgendaGrid />:
   *
   * const dias = [
   *   {
   *     id: "2025-12-10",
   *     label: "Qua 10/12",
   *     slots: [
   *       {
   *         hora: "18:00",
   *         status: "disponivel" | "reservada" | "bloqueada",
   *         descricao: "nome do cliente / obs",
   *       },
   *       ...
   *     ],
   *   },
   *   ...
   * ];
   */
  const [dias, setDias] = useState([
    {
      id: "2025-12-10",
      label: "Qua 10/12",
      slots: [
        { hora: "18:00", status: "disponivel", descricao: "Livre" },
        {
          hora: "19:00",
          status: "reservada",
          descricao: "João Silva - Society",
        },
        {
          hora: "20:00",
          status: "bloqueada",
          descricao: "Manutenção da iluminação",
        },
      ],
    },
    {
      id: "2025-12-11",
      label: "Qui 11/12",
      slots: [
        { hora: "18:00", status: "disponivel", descricao: "Livre" },
        { hora: "19:00", status: "disponivel", descricao: "Livre" },
        {
          hora: "20:00",
          status: "reservada",
          descricao: "Time da firma do Pedro",
        },
      ],
    },
    {
      id: "2025-12-12",
      label: "Sex 12/12",
      slots: [
        { hora: "18:00", status: "reservada", descricao: "Campeonato interno" },
        { hora: "19:00", status: "reservada", descricao: "Campeonato interno" },
        { hora: "20:00", status: "reservada", descricao: "Campeonato interno" },
      ],
    },
  ]);

  function handleAplicarFiltros() {
    // 🚧 Aqui, no próximo passo, vamos:
    // - Chamar o backend GET /gestor/agenda/slots
    // - Usar empresaId, quadraId, periodo, dataInicio, dataFim, filtroStatus
    // - Preencher setDias com os dados reais
    console.log("[AgendaCinemaView] Aplicar filtros (mock):", {
      empresaId,
      quadraId,
      periodo,
      dataInicio,
      dataFim,
      filtroStatus,
    });
    // Por enquanto, não muda nada, só é um gancho para o futuro.
  }

  function handleLimparFiltros() {
    setPeriodo("semana");
    setDataInicio("");
    setDataFim("");
    setFiltroStatus("todas");
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Visão geral da agenda</h3>

      {!quadraId && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
          Selecione uma quadra acima para visualizar a agenda tipo cinema.
        </p>
      )}

      {quadraId && (
        <>
          {/* Filtros */}
          <AgendaFilters
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            dataInicio={dataInicio}
            onDataInicioChange={setDataInicio}
            dataFim={dataFim}
            onDataFimChange={setDataFim}
            filtroStatus={filtroStatus}
            onFiltroStatusChange={setFiltroStatus}
            onAplicar={handleAplicarFiltros}
            onLimpar={handleLimparFiltros}
          />

          {/* Legenda de cores */}
          <AgendaLegend />

          {/* Grade tipo cinema */}
          <AgendaGrid dias={dias} />
        </>
      )}
    </div>
  );
}

export default AgendaCinemaView;
