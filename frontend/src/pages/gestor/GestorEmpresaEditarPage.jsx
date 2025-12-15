// src/pages/gestor/GestorEmpresaEditarPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function GestorEmpresaEditarPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    enderecoResumo: "",
    linkMaps: "",
    linkRede: "",
    descricao: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function carregarEmpresa() {
      try {
        setCarregando(true);
        setMensagemErro("");

        const { data } = await api.get(`/gestor/empresas/${empresaId}`);

        setForm({
          nome: data.nome || "",
          enderecoResumo: data.endereco_resumo || "",
          linkMaps: data.link_google_maps || "",
          linkRede: data.link_site_ou_rede || "",
          descricao: data.descricao_complexo || "",
        });
      } catch (err) {
        console.error("[GESTOR/EMPRESA-EDITAR] Erro ao carregar empresa:", err);
        const msgBackend = err.response?.data?.error;
        setMensagemErro(
          msgBackend ||
            "Erro ao carregar dados do complexo. Tente novamente mais tarde."
        );
      } finally {
        setCarregando(false);
      }
    }

    if (empresaId) {
      carregarEmpresa();
    }
  }, [empresaId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemSucesso("");
    setMensagemErro("");

    try {
      setSalvando(true);

      const payload = {
        nome: form.nome.trim(),
        endereco_resumo: form.enderecoResumo.trim(),
        link_google_maps: form.linkMaps?.trim() || null,
        link_site_ou_rede: form.linkRede?.trim() || null,
        descricao_complexo: form.descricao?.trim() || null,
      };

      const { data } = await api.put(
        `/gestor/empresas/${empresaId}`,
        payload
      );

      console.log("[GESTOR/EMPRESA-EDITAR] Empresa atualizada:", data);

      setMensagemSucesso("Complexo atualizado com sucesso.");
    } catch (err) {
      console.error("[GESTOR/EMPRESA-EDITAR] Erro ao atualizar empresa:", err);
      const msgBackend = err.response?.data?.error;
      setMensagemErro(
        msgBackend ||
          "Erro ao atualizar o complexo. Verifique os dados e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  function voltarLista() {
    navigate("/gestor/empresas");
  }

  if (carregando) {
    return <p>Carregando dados do complexo...</p>;
  }

  if (mensagemErro && !form.nome) {
    return (
      <div>
        <p className="form-message error">{mensagemErro}</p>
        <button type="button" className="btn-outlined" onClick={voltarLista}>
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Editar Complexo</h2>
        <button type="button" className="btn-outlined" onClick={voltarLista}>
          Voltar
        </button>
      </div>

      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="nome">Nome do complexo *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="enderecoResumo">Endereço resumido *</label>
            <input
              id="enderecoResumo"
              name="enderecoResumo"
              type="text"
              value={form.enderecoResumo}
              onChange={handleChange}
              required
            />
          </div>

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
          </div>

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
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="descricao">Descrição do complexo</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              value={form.descricao}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-outlined"
              onClick={voltarLista}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
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
    </div>
  );
}

export default GestorEmpresaEditarPage;
