// src/pages/gestor/GestorQuadraEditarPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./quadra-edit.css";

export default function GestorQuadraEditarPage() {
  const { quadraId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tipo: "",
    material: "",
    modalidade: "",
    aviso: "",
    informacoes: "",
    status: "ativa",
  });

  // URLs atuais (vindas do Supabase)
  const [foto1Url, setFoto1Url] = useState(null);
  const [foto2Url, setFoto2Url] = useState(null);
  const [foto3Url, setFoto3Url] = useState(null);

  // Arquivos novos escolhidos na tela
  const [foto1File, setFoto1File] = useState(null);
  const [foto2File, setFoto2File] = useState(null);
  const [foto3File, setFoto3File] = useState(null);

  // loading por slot de foto
  const [fotoLoading, setFotoLoading] = useState({
    1: false,
    2: false,
    3: false,
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ------- Helpers para normalizar o que vem do banco -------
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
    if (
      m === "sintetico" ||
      m === "sintético" ||
      m === "sintetica" ||
      m === "sintética"
    )
      return "Sintético";
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
    if (m === "volei de quadra" || m === "vôlei de quadra")
      return "Vôlei de quadra";
    if (m === "volei de praia" || m === "vôlei de praia")
      return "Vôlei de praia";
    if (m === "beach tennis" || m === "beach tenis") return "Beach tennis";
    if (m === "futvolei" || m === "futvôlei") return "Futvôlei";
    if (m === "tenis" || m === "tênis") return "Tênis";
    if (m === "padel" || m === "pádel") return "Pádel";
    if (m === "basquete") return "Basquete";
    if (m === "handebol") return "Handebol";

    return mod;
  }

  // -------- Carrega dados da quadra (texto + 3 fotos) --------
  useEffect(() => {
    async function carregarQuadra() {
      try {
        setCarregando(true);
        setErro("");

        const resp = await api.get("/gestor/quadras");
        const lista = Array.isArray(resp.data) ? resp.data : [];

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
  }, [quadraId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFotoChange(slot, file) {
    if (!file) return;
    const preview = URL.createObjectURL(file);

    if (slot === 1) {
      setFoto1File(file);
      setFoto1Url(preview);
    } else if (slot === 2) {
      setFoto2File(file);
      setFoto2Url(preview);
    } else if (slot === 3) {
      setFoto3File(file);
      setFoto3Url(preview);
    }
  }

  // ------ Remover foto específica (slot 1/2/3) ------
  async function handleRemoverFoto(slot) {
    const confirmado = window.confirm(
      "Tem certeza que deseja remover esta foto?"
    );
    if (!confirmado) return;

    try {
      setErro("");
      setSucesso("");
      setFotoLoading((prev) => ({ ...prev, [slot]: true }));

      const resp = await api.delete(
        `/gestor/quadras/${quadraId}/foto/${slot}`
      );

      // Atualiza o estado de acordo com o que o backend devolveu
      if (resp?.data) {
        setFoto1Url(resp.data.url_imagem_header || null);
        setFoto2Url(resp.data.url_imagem_2 || null);
        setFoto3Url(resp.data.url_imagem_3 || null);

        if (slot === 1 || slot === "1") setFoto1File(null);
        if (slot === 2 || slot === "2") setFoto2File(null);
        if (slot === 3 || slot === "3") setFoto3File(null);
      }

      setSucesso("Foto removida com sucesso.");
    } catch (e) {
      console.error("Erro ao remover foto:", e);
      const msgBackend = e.response?.data?.error;
      setErro(msgBackend || "Erro ao remover foto da quadra.");
    } finally {
      setFotoLoading((prev) => ({ ...prev, [slot]: false }));
    }
  }

  // ------ Salvar (texto + possíveis novas fotos) ------
  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      // 1) Atualiza texto
      const payload = {
        tipo: form.tipo,
        material: form.material,
        modalidade: form.modalidade,
        aviso: form.aviso,
        informacoes: form.informacoes,
        status: form.status,
      };

      await api.put(`/gestor/quadras/${quadraId}`, payload);

      // 2) Se tiver novas fotos, manda para rota de fotos
      if (foto1File || foto2File || foto3File) {
        const formData = new FormData();

        if (foto1File) formData.append("foto1", foto1File);
        if (foto2File) formData.append("foto2", foto2File);
        if (foto3File) formData.append("foto3", foto3File);

        const respFotos = await api.put(
          `/gestor/quadras/${quadraId}/fotos`,
          formData
        );

        if (respFotos?.data) {
          setFoto1Url(respFotos.data.url_imagem_header || null);
          setFoto2Url(respFotos.data.url_imagem_2 || null);
          setFoto3Url(respFotos.data.url_imagem_3 || null);
        }
      }

      setSucesso("Quadra atualizada com sucesso!");

      setTimeout(() => {
        navigate("/gestor/quadras");
      }, 1000);
    } catch (e) {
      console.error("Erro ao atualizar quadra:", e);
      const msgBackend = e.response?.data?.error;
      setErro(msgBackend || "Erro ao atualizar quadra.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="quadra-edit-loading">Carregando dados da quadra...</p>;
  }

  if (erro) {
    return (
      <div className="quadra-edit-wrapper">
        <div className="quadra-edit-card">
          <p className="quadra-edit-error">{erro}</p>
          <button
            type="button"
            className="quadra-edit-btn-secondary"
            onClick={() => navigate("/gestor/quadras")}
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quadra-edit-wrapper">
      <div className="quadra-edit-card">
        <div className="quadra-edit-header">
          <h1>Editar Quadra</h1>
          <button
            type="button"
            className="quadra-edit-btn-secondary"
            onClick={() => navigate("/gestor/quadras")}
          >
            Voltar
          </button>
        </div>

        {sucesso && <p className="quadra-edit-success">{sucesso}</p>}
        {erro && <p className="quadra-edit-error">{erro}</p>}

        <form onSubmit={handleSubmit} className="quadra-edit-form">
          {/* COLUNA ESQUERDA: CAMPOS DE TEXTO */}
          <div className="quadra-edit-form-left">
            {/* TIPO */}
            <div className="quadra-edit-field">
              <label>Tipo</label>
              <select
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
            <div className="quadra-edit-field">
              <label>Material</label>
              <select
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
            <div className="quadra-edit-field">
              <label>Modalidade</label>
              <select
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

            {/* STATUS */}
            <div className="quadra-edit-field">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>

            {/* AVISO */}
            <div className="quadra-edit-field">
              <label>Aviso</label>
              <textarea
                name="aviso"
                value={form.aviso}
                onChange={handleChange}
                rows={3}
              />
              <small className="quadra-edit-help">
                Esse texto aparece como aviso importante no Flow.
              </small>
            </div>

            {/* INFORMAÇÕES */}
            <div className="quadra-edit-field">
              <label>Informações</label>
              <textarea
                name="informacoes"
                value={form.informacoes}
                onChange={handleChange}
                rows={4}
              />
              <small className="quadra-edit-help">
                Texto descritivo exibido nos detalhes da quadra.
              </small>
            </div>
          </div>

          {/* COLUNA DIREITA: FOTOS */}
          <div className="quadra-edit-form-right">
            <h2>Fotos da Quadra</h2>

            {/* FOTO 1 */}
            <div className="quadra-edit-photo-block">
              <div className="quadra-edit-photo-header">
                <span>Foto principal</span>
                {foto1Url && (
                  <span className="quadra-edit-badge">Card principal</span>
                )}
              </div>

              {foto1Url ? (
                <img
                  src={foto1Url}
                  alt="Foto 1"
                  className="quadra-edit-photo"
                />
              ) : (
                <div className="quadra-edit-photo-placeholder">
                  Sem foto principal
                </div>
              )}

              <div className="quadra-edit-photo-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFotoChange(1, e.target.files?.[0] || null)
                  }
                />
                {foto1Url && (
                  <button
                    type="button"
                    className="quadra-edit-btn-danger"
                    onClick={() => handleRemoverFoto(1)}
                    disabled={fotoLoading[1]}
                  >
                    {fotoLoading[1] ? "Removendo..." : "Remover foto"}
                  </button>
                )}
              </div>
            </div>

            {/* FOTO 2 */}
            <div className="quadra-edit-photo-block">
              <div className="quadra-edit-photo-header">
                <span>Foto 2</span>
              </div>

              {foto2Url ? (
                <img
                  src={foto2Url}
                  alt="Foto 2"
                  className="quadra-edit-photo"
                />
              ) : (
                <div className="quadra-edit-photo-placeholder">
                  Sem foto cadastrada
                </div>
              )}

              <div className="quadra-edit-photo-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFotoChange(2, e.target.files?.[0] || null)
                  }
                />
                {foto2Url && (
                  <button
                    type="button"
                    className="quadra-edit-btn-danger"
                    onClick={() => handleRemoverFoto(2)}
                    disabled={fotoLoading[2]}
                  >
                    {fotoLoading[2] ? "Removendo..." : "Remover foto"}
                  </button>
                )}
              </div>
            </div>

            {/* FOTO 3 */}
            <div className="quadra-edit-photo-block">
              <div className="quadra-edit-photo-header">
                <span>Foto 3</span>
              </div>

              {foto3Url ? (
                <img
                  src={foto3Url}
                  alt="Foto 3"
                  className="quadra-edit-photo"
                />
              ) : (
                <div className="quadra-edit-photo-placeholder">
                  Sem foto cadastrada
                </div>
              )}

              <div className="quadra-edit-photo-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFotoChange(3, e.target.files?.[0] || null)
                  }
                />
                {foto3Url && (
                  <button
                    type="button"
                    className="quadra-edit-btn-danger"
                    onClick={() => handleRemoverFoto(3)}
                    disabled={fotoLoading[3]}
                  >
                    {fotoLoading[3] ? "Removendo..." : "Remover foto"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="quadra-edit-footer">
          <button
            type="button"
            className="quadra-edit-btn-secondary"
            onClick={() => navigate("/gestor/quadras")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="quadra-edit-btn-primary"
            onClick={handleSubmit}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
