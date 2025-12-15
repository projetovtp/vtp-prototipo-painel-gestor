// src/pages/gestor/GestorAgendaEditPage.jsx
// Tela de EDIÇÃO da agenda (regras + bloqueios) por quadra

import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Mapeamento de dias da semana
const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

function labelDiaSemana(v) {
  const found = DIAS_SEMANA.find((d) => d.value === Number(v));
  return found ? found.label : `Dia ${v}`;
}

function formatarPreco(preco) {
  if (preco === null || preco === undefined || preco === "") return "-";
  const n = Number(preco);
  if (Number.isNaN(n)) return String(preco);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function GestorAgendaEditPage() {
  const { usuario } = useAuth(); // só para garantir que está logado

  // Combos
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState("");

  const [quadras, setQuadras] = useState([]);
  const [quadraSelecionadaId, setQuadraSelecionadaId] = useState("");

  // Dados carregados da API
  const [regras, setRegras] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);

  // Estados de carregamento/erro
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingQuadras, setLoadingQuadras] = useState(false);
  const [loadingAgenda, setLoadingAgenda] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Edição de regra (linha por linha)
  const [regraEmEdicaoId, setRegraEmEdicaoId] = useState(null);
  const [regraEdicaoForm, setRegraEdicaoForm] = useState({
    dia_semana: "",
    hora_inicio: "",
    hora_fim: "",
    preco_hora: "",
  });

  // Edição de bloqueio (opcional)
  const [bloqueioEmEdicaoId, setBloqueioEmEdicaoId] = useState(null);
  const [bloqueioEdicaoForm, setBloqueioEdicaoForm] = useState({
    data: "",
    hora_inicio: "",
    hora_fim: "",
    motivo: "",
  });

  // ------------------------------------------------------------------
  // 1) Carregar empresas do gestor na montagem
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!usuario) return;

    async function carregarEmpresas() {
      try {
        setLoadingEmpresas(true);
        setErro("");
        setMensagem("");

        const { data } = await api.get("/gestor/empresas");
        // backend pode retornar array puro ou {empresas: [...]}
        const lista =
          Array.isArray(data) ? data : data.empresas || data || [];
        setEmpresas(lista);
      } catch (err) {
        console.error("[GestorAgendaEditPage] Erro ao buscar empresas:", err);
        const msg =
          err.response?.data?.error ||
          "Erro ao carregar empresas. Faça login novamente.";
        setErro(msg);
      } finally {
        setLoadingEmpresas(false);
      }
    }

    carregarEmpresas();
  }, [usuario]);

  // ------------------------------------------------------------------
  // 2) Quando escolhe empresa → carrega quadras dessa empresa
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!empresaSelecionadaId) {
      setQuadras([]);
      setQuadraSelecionadaId("");
      setRegras([]);
      setBloqueios([]);
      return;
    }

    async function carregarQuadras() {
      try {
        setLoadingQuadras(true);
        setErro("");
        setMensagem("");

        const { data } = await api.get("/gestor/quadras", {
          params: { empresaId: empresaSelecionadaId },
        });

        const lista = Array.isArray(data) ? data : data.quadras || data || [];
        setQuadras(lista);

        // limpa seleção de quadra e agenda ao trocar de complexo
        setQuadraSelecionadaId("");
        setRegras([]);
        setBloqueios([]);
      } catch (err) {
        console.error("[GestorAgendaEditPage] Erro ao buscar quadras:", err);
        const msg =
          err.response?.data?.error ||
          "Erro ao carregar quadras para esse complexo.";
        setErro(msg);
      } finally {
        setLoadingQuadras(false);
      }
    }

    carregarQuadras();
  }, [empresaSelecionadaId]);

  // ------------------------------------------------------------------
  // 3) Quando escolhe quadra → carrega regras + bloqueios
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!quadraSelecionadaId) {
      setRegras([]);
      setBloqueios([]);
      return;
    }

    async function carregarAgenda() {
      try {
        setLoadingAgenda(true);
        setErro("");
        setMensagem("");

        // Regras
        const respRegras = await api.get("/gestor/agenda/regras", {
          params: { quadraId: quadraSelecionadaId },
        });

        const bodyRegras = respRegras.data;
        setRegras(bodyRegras.regras || bodyRegras || []);

        // Bloqueios
        const respBloqueios = await api.get("/gestor/agenda/bloqueios", {
          params: { quadraId: quadraSelecionadaId },
        });

        const bodyBloqueios = respBloqueios.data;
        setBloqueios(bodyBloqueios.bloqueios || bodyBloqueios || []);
      } catch (err) {
        console.error("[GestorAgendaEditPage] Erro ao buscar agenda:", err);
        const msg =
          err.response?.data?.error ||
          "Erro ao buscar agenda dessa quadra.";
        setErro(msg);
      } finally {
        setLoadingAgenda(false);
      }
    }

    carregarAgenda();
  }, [quadraSelecionadaId]);

  // ------------------------------------------------------------------
  // 4) Agrupa regras por dia da semana (para exibir organizado)
  // ------------------------------------------------------------------
  const regrasAgrupadas = useMemo(() => {
    const grupos = {};
    (regras || []).forEach((r) => {
      const key = r.dia_semana ?? r.dia_da_semana ?? "";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(r);
    });

    // ordena horários dentro do dia
    Object.values(grupos).forEach((lista) => {
      lista.sort((a, b) => {
        const ha = a.hora_inicio || "";
        const hb = b.hora_inicio || "";
        return ha.localeCompare(hb);
      });
    });

    // ordena dias pela chave numérica
    return Object.entries(grupos).sort(([a], [b]) => {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isNaN(na) || Number.isNaN(nb)) {
        return String(a).localeCompare(String(b));
      }
      return na - nb;
    });
  }, [regras]);

  // ------------------------------------------------------------------
  // 5) Handlers de EDIÇÃO de regra
  // ------------------------------------------------------------------
  function iniciarEdicaoRegra(regra) {
    setRegraEmEdicaoId(regra.id);
    setRegraEdicaoForm({
      dia_semana: regra.dia_semana ?? regra.dia_da_semana ?? "",
      hora_inicio: regra.hora_inicio || "",
      hora_fim: regra.hora_fim || "",
      preco_hora:
        regra.preco_hora ?? regra.valor ?? "" /* só para preencher input */,
    });
    setMensagem("");
    setErro("");
  }

  function cancelarEdicaoRegra() {
    setRegraEmEdicaoId(null);
    setRegraEdicaoForm({
      dia_semana: "",
      hora_inicio: "",
      hora_fim: "",
      preco_hora: "",
    });
  }

  async function salvarEdicaoRegra() {
  if (!quadraSelecionadaId || !regraEmEdicaoId) return;

  try {
    setErro("");
    setMensagem("");

    const payload = {
      quadraId: quadraSelecionadaId,
      diaSemana: regraEdicaoForm.dia_semana,
      horaInicio: regraEdicaoForm.hora_inicio,
      horaFim: regraEdicaoForm.hora_fim,
      precoHora: regraEdicaoForm.preco_hora,
    };

    const { data } = await api.put(
      `/gestor/agenda/regras/${regraEmEdicaoId}`,
      payload
    );

    const regraAtualizada = data.regra || data;

    setRegras((prev) =>
      (prev || []).map((r) =>
        r.id === regraEmEdicaoId ? regraAtualizada : r
      )
    );

    setMensagem("Regra de horário atualizada com sucesso.");
    setErro("");
    cancelarEdicaoRegra();
  } catch (err) {
    console.error("[GestorAgendaEditPage] Erro ao salvar regra:", err);

    const status = err.response?.status;
    const apiError = err.response?.data?.error;

    let msg = "Erro ao atualizar regra de horário.";

    if (status === 409) {
      // 🔴 Mesmo padrão de conflito: já existe regra cobrindo esse horário
      msg =
        apiError ||
        "Já existe outra regra que cobre esse dia/horário para esta quadra. " +
          "Ajuste ou exclua a regra conflitante na lista.";
    } else if (apiError) {
      msg = apiError;
    }

    setErro(msg);
    setMensagem("");
  }
}



  async function removerRegra(regra) {
    if (!quadraSelecionadaId || !regra?.id) return;

    if (
      !window.confirm(
        "Tem certeza que deseja remover esse horário da agenda?"
      )
    ) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      await api.delete(`/gestor/agenda/regras/${regra.id}`, {
        data: { quadraId: quadraSelecionadaId },
      });

      setRegras((prev) => (prev || []).filter((r) => r.id !== regra.id));
      setMensagem("Regra removida com sucesso.");
    } catch (err) {
      console.error("[GestorAgendaEditPage] Erro ao remover regra:", err);
      const msg =
        err.response?.data?.error || "Erro ao remover regra de horário.";
      setErro(msg);
    }
  }

  // ------------------------------------------------------------------
  // 6) Handlers de edição de bloqueio (opcional – mesmo padrão)
  // ------------------------------------------------------------------
  function iniciarEdicaoBloqueio(b) {
    setBloqueioEmEdicaoId(b.id);
    setBloqueioEdicaoForm({
      data: b.data || "",
      hora_inicio: b.hora_inicio || "",
      hora_fim: b.hora_fim || "",
      motivo: b.motivo || "",
    });
    setMensagem("");
    setErro("");
  }

  function cancelarEdicaoBloqueio() {
    setBloqueioEmEdicaoId(null);
    setBloqueioEdicaoForm({
      data: "",
      hora_inicio: "",
      hora_fim: "",
      motivo: "",
    });
  }

  async function salvarEdicaoBloqueio() {
    if (!quadraSelecionadaId || !bloqueioEmEdicaoId) return;

    try {
      setErro("");
      setMensagem("");

      const payload = {
        quadraId: quadraSelecionadaId,
        data: bloqueioEdicaoForm.data,
        horaInicio: bloqueioEdicaoForm.hora_inicio,
        horaFim: bloqueioEdicaoForm.hora_fim,
        motivo: bloqueioEdicaoForm.motivo,
      };

      const { data } = await api.put(
        `/gestor/agenda/bloqueios/${bloqueioEmEdicaoId}`,
        payload
      );

      const bAtualizado = data.bloqueio || data;

      setBloqueios((prev) =>
        (prev || []).map((b) =>
          b.id === bloqueioEmEdicaoId ? bAtualizado : b
        )
      );

      setMensagem("Bloqueio atualizado com sucesso.");
      cancelarEdicaoBloqueio();
    } catch (err) {
      console.error("[GestorAgendaEditPage] Erro ao salvar bloqueio:", err);
      const msg =
        err.response?.data?.error || "Erro ao atualizar bloqueio.";
      setErro(msg);
    }
  }

  async function removerBloqueio(b) {
    if (!quadraSelecionadaId || !b?.id) return;

    if (
      !window.confirm("Tem certeza que deseja remover esse bloqueio pontual?")
    ) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      await api.delete(`/gestor/agenda/bloqueios/${b.id}`, {
        data: { quadraId: quadraSelecionadaId },
      });

      setBloqueios((prev) => (prev || []).filter((x) => x.id !== b.id));
      setMensagem("Bloqueio removido com sucesso.");
    } catch (err) {
      console.error("[GestorAgendaEditPage] Erro ao remover bloqueio:", err);
      const msg =
        err.response?.data?.error || "Erro ao remover bloqueio.";
      setErro(msg);
    }
  }

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: 8 }}>Editar Agenda das Quadras</h2>
      <p style={{ marginBottom: 16, fontSize: 13, color: "#555" }}>
        Escolha primeiro o complexo, depois a quadra. Em seguida, edite os
        horários e bloqueios diretamente nas listas abaixo.
      </p>

      {/* Mensagens de erro/sucesso */}
      {erro && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 4,
            background: "#ffe5e5",
            color: "#b00000",
            fontSize: 13,
          }}
        >
          {erro}
        </div>
      )}
      {mensagem && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 4,
            background: "#e5ffe9",
            color: "#006b1f",
            fontSize: 13,
          }}
        >
          {mensagem}
        </div>
      )}

      {/* Filtros: Empresa + Quadra */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 260 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Complexo / Empresa
          </label>
          <select
            value={empresaSelecionadaId}
            onChange={(e) => setEmpresaSelecionadaId(e.target.value)}
            disabled={loadingEmpresas}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Selecione um complexo...</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 260 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Quadra
          </label>
          <select
            value={quadraSelecionadaId}
            onChange={(e) => setQuadraSelecionadaId(e.target.value)}
            disabled={loadingQuadras || !empresaSelecionadaId}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Selecione uma quadra...</option>
            {quadras.map((q) => (
              <option key={q.id} value={q.id}>
                {q.tipo} - {q.material} - {q.modalidade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAgenda && (
        <p style={{ fontSize: 13, color: "#555" }}>Carregando agenda...</p>
      )}

      {!quadraSelecionadaId && (
        <p style={{ fontSize: 13, color: "#666" }}>
          Selecione uma quadra para visualizar e editar a agenda.
        </p>
      )}

      {/* LISTA DE REGRAS (Agenda recorrente por dia da semana) */}
      {quadraSelecionadaId && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Regras de horário (por dia)</h3>
          {regras.length === 0 ? (
            <p style={{ fontSize: 13, color: "#777" }}>
              Nenhuma regra cadastrada para essa quadra.
            </p>
          ) : (
            regrasAgrupadas.map(([diaKey, lista]) => (
              <div
                key={diaKey}
                style={{
                  marginBottom: 16,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 8,
                }}
              >
                <div
                  style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}
                >
                  {labelDiaSemana(diaKey)}
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f7f7f7" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "6px 4px",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Início
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "6px 4px",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Fim
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "6px 4px",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Preço/hora
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "6px 4px",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((regra) => {
                      const emEdicao = regraEmEdicaoId === regra.id;
                      return (
                        <tr key={regra.id}>
                          <td
                            style={{
                              borderBottom: "1px solid #f2f2f2",
                              padding: "4px",
                            }}
                          >
                            {emEdicao ? (
                              <input
                                type="time"
                                value={regraEdicaoForm.hora_inicio}
                                onChange={(e) =>
                                  setRegraEdicaoForm((prev) => ({
                                    ...prev,
                                    hora_inicio: e.target.value,
                                  }))
                                }
                                style={{ width: "110px" }}
                              />
                            ) : (
                              regra.hora_inicio
                            )}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #f2f2f2",
                              padding: "4px",
                            }}
                          >
                            {emEdicao ? (
                              <input
                                type="time"
                                value={regraEdicaoForm.hora_fim}
                                onChange={(e) =>
                                  setRegraEdicaoForm((prev) => ({
                                    ...prev,
                                    hora_fim: e.target.value,
                                  }))
                                }
                                style={{ width: "110px" }}
                              />
                            ) : (
                              regra.hora_fim
                            )}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #f2f2f2",
                              padding: "4px",
                            }}
                          >
                            {emEdicao ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={regraEdicaoForm.preco_hora}
                                onChange={(e) =>
                                  setRegraEdicaoForm((prev) => ({
                                    ...prev,
                                    preco_hora: e.target.value,
                                  }))
                                }
                                style={{ width: "120px" }}
                              />
                            ) : (
                              formatarPreco(
                                regra.preco_hora ?? regra.valor ?? null
                              )
                            )}
                          </td>
                          <td
                            style={{
                              borderBottom: "1px solid #f2f2f2",
                              padding: "4px",
                            }}
                          >
                            {emEdicao ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{ marginRight: 4 }}
                                  onClick={salvarEdicaoRegra}
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={cancelarEdicaoRegra}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{ marginRight: 4 }}
                                  onClick={() => iniciarEdicaoRegra(regra)}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="btn-danger"
                                  onClick={() => removerRegra(regra)}
                                >
                                  Remover
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* LISTA DE BLOQUEIOS PONTUAIS */}
      {quadraSelecionadaId && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 8 }}>Bloqueios pontuais (datas)</h3>
          {bloqueios.length === 0 ? (
            <p style={{ fontSize: 13, color: "#777" }}>
              Nenhum bloqueio cadastrado para essa quadra.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#f7f7f7" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "6px 4px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Data
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "6px 4px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Início
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "6px 4px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Fim
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "6px 4px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Motivo
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "6px 4px",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {bloqueios.map((b) => {
                  const emEdicao = bloqueioEmEdicaoId === b.id;
                  return (
                    <tr key={b.id}>
                      <td
                        style={{
                          borderBottom: "1px solid #f2f2f2",
                          padding: "4px",
                        }}
                      >
                        {emEdicao ? (
                          <input
                            type="date"
                            value={bloqueioEdicaoForm.data}
                            onChange={(e) =>
                              setBloqueioEdicaoForm((prev) => ({
                                ...prev,
                                data: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          b.data
                        )}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f2f2f2",
                          padding: "4px",
                        }}
                      >
                        {emEdicao ? (
                          <input
                            type="time"
                            value={bloqueioEdicaoForm.hora_inicio}
                            onChange={(e) =>
                              setBloqueioEdicaoForm((prev) => ({
                                ...prev,
                                hora_inicio: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          b.hora_inicio
                        )}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f2f2f2",
                          padding: "4px",
                        }}
                      >
                        {emEdicao ? (
                          <input
                            type="time"
                            value={bloqueioEdicaoForm.hora_fim}
                            onChange={(e) =>
                              setBloqueioEdicaoForm((prev) => ({
                                ...prev,
                                hora_fim: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          b.hora_fim
                        )}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f2f2f2",
                          padding: "4px",
                        }}
                      >
                        {emEdicao ? (
                          <input
                            type="text"
                            value={bloqueioEdicaoForm.motivo}
                            onChange={(e) =>
                              setBloqueioEdicaoForm((prev) => ({
                                ...prev,
                                motivo: e.target.value,
                              }))
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          b.motivo || "-"
                        )}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f2f2f2",
                          padding: "4px",
                        }}
                      >
                        {emEdicao ? (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ marginRight: 4 }}
                              onClick={salvarEdicaoBloqueio}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={cancelarEdicaoBloqueio}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ marginRight: 4 }}
                              onClick={() => iniciarEdicaoBloqueio(b)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => removerBloqueio(b)}
                            >
                              Remover
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default GestorAgendaEditPage;
