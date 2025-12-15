// src/pages/gestor/GestorQuadrasListPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GestorQuadrasListPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // -----------------------------------
  // Carrega quadras do gestor
  // -----------------------------------
  async function carregarQuadras(gestorId) {
    try {
      setCarregando(true);
      setErro("");

      const { data } = await api.get("/gestor/quadras", {
        params: { gestorId },
      });

      // data deve ser um array de quadras vindo do backend
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

  // -----------------------------------
  // Carrega empresas/complexos do gestor
  // -----------------------------------
  async function carregarEmpresas() {
    try {
      const { data } = await api.get("/gestor/empresas");
      setEmpresas(data || []);
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao buscar empresas:", err);
      // não travo a tela por causa disso, só registro o erro no console
    }
  }

  useEffect(() => {
    if (!usuario?.id) return;
    carregarQuadras(usuario.id);
    carregarEmpresas();
  }, [usuario]);

  // -----------------------------------
  // Ações
  // -----------------------------------
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

      // se estiver ativa → desativar
      // se estiver inativa/manutenção → reativar
      const rota = estaAtiva
        ? `/gestor/quadras/${quadra.id}/desativar`
        : `/gestor/quadras/${quadra.id}/reativar`;

      await api.patch(rota);

      // Recarrega a lista após a alteração
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

  // -----------------------------------
  // Agrupa quadras por empresa_id
  // -----------------------------------
  const empresasComQuadras = empresas
    .map((empresa) => {
      const quadrasDaEmpresa = quadras.filter(
        (q) => q.empresa_id === empresa.id
      );
      return {
        ...empresa,
        quadras: quadrasDaEmpresa,
      };
    })
    // só mostra empresas que têm pelo menos 1 quadra
    .filter((empresa) => empresa.quadras && empresa.quadras.length > 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quadras cadastradas</h1>
        <button className="btn-primary" onClick={handleNovaQuadra}>
          + Nova quadra
        </button>
      </div>

      {carregando && <p>Carregando quadras...</p>}

      {erro && !carregando && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {!carregando && !erro && quadras.length === 0 && (
        <p>Nenhuma quadra cadastrada ainda.</p>
      )}

      {!carregando && !erro && quadras.length > 0 && (
        <div className="quadras-por-empresa-wrapper">
          {empresasComQuadras.length === 0 && (
            <p>
              Há quadras cadastradas, mas nenhuma empresa vinculada foi
              encontrada. Verifique seus complexos.
            </p>
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
                  const statusLower = String(quadra.status || "").toLowerCase();
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
                            estaAtiva ? "btn-danger" : "btn-secondary-outline"
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
      )}
    </div>
  );
}

export default GestorQuadrasListPage;
