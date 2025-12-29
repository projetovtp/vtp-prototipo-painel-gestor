// src/pages/gestor/GestorQuadrasPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // usa axios com JWT

function GestorQuadrasPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    complexoId: "",
    tipo: "",
    material: "",
    modalidade: "",
    aviso: "",
    informacoes: "",
    status: "ativa",
  });

  const [fotos, setFotos] = useState({
    foto1: null,
    foto2: null,
    foto3: null,
  });

  const [previews, setPreviews] = useState({
    foto1: null,
    foto2: null,
    foto3: null,
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Empresas/complexos do gestor para popular o select
  const [empresas, setEmpresas] = useState([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);
  const [erroEmpresas, setErroEmpresas] = useState("");

  // ✅ NOVO: controla “tela de sucesso” após salvar
  const [salvouComSucesso, setSalvouComSucesso] = useState(false);
  const [quadraCriadaResumo, setQuadraCriadaResumo] = useState(null);

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        setCarregandoEmpresas(true);
        setErroEmpresas("");

        const response = await api.get("/gestor/empresas");
        setEmpresas(response.data || []);
      } catch (error) {
        console.error("[GESTOR/QUADRAS] Erro ao carregar empresas:", error);
        setErroEmpresas("Erro ao carregar complexos deste gestor.");
      } finally {
        setCarregandoEmpresas(false);
      }
    }

    carregarEmpresas();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(event, key) {
    const file = event.target.files[0] || null;

    setFotos((prev) => ({
      ...prev,
      [key]: file,
    }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [key]: url,
      }));
    } else {
      setPreviews((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  }

  function handleLimpar() {
    setForm({
      complexoId: "",
      tipo: "",
      material: "",
      modalidade: "",
      aviso: "",
      informacoes: "",
      status: "ativa",
    });
    setFotos({
      foto1: null,
      foto2: null,
      foto3: null,
    });
    setPreviews({
      foto1: null,
      foto2: null,
      foto3: null,
    });
    setMensagem("");
    setErro("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    if (!form.complexoId) {
      setErro("Selecione um complexo antes de salvar a quadra.");
      return;
    }

    setCarregando(true);

    try {
      const formData = new FormData();
      // gestor_id vem do JWT, não precisa mandar
      formData.append("complexoId", form.complexoId);
      formData.append("tipo", form.tipo);
      formData.append("material", form.material);
      formData.append("modalidade", form.modalidade);
      formData.append("aviso", form.aviso);
      formData.append("informacoes", form.informacoes);
      formData.append("status", form.status);

      if (fotos.foto1) formData.append("foto1", fotos.foto1);
      if (fotos.foto2) formData.append("foto2", fotos.foto2);
      if (fotos.foto3) formData.append("foto3", fotos.foto3);

      const response = await api.post("/gestor/quadras", formData);

      console.log("Quadra criada com sucesso:", response.data);

      // ✅ NOVO: tela de sucesso (some o formulário)
      setQuadraCriadaResumo(response.data || null);
      setSalvouComSucesso(true);
      setMensagem("Quadra criada com sucesso!");
    } catch (err) {
      console.error("Erro inesperado ao enviar quadra:", err);
      const msgBackend = err.response?.data?.error;
      setErro(
        msgBackend ||
          "Erro ao criar quadra. Verifique o backend e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const nomeGerado =
    form.modalidade || form.material || form.tipo
      ? `${form.modalidade || "Modalidade"} - ${form.material || "Material"} (${
          form.tipo || "Tipo"
        })`
      : "Escolha Tipo, Material e Modalidade para gerar o nome da quadra.";

  // ✅ NOVO: TELA DE SUCESSO
  if (salvouComSucesso) {
    const nomeFinal =
      quadraCriadaResumo?.nome ||
      nomeGerado ||
      "Quadra cadastrada";

    return (
      <div className="page">
        <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>✅ Quadra salva com sucesso!</h2>

          <p style={{ marginTop: 8 }}>
            A quadra <strong>{nomeFinal}</strong> já foi cadastrada e já pode
            aparecer no Flow (se tiver regras/horários cadastrados).
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                // volta pro formulário limpo
                setSalvouComSucesso(false);
                setQuadraCriadaResumo(null);
                handleLimpar();
              }}
            >
              + Cadastrar outra quadra
            </button>

            <button
              className="btn-outlined"
              type="button"
              onClick={() => navigate("/gestor/quadras")}
            >
              Voltar para lista de quadras
            </button>
          </div>

          <small style={{ display: "block", marginTop: 14, opacity: 0.75 }}>
            Isso evita duplicar quadras por “clique repetido” depois de salvar.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Minhas Quadras</h2>
      <p style={{ marginBottom: "16px" }}>
        Cadastre e edite as quadras que aparecerão para o cliente no Flow do
        WhatsApp. As informações abaixo controlam tanto o painel quanto o que o
        usuário enxerga nas telas de escolha de quadra.
      </p>

      <div className="card">
        <h3>Cadastro de Quadra (Gestor)</h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* COMPLEXO / EMPRESA */}
          <div className="form-field">
            <label htmlFor="complexoId">Complexo *</label>
            <select
              id="complexoId"
              name="complexoId"
              value={form.complexoId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um complexo</option>
              {carregandoEmpresas && (
                <option disabled>Carregando complexos...</option>
              )}
              {!carregandoEmpresas &&
                empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
            </select>
            <small>
              Esta lista é carregada automaticamente com os complexos cadastrados
              para este gestor. Cadastre um novo complexo na tela de empresas
              para ele aparecer aqui.
            </small>
            {erroEmpresas && (
              <small style={{ color: "#c0392b" }}>{erroEmpresas}</small>
            )}
          </div>

          {/* STATUS */}
          <div className="form-field">
            <label htmlFor="status">Status da quadra *</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
              <option value="manutencao">Em manutenção</option>
            </select>
            <small>
              Quadras inativas ou em manutenção não aparecerão para novos
              agendamentos no Flow.
            </small>
          </div>

          {/* TIPO */}
          <div className="form-field">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um tipo</option>
              <option value="Indoor">Indoor</option>
              <option value="Externa">Externa</option>
              <option value="Coberta">Coberta</option>
            </select>
            <small>
              Define se a quadra é interna, externa ou coberta. Usado na
              identificação da quadra.
            </small>
          </div>

          {/* MATERIAL */}
          <div className="form-field">
            <label htmlFor="material">Material *</label>
            <select
              id="material"
              name="material"
              value={form.material}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um material</option>
              <option value="Areia">Areia</option>
              <option value="Cimento">Cimento</option>
              <option value="Sintético">Sintético</option>
              <option value="Emborrachado">Emborrachado</option>
              <option value="Grama natural">Grama natural</option>
            </select>
            <small>
              Aparece junto da modalidade para o cliente entender o tipo de
              piso.
            </small>
          </div>

          {/* MODALIDADE */}
          <div className="form-field">
            <label htmlFor="modalidade">Modalidade *</label>
            <select
              id="modalidade"
              name="modalidade"
              value={form.modalidade}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma modalidade</option>
              <option value="Futsal">Futsal</option>
              <option value="Society 5x5">Society 5x5</option>
              <option value="Society 7x7">Society 7x7</option>
              <option value="Futebol de campo">Futebol de campo</option>
              <option value="Vôlei de quadra">Vôlei de quadra</option>
              <option value="Vôlei de praia">Vôlei de praia</option>
              <option value="Beach tennis">Beach tennis</option>
              <option value="Futvôlei">Futvôlei</option>
              <option value="Tênis">Tênis</option>
              <option value="Pádel">Pádel</option>
              <option value="Basquete">Basquete</option>
              <option value="Handebol">Handebol</option>
            </select>
            <small>
              Modalidade principal da quadra. Também aparece no card da tela de
              escolha do Flow.
            </small>
          </div>

          {/* PRÉVIA DO NOME GERADO */}
          <div className="form-field form-field-full">
            <label>Nome gerado da quadra (prévia)</label>
            <div className="quadra-name-preview">{nomeGerado}</div>
            <small>
              Este é o nome que o cliente enxergará ao escolher a quadra. Ele é
              formado pela combinação de Modalidade + Material + Tipo.
            </small>
          </div>

          {/* AVISO IMPORTANTE */}
          <div className="form-field form-field-full">
            <label htmlFor="aviso">Avisos importantes</label>
            <input
              id="aviso"
              name="aviso"
              type="text"
              value={form.aviso}
              onChange={handleChange}
              placeholder="Ex.: Chegar 10 minutos antes. Levar documento com foto."
            />
            <small>
              Este texto aparece na tela de detalhes da quadra no Flow antes da
              confirmação da reserva.
            </small>
          </div>

          {/* INFORMAÇÕES ADICIONAIS */}
          <div className="form-field form-field-full">
            <label htmlFor="informacoes">Informações adicionais</label>
            <textarea
              id="informacoes"
              name="informacoes"
              rows={4}
              value={form.informacoes}
              onChange={handleChange}
              placeholder="Descreva tamanho, regras, se possui vestiário, estacionamento, etc."
            />
            <small>
              Texto de apoio que ajuda o cliente a entender melhor a estrutura
              da quadra.
            </small>
          </div>

          {/* FOTOS DA QUADRA */}
          <div className="form-field form-field-full">
            <label>Fotos da quadra (até 3)</label>
            <div className="photo-grid">
              {/* FOTO 1 */}
              <div className="photo-slot">
                <span className="photo-label">Foto 1 (principal)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "foto1")}
                />
                {previews.foto1 && (
                  <img
                    src={previews.foto1}
                    alt="Prévia foto 1"
                    className="photo-preview"
                  />
                )}
                <small>Imagem principal que poderá aparecer em cards.</small>
              </div>

              {/* FOTO 2 */}
              <div className="photo-slot">
                <span className="photo-label">Foto 2 (opcional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "foto2")}
                />
                {previews.foto2 && (
                  <img
                    src={previews.foto2}
                    alt="Prévia foto 2"
                    className="photo-preview"
                  />
                )}
                <small>Segunda imagem de apoio da quadra.</small>
              </div>

              {/* FOTO 3 */}
              <div className="photo-slot">
                <span className="photo-label">Foto 3 (opcional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "foto3")}
                />
                {previews.foto3 && (
                  <img
                    src={previews.foto3}
                    alt="Prévia foto 3"
                    className="photo-preview"
                  />
                )}
                <small>Terceira imagem de apoio da quadra.</small>
              </div>
            </div>

            <small className="photo-tip">
              Formatos recomendados: JPG, PNG ou WEBP. Tamanho sugerido até
              ~2–3MB por foto.
            </small>
          </div>

          {/* BOTÕES */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-outlined"
              onClick={handleLimpar}
              disabled={carregando}
            >
              Limpar
            </button>
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {mensagem && <p className="form-message">{mensagem}</p>}
          {erro && (
            <p className="form-message" style={{ color: "#c0392b" }}>
              {erro}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default GestorQuadrasPage;
