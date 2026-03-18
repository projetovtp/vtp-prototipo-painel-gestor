import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGestorQuadras } from "../../hooks/api";
import { LoadingSpinner, ErrorMessage, ConfirmacaoModal } from "../../components/ui";

const GestorQuadraEditarPage = () => {
  const { quadraId } = useParams();
  const navigate = useNavigate();
  const {
    listar: listarQuadras,
    editar: editarQuadra,
    atualizarFotos,
    removerFoto,
  } = useGestorQuadras();

  const [form, setForm] = useState({
    tipo: "",
    material: "",
    modalidade: "",
    aviso: "",
    informacoes: "",
    status: "ativa",
  });

  const [foto1Url, setFoto1Url] = useState(null);
  const [foto2Url, setFoto2Url] = useState(null);
  const [foto3Url, setFoto3Url] = useState(null);

  const [foto1File, setFoto1File] = useState(null);
  const [foto2File, setFoto2File] = useState(null);
  const [foto3File, setFoto3File] = useState(null);

  const [fotoLoading, setFotoLoading] = useState({ 1: false, 2: false, 3: false });
  const [confirmacaoRemoverFotoAberta, setConfirmacaoRemoverFotoAberta] = useState(false);
  const [slotParaRemover, setSlotParaRemover] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [sucesso, setSucesso] = useState("");

  function normalizarTipo(tipo) {
    if (!tipo) return "";
    const t = String(tipo).toLowerCase().trim();
    if (t === "indoor") return "Indoor";
    if (t === "externa") return "Externa";
    if (t === "coberta") return "Coberta";
    return tipo;
  }

  function normalizarMaterial(material) {
    if (!material) return "";
    const m = String(material).toLowerCase().trim();
    if (m === "areia") return "Areia";
    if (m === "cimento") return "Cimento";
    if (m === "sintetico" || m === "sintético" || m === "sintetica" || m === "sintética") return "Sintético";
    if (m === "emborrachado") return "Emborrachado";
    if (m === "grama natural") return "Grama natural";
    return material;
  }

  function normalizarModalidade(mod) {
    if (!mod) return "";
    const m = String(mod).toLowerCase().trim();
    if (m === "futsal") return "Futsal";
    if (m === "society 5x5" || m === "society5x5") return "Society 5x5";
    if (m === "society 7x7" || m === "society7x7") return "Society 7x7";
    if (m === "futebol de campo") return "Futebol de campo";
    if (m === "volei de quadra" || m === "vôlei de quadra") return "Vôlei de quadra";
    if (m === "volei de praia" || m === "vôlei de praia") return "Vôlei de praia";
    if (m === "beach tennis" || m === "beach tenis") return "Beach tennis";
    if (m === "futvolei" || m === "futvôlei") return "Futvôlei";
    if (m === "tenis" || m === "tênis") return "Tênis";
    if (m === "padel" || m === "pádel") return "Pádel";
    if (m === "basquete") return "Basquete";
    if (m === "handebol") return "Handebol";
    return mod;
  }

  useEffect(() => {
    async function carregarQuadra() {
      try {
        setCarregando(true);
        setErro("");

        const data = await listarQuadras();
        const lista = Array.isArray(data) ? data : [];

        if (!lista.length) {
          setErro("Nenhuma quadra encontrada para este gestor.");
          setCarregando(false);
          return;
        }

        const q = lista.find((item) => item.id === quadraId);
        if (!q) {
          setErro("Quadra não encontrada para este gestor.");
          setCarregando(false);
          return;
        }

        setForm({
          tipo: normalizarTipo(q.tipo || ""),
          material: normalizarMaterial(q.material || ""),
          modalidade: normalizarModalidade(q.modalidade || ""),
          aviso: q.aviso || "",
          informacoes: q.informacoes || "",
          status: q.status || "ativa",
        });

        setFoto1Url(q.url_imagem_header || null);
        setFoto2Url(q.url_imagem_2 || null);
        setFoto3Url(q.url_imagem_3 || null);
      } catch (e) {
        console.error("Erro ao buscar quadra:", e);
        const msgBackend = e.response?.data?.error;
        setErro(msgBackend || "Erro ao buscar dados da quadra.");
      } finally {
        setCarregando(false);
      }
    }

    carregarQuadra();
  }, [quadraId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFotoChange(slot, file) {
    if (!file) return;
    const preview = URL.createObjectURL(file);

    if (slot === 1) { setFoto1File(file); setFoto1Url(preview); }
    else if (slot === 2) { setFoto2File(file); setFoto2Url(preview); }
    else if (slot === 3) { setFoto3File(file); setFoto3Url(preview); }
  }

  function pedirConfirmacaoRemoverFoto(slot) {
    setSlotParaRemover(slot);
    setConfirmacaoRemoverFotoAberta(true);
  }

  async function handleRemoverFoto(slot) {
    try {
      setErroForm("");
      setSucesso("");
      setFotoLoading((prev) => ({ ...prev, [slot]: true }));

      const data = await removerFoto(quadraId, slot);

      if (data) {
        setFoto1Url(data.url_imagem_header || null);
        setFoto2Url(data.url_imagem_2 || null);
        setFoto3Url(data.url_imagem_3 || null);

        if (slot === 1 || slot === "1") setFoto1File(null);
        if (slot === 2 || slot === "2") setFoto2File(null);
        if (slot === 3 || slot === "3") setFoto3File(null);
      }

      setSucesso("Foto removida com sucesso.");
    } catch (e) {
      console.error("Erro ao remover foto:", e);
      const msgBackend = e.response?.data?.error;
      setErroForm(msgBackend || "Erro ao remover foto da quadra.");
    } finally {
      setFotoLoading((prev) => ({ ...prev, [slot]: false }));
    }
  }

  async function handleConfirmarRemoverFoto() {
    if (slotParaRemover != null) {
      await handleRemoverFoto(slotParaRemover);
    }
    setConfirmacaoRemoverFotoAberta(false);
    setSlotParaRemover(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroForm("");
    setSucesso("");
    setSalvando(true);

    try {
      const payload = {
        tipo: form.tipo,
        material: form.material,
        modalidade: form.modalidade,
        aviso: form.aviso,
        informacoes: form.informacoes,
        status: form.status,
      };

      await editarQuadra(quadraId, payload);

      if (foto1File || foto2File || foto3File) {
        const formData = new FormData();
        if (foto1File) formData.append("foto1", foto1File);
        if (foto2File) formData.append("foto2", foto2File);
        if (foto3File) formData.append("foto3", foto3File);

        const fotosData = await atualizarFotos(quadraId, formData);

        if (fotosData) {
          setFoto1Url(fotosData.url_imagem_header || null);
          setFoto2Url(fotosData.url_imagem_2 || null);
          setFoto3Url(fotosData.url_imagem_3 || null);
        }
      }

      setSucesso("Quadra atualizada com sucesso!");
      setTimeout(() => navigate("/gestor/quadras"), 1000);
    } catch (e) {
      console.error("Erro ao atualizar quadra:", e);
      const msgBackend = e.response?.data?.error;
      setErroForm(msgBackend || "Erro ao atualizar quadra.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando dados da quadra..." fullPage />;
  }

  if (erro) {
    return (
      <div className="page">
        <div className="card">
          <ErrorMessage mensagem={erro} />
          <button
            type="button"
            className="btn-outlined"
            onClick={() => navigate("/gestor/quadras")}
            style={{ marginTop: 12 }}
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  const fotoSlots = [
    { slot: 1, label: "Foto principal", badge: "Card principal", url: foto1Url, file: foto1File },
    { slot: 2, label: "Foto 2", badge: null, url: foto2Url, file: foto2File },
    { slot: 3, label: "Foto 3", badge: null, url: foto3Url, file: foto3File },
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
          <h1 className="page-title">Editar Quadra</h1>
        </div>
      </div>

      {sucesso && (
        <div className="cfg-alert cfg-alert--success">{sucesso}</div>
      )}
      {erroForm && (
        <div className="cfg-alert cfg-alert--error">{erroForm}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="quadra-edit-layout">
          {/* Campos de texto */}
          <div className="quadra-edit-campos">
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="edit-tipo">Tipo *</label>
                <select id="edit-tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">Selecione um tipo</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Externa">Externa</option>
                  <option value="Coberta">Coberta</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="edit-material">Material *</label>
                <select id="edit-material" name="material" value={form.material} onChange={handleChange} required>
                  <option value="">Selecione um material</option>
                  <option value="Areia">Areia</option>
                  <option value="Cimento">Cimento</option>
                  <option value="Sintético">Sintético</option>
                  <option value="Emborrachado">Emborrachado</option>
                  <option value="Grama natural">Grama natural</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="edit-modalidade">Modalidade *</label>
                <select id="edit-modalidade" name="modalidade" value={form.modalidade} onChange={handleChange} required>
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

              <div className="form-field">
                <label htmlFor="edit-status">Status *</label>
                <select id="edit-status" name="status" value={form.status} onChange={handleChange} required>
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="edit-aviso">Aviso</label>
                <textarea
                  id="edit-aviso"
                  name="aviso"
                  value={form.aviso}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Texto que aparece como aviso importante no Flow."
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="edit-informacoes">Informações</label>
                <textarea
                  id="edit-informacoes"
                  name="informacoes"
                  value={form.informacoes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Texto descritivo exibido nos detalhes da quadra."
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="quadra-edit-fotos">
            <h3 className="quadra-edit-fotos-titulo">Fotos da Quadra</h3>

            {fotoSlots.map(({ slot, label, badge, url }) => (
              <div key={slot} className="quadra-edit-foto-bloco">
                <div className="quadra-edit-foto-header">
                  <span className="quadra-edit-foto-label">{label}</span>
                  {badge && url && (
                    <span className="quadra-edit-foto-badge">{badge}</span>
                  )}
                </div>

                {url ? (
                  <img src={url} alt={label} className="quadra-edit-foto-img" />
                ) : (
                  <label className="quadra-edit-foto-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Clique para enviar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFotoChange(slot, e.target.files?.[0] || null)}
                      hidden
                    />
                  </label>
                )}

                {url && (
                  <div className="quadra-edit-foto-acoes">
                    <label className="btn-outlined quadra-edit-foto-btn">
                      Trocar foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFotoChange(slot, e.target.files?.[0] || null)}
                        hidden
                      />
                    </label>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => pedirConfirmacaoRemoverFoto(slot)}
                      disabled={fotoLoading[slot]}
                    >
                      {fotoLoading[slot] ? "Removendo..." : "Remover"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Ações do formulário */}
          <div className="form-actions quadra-edit-form-actions">
            <button
              type="button"
              className="btn-outlined"
              onClick={() => navigate("/gestor/quadras")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmacaoModal
        aberto={confirmacaoRemoverFotoAberta}
        titulo="Remover foto"
        mensagem="Tem certeza que deseja remover esta foto?"
        onFechar={() => { setConfirmacaoRemoverFotoAberta(false); setSlotParaRemover(null); }}
        onConfirmar={handleConfirmarRemoverFoto}
        textoConfirmar="Remover"
      />
    </div>
  );
}

export default GestorQuadraEditarPage;
