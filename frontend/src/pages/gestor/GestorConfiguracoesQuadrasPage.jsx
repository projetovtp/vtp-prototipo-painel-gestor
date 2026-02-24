// src/pages/gestor/GestorConfiguracoesQuadrasPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function GestorConfiguracoesQuadrasPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Estados do modal de adicionar/editar quadra
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoQuadraId, setEditandoQuadraId] = useState(null); // null = adicionar, número = editar
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  // Estados do formulário
  const [formData, setFormData] = useState({
    estrutura: "",
    material: "",
    modalidades: [], // Array para múltiplas modalidades
    inputModalidade: "", // Input temporário para nova modalidade
    quantidadeQuadras: "",
    apelido: ""
  });

  // -----------------------------------
  // Carrega quadras do gestor
  // -----------------------------------
  async function carregarQuadras(gestorId) {
    try {
      setCarregando(true);
      setErro("");

      // TODO: Quando integrar com API real, usar:
      // const { data } = await api.get("/gestor/quadras", {
      //   params: { gestorId },
      // });
      // setQuadras(data || []);

      // Mock de dados para visualização
      setQuadras([
        {
          id: 1,
          nome: "Quadra Principal",
          estrutura: "Indoor",
          material: "Sintético",
          modalidades: ["Futebol", "Futsal"],
          quantidade_quadras: 2,
          apelido: "Quadra Principal",
          empresa_id: 1,
          status: "ativa",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: "Quadra Externa",
          estrutura: "Externa",
          material: "Gramado Natural",
          modalidades: ["Futebol", "Society", "Campo"],
          quantidade_quadras: 1,
          apelido: "Quadra Externa",
          empresa_id: 1,
          status: "ativa",
          created_at: new Date().toISOString()
        }
      ]);
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
      // TODO: Quando integrar com API real, usar:
      // const { data } = await api.get("/gestor/empresas");
      // setEmpresas(data || []);

      // Mock de dados para visualização
      setEmpresas([
        {
          id: 1,
          nome: "Complexo Esportivo",
          endereco_resumo: "Rua das Quadras, 123 - São Paulo, SP"
        }
      ]);
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
    setEditandoQuadraId(null);
    setFormData({
      estrutura: "",
      material: "",
      modalidades: [],
      inputModalidade: "",
      quantidadeQuadras: "",
      apelido: ""
    });
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setEditandoQuadraId(null);
    setFormData({
      estrutura: "",
      material: "",
      modalidades: [],
      inputModalidade: "",
      quantidadeQuadras: "",
      apelido: ""
    });
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function handleEditarQuadra(id) {
    const quadra = quadras.find(q => q.id === id);
    if (!quadra) return;

    setEditandoQuadraId(id);
    setFormData({
      estrutura: quadra.estrutura || "",
      material: quadra.material || "",
      modalidades: quadra.modalidades || (quadra.modalidade ? [quadra.modalidade] : []),
      inputModalidade: "",
      quantidadeQuadras: quadra.quantidade_quadras?.toString() || "",
      apelido: quadra.apelido || ""
    });
    setMensagemErro("");
    setMensagemSucesso("");
    setModalAberto(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setSalvando(true);
      setMensagemErro("");
      setMensagemSucesso("");
      
      // Validações
      if (!formData.estrutura || !formData.material || !formData.modalidades || formData.modalidades.length === 0 || !formData.quantidadeQuadras) {
        setMensagemErro("Estrutura, Material, Modalidade e Quantidade são obrigatórios.");
        return;
      }

      const quantidade = parseInt(formData.quantidadeQuadras);
      if (isNaN(quantidade) || quantidade <= 0) {
        setMensagemErro("A quantidade de quadras deve ser um número maior que zero.");
        return;
      }

      // Se não tiver apelido, usar estrutura + primeira modalidade como nome
      const primeiraModalidade = formData.modalidades.length > 0 ? formData.modalidades[0] : "";
      const nomeQuadra = formData.apelido.trim() 
        ? formData.apelido.trim() 
        : `${formData.estrutura}${primeiraModalidade ? ` - ${primeiraModalidade}` : ""}`;

      const dadosParaEnviar = {
        ...formData,
        nome: nomeQuadra
      };

      if (editandoQuadraId) {
        // TODO: Quando integrar com API real, usar:
        // await api.put(`/gestor/configuracoes/quadras/${editandoQuadraId}`, dadosParaEnviar);
        
        // Simulação de atualização
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Atualizar a quadra na lista local
        setQuadras(prev => prev.map(q => {
          if (q.id === editandoQuadraId) {
            return {
              ...q,
              estrutura: formData.estrutura,
              material: formData.material,
              modalidades: formData.modalidades,
              quantidade_quadras: parseInt(formData.quantidadeQuadras),
              apelido: formData.apelido.trim() || null,
              nome: nomeQuadra
            };
          }
          return q;
        }));
        
        setMensagemSucesso("Quadra atualizada com sucesso!");
      } else {
        // TODO: Quando integrar com API real, usar:
        // await api.post("/gestor/configuracoes/quadras", dadosParaEnviar);
        
        // Simulação de salvamento
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Adicionar nova quadra à lista local
        const novaQuadra = {
          id: Date.now(), // ID temporário
          nome: nomeQuadra,
          estrutura: formData.estrutura,
          material: formData.material,
          modalidades: formData.modalidades,
          quantidade_quadras: parseInt(formData.quantidadeQuadras),
          apelido: formData.apelido.trim() || null,
          empresa_id: 1, // Mock
          status: "ativa",
          created_at: new Date().toISOString()
        };
        
        setQuadras(prev => [...prev, novaQuadra]);
        
        setMensagemSucesso("Quadras adicionadas com sucesso!");
      }
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleFecharModal();
      }, 2000);
    } catch (error) {
      console.error("[CONFIGURAÇÕES QUADRAS] Erro ao salvar:", error);
      setMensagemErro("Erro ao salvar quadras. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }


  async function handleToggleStatus(quadra) {
    try {
      setErro("");

      const estaAtiva = String(quadra.status || "").toLowerCase() === "ativa";

      const rota = estaAtiva
        ? `/gestor/quadras/${quadra.id}/desativar`
        : `/gestor/quadras/${quadra.id}/reativar`;

      await api.patch(rota);

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
    .filter((empresa) => empresa.quadras && empresa.quadras.length > 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quadras</h1>
        <button className="btn-primary" onClick={handleNovaQuadra}>
          + Adicionar Quadra
        </button>
      </div>

      {carregando && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div>Carregando quadras...</div>
        </div>
      )}

      {erro && !carregando && (
        <div className="card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", marginBottom: 16 }}>
          {erro}
        </div>
      )}

      {!carregando && !erro && quadras.length === 0 && (
        <div className="card" style={{ 
          textAlign: "center", 
          padding: "60px 40px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px"
        }}>
          <div style={{ marginBottom: 24 }}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "#9ca3af", margin: "0 auto" }}
            >
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
            Não tem nenhuma quadra
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            Comece adicionando sua primeira quadra para gerenciar suas reservas
          </p>
          <button 
            className="btn-primary" 
            onClick={handleNovaQuadra}
            style={{ 
              backgroundColor: "#37648c", 
              borderColor: "#37648c",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            + Adicionar Quadra
          </button>
        </div>
      )}

      {!carregando && !erro && quadras.length > 0 && (
        <div className="quadras-por-empresa-wrapper">
          {empresasComQuadras.length === 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <p style={{ color: "#6b7280" }}>
                Há quadras cadastradas, mas nenhuma empresa vinculada foi
                encontrada. Verifique seus complexos.
              </p>
            </div>
          )}

          {empresasComQuadras.map((empresa) => (
            <div key={empresa.id} className="empresa-bloco">
              <div className="quadras-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20
              }}>
                {empresa.quadras.map((quadra) => {
                  const statusLower = String(quadra.status || "").toLowerCase();
                  const estaAtiva = statusLower === "ativa";

                  let labelStatus = "Status não informado";
                  if (statusLower === "ativa") labelStatus = "Ativa";
                  else if (statusLower === "inativa") labelStatus = "Inativa";
                  else if (statusLower === "manutencao")
                    labelStatus = "Em manutenção";

                  return (
                    <div key={quadra.id} style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 12,
                      padding: 24,
                      minHeight: "320px",
                      height: "100%",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    >
                      {/* Header com nome e status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: 16, 
                            fontWeight: 600, 
                            color: "#111827", 
                            margin: 0,
                            marginBottom: 8
                          }}>
                            {quadra.nome || quadra.apelido || `${quadra.estrutura || "Quadra"}${quadra.modalidades && quadra.modalidades.length > 0 ? ` - ${quadra.modalidades[0]}` : ""}`}
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            backgroundColor: estaAtiva ? "#d1fae5" : "#fee2e2",
                            color: estaAtiva ? "#065f46" : "#991b1b",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {labelStatus}
                        </span>
                      </div>

                      {/* Informações em grid compacto */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 12,
                        padding: "16px",
                        backgroundColor: "#f9fafb",
                        borderRadius: 8,
                        flex: 1,
                        alignContent: "start"
                      }}>
                        {quadra.estrutura && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280", flexShrink: 0 }}>
                              <path d="M3 21h18M5 21V7l8-4v14M19 21V11l-6-4M9 9v0M9 15v0M15 11v0M15 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Estrutura</div>
                              <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{quadra.estrutura}</div>
                            </div>
                          </div>
                        )}
                        
                        {quadra.material && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280", flexShrink: 0 }}>
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Material</div>
                              <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{quadra.material}</div>
                            </div>
                          </div>
                        )}

                        {quadra.quantidade_quadras && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280", flexShrink: 0 }}>
                              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <div>
                              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Quantidade de Quadras</div>
                              <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{quadra.quantidade_quadras} {quadra.quantidade_quadras === 1 ? "quadra" : "quadras"}</div>
                            </div>
                          </div>
                        )}

                        {quadra.modalidades && quadra.modalidades.length > 0 && (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, gridColumn: quadra.modalidades.length > 2 ? "span 2" : "span 1" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280", flexShrink: 0, marginTop: 2 }}>
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, marginBottom: 4 }}>Modalidades</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {quadra.modalidades.map((mod, idx) => (
                                  <span key={idx} style={{
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    backgroundColor: "#e0e7ff",
                                    color: "#37648c",
                                    borderRadius: 12,
                                    fontWeight: 500
                                  }}>
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                        <button
                          onClick={() => handleEditarQuadra(quadra.id)}
                          style={{
                            flex: 1,
                            padding: "8px 16px",
                            backgroundColor: "#37648c",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#2d4f6f";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#37648c";
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleToggleStatus(quadra)}
                          style={{
                            flex: 1,
                            padding: "8px 16px",
                            backgroundColor: estaAtiva ? "#ef4444" : "#10b981",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = estaAtiva ? "#dc2626" : "#059669";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = estaAtiva ? "#ef4444" : "#10b981";
                          }}
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

      {/* Modal de Adicionar Quadra */}
      {modalAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleFecharModal();
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>
                {editandoQuadraId ? "Editar Quadra" : "Adicionar Quadra"}
              </h3>
              <button 
                type="button" 
                onClick={handleFecharModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {mensagemSucesso && (
              <div style={{ backgroundColor: "#d1fae5", border: "1px solid #86efac", color: "#065f46", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
                {mensagemSucesso}
              </div>
            )}

            {mensagemErro && (
              <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
                {mensagemErro}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Estrutura */}
                <div className="form-field">
                  <label htmlFor="estrutura">Estrutura *</label>
                  <select
                    id="estrutura"
                    name="estrutura"
                    value={formData.estrutura}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cccccc",
                      fontSize: 14,
                      outline: "none",
                      width: "100%",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#37648c"; e.target.style.boxShadow = "0 0 0 1px rgba(55, 100, 140, 0.2)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cccccc"; e.target.style.boxShadow = "none"; }}
                  >
                    <option value="">Selecione</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Coberta">Coberta</option>
                    <option value="Externa">Externa</option>
                  </select>
                </div>

                {/* Material */}
                <div className="form-field">
                  <label htmlFor="material">Material *</label>
                  <select
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cccccc",
                      fontSize: 14,
                      outline: "none",
                      width: "100%",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#37648c"; e.target.style.boxShadow = "0 0 0 1px rgba(55, 100, 140, 0.2)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cccccc"; e.target.style.boxShadow = "none"; }}
                  >
                    <option value="">Selecione</option>
                    <option value="Sintético">Sintético</option>
                    <option value="Gramado Natural">Gramado Natural</option>
                    <option value="Cimento">Cimento</option>
                    <option value="Madeira">Madeira</option>
                    <option value="Areia">Areia</option>
                    <option value="Saibro">Saibro</option>
                  </select>
                </div>

                {/* Modalidade */}
                <div className="form-field" style={{ gridColumn: "span 2" }}>
                  <label htmlFor="modalidade-input" style={{ marginBottom: 8, display: "block", fontSize: 14, fontWeight: 500, color: "#111827" }}>
                    Modalidade *
                  </label>
                  <div style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    backgroundColor: "#ffffff",
                    minHeight: "50px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    cursor: "text"
                  }}
                  onClick={() => {
                    const input = document.getElementById("modalidade-input");
                    if (input) input.focus();
                  }}
                  >
                    {formData.modalidades && formData.modalidades.length > 0 && formData.modalidades.map((modalidade, index) => (
                      <div
                        key={index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          backgroundColor: "#e0e7ff",
                          color: "#37648c",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 500,
                          border: "1px solid #c7d2fe"
                        }}
                      >
                        <span>{modalidade}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              modalidades: prev.modalidades.filter((_, i) => i !== index)
                            }));
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#37648c",
                            cursor: "pointer",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 16,
                            lineHeight: 1,
                            marginLeft: 4
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = "#1e40af";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#37648c";
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      id="modalidade-input"
                      type="text"
                      placeholder={formData.modalidades && formData.modalidades.length > 0 ? "Adicionar outra modalidade..." : "Digite a modalidade e pressione Enter"}
                      value={formData.inputModalidade || ""}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          inputModalidade: e.target.value
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          e.preventDefault();
                          const novaModalidade = e.target.value.trim();
                          setFormData(prev => {
                            const modalidades = prev.modalidades || [];
                            if (!modalidades.includes(novaModalidade)) {
                              return {
                                ...prev,
                                modalidades: [...modalidades, novaModalidade],
                                inputModalidade: ""
                              };
                            }
                            return {
                              ...prev,
                              inputModalidade: ""
                            };
                          });
                        }
                      }}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: 14,
                        color: "#111827",
                        flex: 1,
                        minWidth: "200px",
                        padding: "4px 0",
                        backgroundColor: "transparent"
                      }}
                    />
                  </div>
                  {formData.modalidades && formData.modalidades.length > 0 && (
                    <span style={{ fontSize: 12, color: "#6b7280", marginTop: 8, display: "block" }}>
                      {formData.modalidades.length} {formData.modalidades.length === 1 ? "modalidade adicionada" : "modalidades adicionadas"}
                    </span>
                  )}
                </div>

                {/* Quantidade de Quadras */}
                <div className="form-field">
                  <label htmlFor="quantidadeQuadras">Quantidade de Quadras *</label>
                  <input
                    id="quantidadeQuadras"
                    name="quantidadeQuadras"
                    type="number"
                    value={formData.quantidadeQuadras}
                    onChange={handleChange}
                    placeholder="Ex: 2"
                    min="1"
                    required
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cccccc",
                      fontSize: 14,
                      outline: "none",
                      width: "100%",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#37648c"; e.target.style.boxShadow = "0 0 0 1px rgba(55, 100, 140, 0.2)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cccccc"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Apelido */}
                <div className="form-field" style={{ gridColumn: "span 2" }}>
                  <label htmlFor="apelido">Apelido</label>
                  <input
                    id="apelido"
                    name="apelido"
                    type="text"
                    value={formData.apelido}
                    onChange={handleChange}
                    placeholder="Ex: Quadra Principal"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid #cccccc",
                      fontSize: 14,
                      outline: "none",
                      width: "100%",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#37648c"; e.target.style.boxShadow = "0 0 0 1px rgba(55, 100, 140, 0.2)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cccccc"; e.target.style.boxShadow = "none"; }}
                  />
                  <span style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "block" }}>
                    {formData.apelido.trim()
                      ? `Nome da quadra: ${formData.apelido.trim()}`
                      : formData.estrutura && formData.modalidades && formData.modalidades.length > 0
                        ? `Nome da quadra será: ${formData.estrutura} - ${formData.modalidades[0]}${formData.modalidades.length > 1 ? ` (+${formData.modalidades.length - 1})` : ""}`
                        : "Se não informado, o nome será: Estrutura - Modalidade"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <button
                  type="button"
                  onClick={handleFecharModal}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: salvando ? "#9ca3af" : "#37648c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: salvando ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!salvando) {
                      e.target.style.backgroundColor = "#2d4f6f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!salvando) {
                      e.target.style.backgroundColor = "#37648c";
                    }
                  }}
                >
                  {salvando 
                    ? (editandoQuadraId ? "Atualizando..." : "Salvando...") 
                    : (editandoQuadraId ? "Atualizar" : "Adicionar Quadra")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
