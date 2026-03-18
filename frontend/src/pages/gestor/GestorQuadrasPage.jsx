import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGestorEmpresas, useGestorQuadras } from "../../hooks/api";

const GestorQuadrasPage = () => {
  const navigate = useNavigate();
  const { listar: listarEmpresas } = useGestorEmpresas();
  const { criar: criarQuadra } = useGestorQuadras();

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

  const [empresas, setEmpresas] = useState([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);
  const [erroEmpresas, setErroEmpresas] = useState("");

  const [salvouComSucesso, setSalvouComSucesso] = useState(false);
  const [quadraCriadaResumo, setQuadraCriadaResumo] = useState(null);

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        setCarregandoEmpresas(true);
        setErroEmpresas("");
        const data = await listarEmpresas();
        setEmpresas(data || []);
      } catch (error) {
        console.error("[GESTOR/QUADRAS] Erro ao carregar empresas:", error);
        setErroEmpresas("Erro ao carregar complexos deste gestor.");
      } finally {
        setCarregandoEmpresas(false);
      }
    }

    carregarEmpresas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(event, key) {
    const file = event.target.files[0] || null;

    setFotos((prev) => ({ ...prev, [key]: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [key]: url }));
    } else {
      setPreviews((prev) => ({ ...prev, [key]: null }));
    }
  }

  function handleRemoverFoto(key) {
    setFotos((prev) => ({ ...prev, [key]: null }));
    setPreviews((prev) => ({ ...prev, [key]: null }));
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
    setFotos({ foto1: null, foto2: null, foto3: null });
    setPreviews({ foto1: null, foto2: null, foto3: null });
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

      const data = await criarQuadra(formData);

      setQuadraCriadaResumo(data || null);
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
      ? `${form.modalidade || "Modalidade"} - ${form.material || "Material"} (${form.tipo || "Tipo"})`
      : "Escolha Tipo, Material e Modalidade para gerar o nome da quadra.";

  if (salvouComSucesso) {
    const nomeFinal =
      quadraCriadaResumo?.nome || nomeGerado || "Quadra cadastrada";

    return (
      <div className="page">
        <div className="card quadra-sucesso-card">
          <div className="quadra-sucesso-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="2" />
              <path d="M8 12l3 3 5-5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="quadra-sucesso-titulo">Quadra salva com sucesso!</h2>

          <p className="quadra-sucesso-desc">
            A quadra <strong>{nomeFinal}</strong> já foi cadastrada e já pode
            aparecer no Flow (se tiver regras/horários cadastrados).
          </p>

          <div className="quadra-sucesso-acoes">
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
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
        </div>
      </div>
    );
  }

  const fotoSlots = [
    { key: "foto1", label: "Foto 1 (principal)", desc: "Imagem principal que poderá aparecer em cards." },
    { key: "foto2", label: "Foto 2 (opcional)", desc: "Segunda imagem de apoio da quadra." },
    { key: "foto3", label: "Foto 3 (opcional)", desc: "Terceira imagem de apoio da quadra." },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <button
            className="btn-back"
            onClick={() => navigate("/gestor/quadras")}
            title="Voltar para lista"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="page-title">Cadastrar nova quadra</h1>
        </div>
      </div>

      <p className="quadra-instrucao">
        Cadastre as quadras que aparecerão para o cliente no Flow do WhatsApp.
        As informações abaixo controlam tanto o painel quanto o que o usuário
        enxerga nas telas de escolha de quadra.
      </p>

      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          {/* COMPLEXO */}
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
              Cadastre um novo complexo na tela de empresas para ele aparecer
              aqui.
            </small>
            {erroEmpresas && (
              <small className="form-field-error">{erroEmpresas}</small>
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
          </div>

          {/* STATUS visual - span vazio para manter grid 2 cols alinhado */}
          <div />

          {/* PRÉVIA DO NOME */}
          <div className="form-field form-field-full">
            <label>Nome gerado da quadra (prévia)</label>
            <div className="quadra-name-preview">{nomeGerado}</div>
            <small>
              Este é o nome que o cliente enxergará. É formado pela combinação
              de Modalidade + Material + Tipo.
            </small>
          </div>

          {/* AVISO */}
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

          {/* INFORMAÇÕES */}
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
          </div>

          {/* FOTOS */}
          <div className="form-field form-field-full">
            <label>Fotos da quadra (até 3)</label>
            <div className="photo-grid">
              {fotoSlots.map(({ key, label, desc }) => (
                <div key={key} className="photo-slot">
                  <span className="photo-label">{label}</span>
                  {previews[key] ? (
                    <div className="photo-preview-wrapper">
                      <img
                        src={previews[key]}
                        alt={`Prévia ${label}`}
                        className="photo-preview"
                      />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => handleRemoverFoto(key)}
                        title="Remover foto"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="photo-upload-area">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Clique para enviar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, key)}
                        hidden
                      />
                    </label>
                  )}
                  <small>{desc}</small>
                </div>
              ))}
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
              {carregando ? "Salvando..." : "Salvar quadra"}
            </button>
          </div>

          {mensagem && <p className="form-message">{mensagem}</p>}
          {erro && <p className="form-message form-message--error">{erro}</p>}
        </form>
      </div>
    </div>
  );
}

export default GestorQuadrasPage;
