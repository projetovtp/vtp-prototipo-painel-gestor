import React, { useEffect, useState, useMemo } from "react";
import { useGestorEmpresas, useGestorQuadras } from "../../hooks/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../../components/ui";

function GestorQuadrasListPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const {
    listar: listarQuadrasApi,
    desativar: desativarQuadra,
    reativar: reativarQuadra,
  } = useGestorQuadras();
  const { listar: listarEmpresasApi } = useGestorEmpresas();

  const [quadras, setQuadras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  async function carregarQuadras(gestorId) {
    try {
      setCarregando(true);
      setErro("");
      const data = await listarQuadrasApi({ gestorId });
      setQuadras(data || []);
    } catch (err) {
      console.error("[GESTOR/QUADRAS] Erro ao buscar quadras:", err);
      const mensagem =
        err.response?.data?.error ||
        "Erro ao carregar quadras. Tente novamente mais tarde.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarEmpresas() {
    try {
      const data = await listarEmpresasApi();
      setEmpresas(data || []);
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao buscar empresas:", err);
    }
  }

  useEffect(() => {
    if (!usuario?.id) return;
    carregarQuadras(usuario.id);
    carregarEmpresas();
  }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNovaQuadra() {
    navigate("/gestor/quadras/nova");
  }

  function handleEditarQuadra(id) {
    navigate(`/gestor/quadras/editar/${id}`);
  }

  async function handleToggleStatus(quadra) {
    try {
      setErro("");
      const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";

      if (estaAtiva) {
        await desativarQuadra(quadra.id);
      } else {
        await reativarQuadra(quadra.id);
      }

      if (usuario?.id) {
        await carregarQuadras(usuario.id);
      }
    } catch (err) {
      console.error("[GESTOR/QUADRAS] Erro ao alterar status da quadra:", err);
      const mensagem =
        err.response?.data?.error ||
        "Erro ao alterar status da quadra. Tente novamente.";
      setErro(mensagem);
    }
  }

  const quadrasFiltradas = useMemo(() => {
    return quadras.filter((q) => {
      if (filtroStatus !== "todos") {
        const statusLower = String(q.status || "").toLowerCase();
        if (filtroStatus !== statusLower) return false;
      }

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const textos = [
          q.tipo,
          q.material,
          q.modalidade,
          q.informacoes,
          q.aviso,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!textos.includes(termo)) return false;
      }

      return true;
    });
  }, [quadras, busca, filtroStatus]);

  const empresasComQuadras = useMemo(() => {
    return empresas
      .map((empresa) => ({
        ...empresa,
        quadras: quadrasFiltradas.filter((q) => q.empresa_id === empresa.id),
      }))
      .filter((empresa) => empresa.quadras && empresa.quadras.length > 0);
  }, [empresas, quadrasFiltradas]);

  const totalFiltradas = quadrasFiltradas.length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quadras cadastradas</h1>
        <button className="btn-primary" onClick={handleNovaQuadra}>
          + Nova quadra
        </button>
      </div>

      {carregando && (
        <LoadingSpinner mensagem="Carregando quadras..." tamanho={24} />
      )}

      {!carregando && <ErrorMessage mensagem={erro} />}

      {!carregando && !erro && quadras.length === 0 && (
        <EmptyState
          titulo="Nenhuma quadra cadastrada ainda."
          descricao="Comece adicionando sua primeira quadra para gerenciar suas reservas."
          acao={handleNovaQuadra}
          acaoLabel="+ Nova quadra"
        />
      )}

      {!carregando && !erro && quadras.length > 0 && (
        <>
          {/* Filtros */}
          <div className="card quadras-filters-bar">
            <div className="quadras-filter-group">
              <div className="quadras-search-box">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por tipo, material, modalidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <select
                className="quadras-filter-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                <option value="ativa">Ativas</option>
                <option value="inativa">Inativas</option>
                <option value="manutencao">Em manutenção</option>
              </select>
            </div>

            {(busca || filtroStatus !== "todos") && (
              <span className="quadras-filter-count">
                {totalFiltradas}{" "}
                {totalFiltradas === 1 ? "quadra encontrada" : "quadras encontradas"}
              </span>
            )}
          </div>

          <div className="quadras-por-empresa-wrapper">
            {empresasComQuadras.length === 0 && (
              <div className="card">
                <p style={{ color: "var(--color-text-secondary)" }}>
                  {busca || filtroStatus !== "todos"
                    ? "Nenhuma quadra corresponde aos filtros aplicados."
                    : "Há quadras cadastradas, mas nenhuma empresa vinculada foi encontrada. Verifique seus complexos."}
                </p>
              </div>
            )}

            {empresasComQuadras.map((empresa) => (
              <div key={empresa.id} className="empresa-bloco">
                <div className="empresa-header">
                  <h2 className="empresa-nome">{empresa.nome}</h2>
                  {empresa.endereco_resumo && (
                    <p className="empresa-endereco">
                      {empresa.endereco_resumo}
                    </p>
                  )}
                </div>

                <div className="quadras-grid">
                  {empresa.quadras.map((quadra) => {
                    const statusLower = String(
                      quadra.status || ""
                    ).toLowerCase();
                    const estaAtiva = statusLower === "ativa";

                    let labelStatus = "Status não informado";
                    if (statusLower === "ativa") labelStatus = "Ativa";
                    else if (statusLower === "inativa") labelStatus = "Inativa";
                    else if (statusLower === "manutencao")
                      labelStatus = "Em manutenção";

                    return (
                      <div key={quadra.id} className="card quadra-card">
                        <div className="quadra-card-header">
                          <div>
                            <h3 className="quadra-nome">
                              {quadra.tipo || "Quadra"}{" "}
                              {quadra.modalidade
                                ? `- ${quadra.modalidade}`
                                : ""}
                            </h3>
                            <span className="quadra-material">
                              {quadra.material || "Material não informado"}
                            </span>
                          </div>

                          <span
                            className={`quadra-status-badge quadra-status-${statusLower}`}
                          >
                            {labelStatus}
                          </span>
                        </div>

                        <div className="quadra-detalhes">
                          {quadra.informacoes && (
                            <p>
                              <strong>Informações:</strong>{" "}
                              {quadra.informacoes}
                            </p>
                          )}
                          {quadra.aviso && (
                            <p>
                              <strong>Aviso:</strong> {quadra.aviso}
                            </p>
                          )}
                        </div>

                        <div className="quadra-acoes">
                          <button
                            className="btn-secondary"
                            onClick={() => handleEditarQuadra(quadra.id)}
                          >
                            Editar
                          </button>

                          <button
                            className={
                              estaAtiva
                                ? "btn-danger"
                                : "btn-secondary-outline"
                            }
                            onClick={() => handleToggleStatus(quadra)}
                          >
                            {estaAtiva ? "Desativar" : "Reativar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default GestorQuadrasListPage;
