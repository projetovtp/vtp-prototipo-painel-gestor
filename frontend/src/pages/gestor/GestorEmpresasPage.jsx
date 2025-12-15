// src/pages/gestor/GestorEmpresasPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function GestorEmpresasPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  function irParaEditar(empresaId) {
    navigate(`/gestor/empresas/editar/${empresaId}`);
  }

  const [form, setForm] = useState({
    nome: "",
    enderecoResumo: "",
    linkMaps: "",
    linkRede: "",
    descricao: "",
  });

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [empresas, setEmpresas] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleLimpar() {
    setForm({
      nome: "",
      enderecoResumo: "",
      linkMaps: "",
      linkRede: "",
      descricao: "",
    });
    setMensagemSucesso("");
    setMensagemErro("");
  }

  async function carregarEmpresas() {
    if (!usuario?.id) return;

    try {
      setCarregandoLista(true);
      setMensagemErro("");
      const { data } = await api.get("/gestor/empresas");
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao listar empresas:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(
        msgBackend ||
          "Erro ao carregar a lista de complexos. Tente novamente mais tarde."
      );
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => {
    carregarEmpresas();
  }, [usuario]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    if (!usuario?.id) {
      setMensagemErro("Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        nome: form.nome.trim(),
        endereco_resumo: form.enderecoResumo.trim(),
        link_google_maps: form.linkMaps?.trim() || null,
        link_site_ou_rede: form.linkRede?.trim() || null,
        descricao_complexo: form.descricao?.trim() || null,
      };

      const { data } = await api.post("/gestor/empresas", payload);

      console.log("[GESTOR/EMPRESAS] Empresa criada com sucesso:", data);

      setMensagemSucesso("Complexo salvo com sucesso para este gestor.");
      setMensagemErro("");

      handleLimpar();
      await carregarEmpresas();
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao salvar empresa:", err);
      const msgBackend = err.response?.data?.error || err.message;
      setMensagemErro(
        msgBackend ||
          "Erro ao salvar o complexo. Verifique os dados e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  // 🔹 NOVO: desativar complexo (soft delete via backend)
  async function handleDesativar(empresaId) {
    if (!usuario?.id) {
      setMensagemErro("Usuário não identificado. Faça login novamente.");
      return;
    }

    const confirmacao = window.confirm(
      "Tem certeza que deseja desativar este complexo?\n\n" +
        "Ele deixará de aparecer para os clientes no WhatsApp, " +
        "mas você poderá pedir ao administrador para reativá-lo depois."
    );

    if (!confirmacao) return;

    try {
      setEnviando(true);
      setMensagemErro("");
      setMensagemSucesso("");

      await api.patch(`/gestor/empresas/${empresaId}/desativar`, {});

      setMensagemSucesso("Complexo desativado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao desativar empresa:", err);
      const msgBackend = err.response?.data?.error || err.message;
      setMensagemErro(
        msgBackend ||
          "Erro ao desativar o complexo. Tente novamente mais tarde."
      );
    } finally {
      setEnviando(false);
    }
  }
    // 🔹 NOVO: reativar complexo (desde que não tenha sido bloqueado pelo ADMIN)
  async function handleReativar(empresaId) {
    if (!usuario?.id) {
      setMensagemErro("Usuário não identificado. Faça login novamente.");
      return;
    }

    const confirmacao = window.confirm(
      "Deseja reativar este complexo?\n\n" +
        "Ele voltará a aparecer para os clientes no WhatsApp."
    );

    if (!confirmacao) return;

    try {
      setEnviando(true);
      setMensagemErro("");
      setMensagemSucesso("");

      await api.patch(`/gestor/empresas/${empresaId}/reativar`, {});

      setMensagemSucesso("Complexo reativado com sucesso.");
      await carregarEmpresas();
    } catch (err) {
      console.error("[GESTOR/EMPRESAS] Erro ao reativar empresa:", err);
      const msgBackend = err.response?.data?.error || err.message;
      setMensagemErro(
        msgBackend ||
          "Erro ao reativar o complexo. Tente novamente mais tarde."
      );
    } finally {
      setEnviando(false);
    }
  }


  return (
    <div>
      <h2>Minhas Empresas / Complexos</h2>
      <p style={{ marginBottom: "16px" }}>
        Aqui você cadastra e administra os complexos que aparecem para o cliente
        no WhatsApp. Você pode ajustar nome, endereço, descrição e links
        sempre que precisar.
      </p>

      {/* CARD DO FORMULÁRIO */}
      <div className="card">
        <h3>Cadastro de Complexo (Gestor)</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* NOME DO COMPLEXO */}
          <div className="form-field">
            <label htmlFor="nome">Nome do complexo *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex.: Complexo Grêmio Esportivo"
              required
            />
            <small>
              Nome que o cliente verá no WhatsApp e nas listas do painel.
            </small>
          </div>

          {/* ENDEREÇO RESUMIDO */}
          <div className="form-field">
            <label htmlFor="enderecoResumo">Endereço resumido *</label>
            <input
              id="enderecoResumo"
              name="enderecoResumo"
              type="text"
              value={form.enderecoResumo}
              onChange={handleChange}
              placeholder="Ex.: Rua X, 123 – Bairro Y – Cidade/UF"
              required
            />
            <small>
              Esse texto aparece resumido no card do complexo (Flow e painel).
            </small>
          </div>

          {/* LINK GOOGLE MAPS */}
          <div className="form-field">
            <label htmlFor="linkMaps">Link do Google Maps</label>
            <input
              id="linkMaps"
              name="linkMaps"
              type="url"
              value={form.linkMaps}
              onChange={handleChange}
              placeholder="Cole aqui o link do Maps (opcional)"
            />
            <small>
              Usado para o botão &quot;Ver no mapa&quot;. Cole o link de
              compartilhamento do Google Maps.
            </small>
          </div>

          {/* LINK DE REDE / SITE */}
          <div className="form-field">
            <label htmlFor="linkRede">Link de rede social ou site</label>
            <input
              id="linkRede"
              name="linkRede"
              type="url"
              value={form.linkRede}
              onChange={handleChange}
              placeholder="Ex.: https://instagram.com/seu_complexo"
            />
            <small>
              Opcional. Pode apontar para Instagram, site ou outra página do
              complexo.
            </small>
          </div>

          {/* DESCRIÇÃO DO COMPLEXO */}
          <div className="form-field form-field-full">
            <label htmlFor="descricao">Descrição do complexo</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              value={form.descricao}
              onChange={handleChange}
              placeholder="Explique em poucas linhas o que o complexo oferece, diferenciais, estrutura, etc."
            />
            <small>
              Esse texto aparece em telas de detalhe do complexo, ajudando o
              cliente a entender o que você oferece.
            </small>
          </div>

          {/* BOTÕES */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-outlined"
              onClick={handleLimpar}
              disabled={enviando}
            >
              Limpar
            </button>
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar complexo"}
            </button>
          </div>

          {mensagemSucesso && (
            <p className="form-message success">{mensagemSucesso}</p>
          )}
          {mensagemErro && (
            <p className="form-message error">{mensagemErro}</p>
          )}
        </form>
      </div>

      {/* CARD DA LISTA */}
      <div className="card" style={{ marginTop: "24px" }}>
        <h3>Meus complexos cadastrados</h3>

        {carregandoLista && <p>Carregando complexos...</p>}

        {!carregandoLista && mensagemErro && empresas.length === 0 && (
          <p className="form-message error">{mensagemErro}</p>
        )}

        {!carregandoLista && empresas.length === 0 && !mensagemErro && (
          <p>Nenhum complexo cadastrado para este gestor ainda.</p>
        )}

        {!carregandoLista && empresas.length > 0 && (
          <div
            style={{
              overflowX: "auto",
              marginTop: "8px",
            }}
          >
            <table
              className="tabela-simples"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "820px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 14px" }}>
                    Nome
                  </th>
                  <th style={{ textAlign: "left", padding: "10px 14px" }}>
                    Endereço
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      width: "30%",
                    }}
                  >
                    Descrição
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      width: "15%",
                    }}
                  >
                    Links
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "10px 14px",
                      width: "160px",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa, index) => {
                  // ✅ Agora a variável existe e não dá mais erro
                  const estaAtivo = empresa.ativo !== false; // se for null/undefined, consideramos ATIVO

                  const labelBotao = estaAtivo ? "Desativar" : "Reativar";
                  const corBorda = estaAtivo ? "#d32f2f" : "#2e7d32";
                  const corTexto = estaAtivo ? "#d32f2f" : "#2e7d32";

                  const handleClickBotao = () => {
                    if (estaAtivo) {
                      handleDesativar(empresa.id);
                    } else {
                      handleReativar(empresa.id);
                    }
                  };

                  return (
                    <tr
                      key={empresa.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                      }}
                    >
                      {/* NOME */}
                      <td style={{ padding: "8px 14px", verticalAlign: "top" }}>
                        <strong>{empresa.nome}</strong>
                        {!estaAtivo && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: "0.8rem",
                              color: "#d32f2f",
                            }}
                          >
                            (desativado)
                          </span>
                        )}
                      </td>

                      {/* ENDEREÇO */}
                      <td style={{ padding: "8px 14px", verticalAlign: "top" }}>
                        {empresa.endereco_resumo || "-"}
                      </td>

                      {/* DESCRIÇÃO */}
                      <td
                        style={{
                          padding: "8px 14px",
                          verticalAlign: "top",
                          fontSize: "0.92rem",
                          color: "#444",
                        }}
                      >
                        {empresa.descricao_complexo
                          ? empresa.descricao_complexo.length > 80
                            ? empresa.descricao_complexo.slice(0, 80) + "..."
                            : empresa.descricao_complexo
                          : "-"}
                      </td>

                      {/* LINKS */}
                      <td
                        style={{
                          padding: "8px 14px",
                          verticalAlign: "top",
                          fontSize: "0.9rem",
                        }}
                      >
                        {empresa.link_site_ou_rede && (
                          <div style={{ marginBottom: "4px" }}>
                            <a
                              href={empresa.link_site_ou_rede}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Site/Redes
                            </a>
                          </div>
                        )}
                        {empresa.link_google_maps && (
                          <div>
                            <a
                              href={empresa.link_google_maps}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Maps
                            </a>
                          </div>
                        )}
                        {!empresa.link_site_ou_rede &&
                          !empresa.link_google_maps &&
                          "-"}
                      </td>

                      {/* AÇÕES */}
                      <td
                        style={{
                          padding: "8px 14px",
                          verticalAlign: "top",
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            className="btn-outlined"
                            onClick={() => irParaEditar(empresa.id)}
                            style={{ padding: "6px 12px", fontSize: "0.9rem" }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn-outlined"
                            onClick={handleClickBotao}
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.9rem",
                              borderColor: corBorda,
                              color: corTexto,
                            }}
                            disabled={enviando}
                          >
                            {labelBotao}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>



            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestorEmpresasPage;
