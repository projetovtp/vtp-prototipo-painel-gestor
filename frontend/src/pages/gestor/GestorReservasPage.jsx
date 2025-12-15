import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const formatarDataBR = (isoDate) => {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
};
const diasEntre = (inicioISO, fimISO) => {
  if (!inicioISO || !fimISO) return null;
  const inicio = new Date(`${inicioISO}T12:00:00`);
  const fim = new Date(`${fimISO}T12:00:00`);
  const diffMs = fim.getTime() - inicio.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const validarIntervalo60Dias = (inicioISO, fimISO) => {
  // retorna { ok: true } ou { ok:false, msg:"..." }
  if (!inicioISO || !fimISO) return { ok: true };

  const d = diasEntre(inicioISO, fimISO);
  if (d == null) return { ok: true };

  if (d < 0) {
    return { ok: false, msg: "A data fim não pode ser menor que a data início." };
  }
  if (d > 60) {
    return { ok: false, msg: "O intervalo máximo permitido é de 60 dias." };
  }
  return { ok: true };
};

// ==================================
// MODAL: CRIAR RESERVA (DESIGN CLEAN)
// ==================================
const CriarReservaModal = ({ aberto, onFechar, slot, quadraId, onCriado }) => {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (slot) {
      setValor(slot.preco_hora != null ? String(slot.preco_hora) : "");
      setErro("");
      setNome("");
      setCpf("");
      setPhone("");
    }
  }, [slot, aberto]);

  if (!aberto || !slot) return null;

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      setErro("");

      if (!cpf || !nome) {
        setErro("Informe pelo menos CPF e nome do cliente.");
        setSalvando(false);
        return;
      }

      const body = {
        quadraId,
        data: slot.data,
        hora: slot.hora_inicio,
        nome,
        cpf,
        phone,
      };

      if (valor !== "") {
        body.valor = Number(valor);
      }

      await api.post("/gestor/reservas", body);

      if (onCriado) onCriado();
      onFechar();
    } catch (error) {
      console.error("[MODAL CRIAR] Erro:", error);
      const msg =
        error?.response?.data?.error || "Erro ao criar reserva. Tente novamente.";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal fade show" style={styles.overlay}>
      <div className="modal-dialog" style={styles.dialog}>
        <div className="modal-content" style={styles.content}>
          
          {/* --- HEADER --- */}
          <div style={styles.header}>
            <div>
              <h5 style={styles.title}>Nova Reserva</h5>
              <div style={styles.subtitle}>
                 {/* Exibindo data e hora de forma elegante */}
                 {formatarDataBR(slot.data)} • <span style={{color: "#10b981", fontWeight: "700"}}>{slot.hora_inicio}</span> às {slot.hora_fim}
              </div>
            </div>
            <button 
                type="button" 
                onClick={onFechar}
                style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.5rem",
                    color: "#9ca3af",
                    cursor: "pointer",
                    padding: "0 8px"
                }}
            >
                &times;
            </button>
          </div>

          {/* --- BODY --- */}
          <div style={styles.body}>
            {erro && (
              <div className="alert alert-danger mb-3" style={{ borderRadius: "12px", fontSize: "0.9rem", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c" }}>
                {erro}
              </div>
            )}

            {/* Aviso estilo "Card" sutil */}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#0c4a6e",
                backgroundColor: "#f0f9ff", // Azul bem clarinho
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #bae6fd",
                marginBottom: "24px",
                lineHeight: "1.5"
              }}
            >
              <strong>Nota:</strong> Reservas manuais (criadas pelo painel) <u>não geram repasse</u> automático. Apenas reservas via WhatsApp/PIX entram no fluxo financeiro.
            </div>

            {/* FORMULÁRIO */}
            <div className="row g-3">
              
              {/* SEÇÃO: CLIENTE */}
              <div className="col-12">
                <div style={styles.sectionTitle}>
                    <span style={styles.sectionBar}></span>
                    Dados do Cliente
                </div>
              </div>
              
              <div className="col-12">
                <label style={styles.label}>Nome Completo</label>
                <input
                  type="text"
                  style={styles.input}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="col-md-6">
                <label style={styles.label}>CPF</label>
                <input
                  type="text"
                  style={styles.input}
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Somente números"
                />
              </div>
              <div className="col-md-6">
                <label style={styles.label}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* SEÇÃO: FINANCEIRO */}
              <div className="col-12">
                <div style={styles.sectionTitle}>
                    <span style={styles.sectionBar}></span>
                    Financeiro
                </div>
              </div>
              <div className="col-12">
                <label style={styles.label}>Valor da Reserva (R$)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
                <small className="text-muted mt-2 d-block" style={{fontSize: "0.75rem"}}>
                  Se deixar vazio ou zerado, o sistema registrará como cortesia/gratuito.
                </small>
              </div>

            </div>
          </div>

          {/* --- FOOTER --- */}
          <div style={styles.footer}>
            <button
              type="button"
              style={{...styles.btnBase, ...styles.btnSecondary}}
              onClick={onFechar}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="button"
              style={{...styles.btnBase, ...styles.btnPrimary}}
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Confirmar Reserva"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==================================
// MODAL: EDITAR / CANCELAR RESERVA
// ==================================
// ============================================================================
// ESTILOS VISUAIS (ATUALIZADO - MAIS MODERNO)
// ============================================================================
const styles = {
  overlay: {
    display: "block",
    // MUDANÇA: Cor mais suave (azul escuro transparente) e efeito de DESFOQUE (Blur)
    backgroundColor: "rgba(15, 23, 42, 0.4)", 
    backdropFilter: "blur(8px)", // Isso cria o efeito de "vidro" no fundo
    zIndex: 1050,
    position: "fixed", // Garante que cubra a tela toda
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflowX: "hidden",
    overflowY: "auto",
  },
  dialog: {
    maxWidth: "600px",
    margin: "1.75rem auto", // Centraliza melhor verticalmente
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: "relative",
    pointerEvents: "none", // Necessário para o modal bootstrap
  },
  content: {
    borderRadius: "20px", // Bordas mais arredondadas (estilo iOS)
    border: "1px solid rgba(255,255,255,0.8)", // Borda sutil
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    pointerEvents: "auto",
  },
  header: {
    padding: "24px 32px 16px 32px", // Espaçamento maior
    borderBottom: "none", // Removi a linha cinza do cabeçalho para limpar
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: "800", // Mais negrito
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#6b7280",
    marginTop: "4px",
    fontWeight: "500",
  },
  body: {
    padding: "0 32px 32px 32px", // Alinhado com o header
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#9ca3af", // Cinza mais claro para o título não brigar com o input
    marginBottom: "8px",
    marginTop: "24px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  // Barra verde decorativa ao lado do título
  sectionBar: {
    width: "4px",
    height: "16px",
    backgroundColor: "#10b981",
    borderRadius: "2px",
    display: "inline-block",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
    fontSize: "0.9rem",
    display: "block", // Garante que o label fique em cima
  },
  input: {
    height: "50px", // Ainda maior para toque
    borderRadius: "12px", // Mais arredondado
    border: "1px solid #e5e7eb",
    fontSize: "1rem",
    paddingLeft: "16px",
    width: "100%",
    color: "#1f2937",
    backgroundColor: "#f9fafb", // Fundo do input levemente cinza para contraste com o branco
    outline: "none",
    transition: "all 0.2s",
  },
  footer: {
    padding: "24px 32px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    backgroundColor: "#fff", // Fundo branco puro
  },
  // BOTÕES
  btnBase: {
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.1s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
  btnPrimary: {
    backgroundColor: "#10b981", 
    color: "#ffffff",
    boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)", // Sombra verde suave
  },
  btnDanger: {
    backgroundColor: "#fee2e2",
    color: "#ef4444",
  },
  // ESTILO PARA A BARRA DE STATUS (CORRIGIDO)
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#fff", // Fundo Branco
    borderRadius: "12px",
    marginBottom: "10px",
    border: "2px solid #f3f4f6", // Borda sutil em vez de fundo cinza
  },
  statusItem: {
    display: "flex",
    flexDirection: "column", // ISSO GARANTE QUE O TÍTULO FIQUE EM CIMA DO VALOR
    gap: "4px", // Espaço entre o título e o valor
  },
  statusLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block", // Força bloco
  },
  statusValue: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#334155",
    display: "block", // Força bloco
  }
};

// ==================================
// MODAL: EDITAR / CANCELAR RESERVA 
// ==================================
const EditarReservaModal = ({
  aberto,
  onFechar,
  reservaId,
  onAtualizado,
  onCancelado,
}) => {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState(null);

  const [quadraId, setQuadraId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [origem, setOrigem] = useState("");
  const [quadraNome, setQuadraNome] = useState("");

  useEffect(() => {
    const carregar = async () => {
      if (!aberto || !reservaId) return;
      try {
        setCarregando(true);
        setErro("");

        const resp = await api.get(`/gestor/reservas/${reservaId}`);
        const payload = resp.data || {};
        const reserva = payload.reserva || payload || {};
        const quadra = payload.quadra || {};

        setDados(reserva);
        setQuadraId(reserva.quadra_id || "");
        setData(reserva.data || "");
        
        const horaBruta = reserva.hora || "";
        setHora(horaBruta.length >= 5 ? horaBruta.slice(0, 5) : horaBruta);
        
        setCpf(reserva.user_cpf || "");
        setPhone(reserva.phone || "");
        setValor(reserva.preco_total != null ? String(reserva.preco_total) : "");
        setOrigem(
          reserva.origem
            ? reserva.origem
            : reserva.pago_via_pix
            ? "whatsapp"
            : "painel"
        );
        setQuadraNome(
          quadra.nome_dinamico ||
            quadra.nome ||
            `${quadra.tipo || "Quadra"} ${
              quadra.modalidade ? `- ${quadra.modalidade}` : ""
            }`
        );
      } catch (error) {
        console.error("Erro ao carregar:", error);
        setErro("Erro ao carregar detalhes.");
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [aberto, reservaId]);

  if (!aberto || !reservaId) return null;

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      setErro("");
      const body = { quadraId, data, hora, cpf, phone };
      if (valor !== "") body.valor = Number(valor);

      await api.put(`/gestor/reservas/${reservaId}`, body);
      if (onAtualizado) onAtualizado();
      onFechar();
    } catch (error) {
      const msg = error?.response?.data?.error || "Erro ao salvar alterações.";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelarReserva = async () => {
    if (!window.confirm("ATENÇÃO: Deseja realmente CANCELAR esta reserva?")) return;
    try {
      setCancelando(true);
      setErro("");
      await api.delete(`/gestor/reservas/${reservaId}`);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
      setErro("Erro ao cancelar reserva.");
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="modal fade show" style={styles.overlay}>
      <div className="modal-dialog" style={styles.dialog}>
        <div className="modal-content" style={styles.content}>
          
          {/* --- CABEÇALHO --- */}
          <div style={styles.header}>
            <div>
              <h5 style={styles.title}>Gerenciar Reserva</h5>
              {quadraNome && <div style={styles.subtitle}>{quadraNome}</div>}
            </div>
            {/* Botão X Fechar */}
            <button 
                type="button" 
                onClick={onFechar}
                style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.5rem",
                    color: "#9ca3af",
                    cursor: "pointer"
                }}
            >
                &times;
            </button>
          </div>

          {/* --- CORPO --- */}
          <div style={styles.body}>
            {carregando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Buscando dados...</p>
              </div>
            ) : (
              <>
                {erro && <div className="alert alert-danger">{erro}</div>}

                {/* --- BARRA DE STATUS CORRIGIDA (SEM FUNDO CINZA) --- */}
                <div style={styles.statusBar}>
                   {/* Item 1: Origem */}
                   <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Origem</span>
                      <span style={styles.statusValue}>
                        {origem === "whatsapp" ? "WhatsApp / PIX" : "Manual / Painel"}
                      </span>
                   </div>
                   
                   {/* Item 2: Status */}
                   <div style={{...styles.statusItem, alignItems: "flex-end"}}>
                      <span style={styles.statusLabel}>Status</span>
                      <span style={{...styles.statusValue, color: "#0ea5e9"}}>
                        {dados?.status?.toUpperCase()}
                      </span>
                   </div>
                </div>

                <div className="row g-3">
                  {/* DATA E HORA */}
                  <div className="col-12">
                    <div style={styles.sectionTitle}>
                        <span style={styles.sectionBar}></span>
                        Data e Horário
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={styles.label}>Data do Jogo</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={styles.label}>Horário</label>
                    <input
                      type="time"
                      style={styles.input}
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                    />
                  </div>

                  {/* CLIENTE */}
                  <div className="col-12">
                    <div style={styles.sectionTitle}>
                        <span style={styles.sectionBar}></span>
                        Dados do Cliente
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label style={styles.label}>CPF</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={styles.label}>Telefone / WhatsApp</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* FINANCEIRO */}
                  <div className="col-12">
                    <div style={styles.sectionTitle}>
                        <span style={styles.sectionBar}></span>
                        Financeiro
                    </div>
                  </div>
                  <div className="col-12">
                     <label style={styles.label}>Valor da Reserva (R$)</label>
                     <input
                        type="number"
                        style={styles.input}
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                     />
                     <small className="text-muted mt-2 d-block" style={{fontSize: "0.75rem"}}>
                       O valor alterado será salvo apenas nesta reserva.
                     </small>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* --- RODAPÉ --- */}
          <div style={styles.footer}>
             {!carregando && (
                <button
                  type="button"
                  style={{...styles.btnBase, ...styles.btnDanger, marginRight: "auto"}}
                  onClick={handleCancelarReserva}
                  disabled={salvando || cancelando}
                >
                  {cancelando ? "Cancelando..." : "Cancelar"}
                </button>
             )}

             <button
                type="button"
                style={{...styles.btnBase, ...styles.btnSecondary}}
                onClick={onFechar}
                disabled={salvando || cancelando}
             >
                Fechar
             </button>

             <button
                type="button"
                style={{...styles.btnBase, ...styles.btnPrimary}}
                onClick={handleSalvar}
                disabled={salvando || cancelando}
             >
                {salvando ? "Salvando..." : "Salvar Alterações"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const GestorReservasPage = () => {
  const [empresas, setEmpresas] = useState([]);
  const [quadras, setQuadras] = useState([]);

  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [quadraSelecionada, setQuadraSelecionada] = useState("");

  const [grade, setGrade] = useState([]);
  const [carregandoGrade, setCarregandoGrade] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagemInfo, setMensagemInfo] = useState("");

  const [periodo, setPeriodo] = useState("padrao");
  const [dataBaseSemana, setDataBaseSemana] = useState("");
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");

  // Estados dos modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [reservaIdSelecionada, setReservaIdSelecionada] = useState(null);

  // carregar empresas/quadras
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        setErro("");

        const [respEmpresas, respQuadras] = await Promise.all([
          api.get("/gestor/empresas"),
          api.get("/gestor/quadras"),
        ]);

        const dadosEmpresas = Array.isArray(respEmpresas.data)
          ? respEmpresas.data
          : respEmpresas.data?.empresas || [];

        const dadosQuadras = Array.isArray(respQuadras.data)
          ? respQuadras.data
          : respQuadras.data?.quadras || [];

        setEmpresas(dadosEmpresas);
        setQuadras(dadosQuadras);

        if (!dadosEmpresas.length) {
          setMensagemInfo(
            "Nenhuma empresa/complexo encontrada para este gestor. Verifique o cadastro."
          );
        }
      } catch (error) {
        console.error("[GESTOR/RESERVAS] Erro ao carregar empresas/quadras:", error);
        setErro(
          "Erro ao carregar empresas e quadras do gestor. Tente novamente mais tarde."
        );
      }
    };

    carregarDadosIniciais();
  }, []);

  const quadrasFiltradas = useMemo(() => {
    if (!empresaSelecionada) return [];
    return quadras.filter(
      (q) => String(q.empresa_id) === String(empresaSelecionada)
    );
  }, [quadras, empresaSelecionada]);

  const montarIntervaloDatas = (periodoOverride, datasOverride = {}) => {
    const periodoUsar = periodoOverride || periodo;

    const baseSemana =
      datasOverride.dataBaseSemana !== undefined
        ? datasOverride.dataBaseSemana
        : dataBaseSemana;

    const inicioCustom =
      datasOverride.dataInicioCustom !== undefined
        ? datasOverride.dataInicioCustom
        : dataInicioCustom;

    const fimCustom =
      datasOverride.dataFimCustom !== undefined
        ? datasOverride.dataFimCustom
        : dataFimCustom;

    let dataInicioParam;
    let dataFimParam;

    if (periodoUsar === "padrao") {
      return { dataInicioParam: undefined, dataFimParam: undefined };
    }

    if (periodoUsar === "semana") {
      if (!baseSemana) {
        return { dataInicioParam: undefined, dataFimParam: undefined };
      }

      const base = new Date(`${baseSemana}T12:00:00`);
      const inicio = new Date(base.getTime());
      const fim = new Date(base.getTime());
      fim.setDate(fim.getDate() + 6);

      dataInicioParam = inicio.toISOString().slice(0, 10);
      dataFimParam = fim.toISOString().slice(0, 10);
      return { dataInicioParam, dataFimParam };
    }

    if (periodoUsar === "intervalo") {
      if (!inicioCustom || !fimCustom) {
        return { dataInicioParam: undefined, dataFimParam: undefined };
      }

      dataInicioParam = inicioCustom;
      dataFimParam = fimCustom;
      return { dataInicioParam, dataFimParam };
    }

    return { dataInicioParam: undefined, dataFimParam: undefined };
  };

  const carregarGrade = async (
    quadraId,
    periodoOverride,
    datasOverride = {}
  ) => {
    try {
      if (!quadraId) return;

      setCarregandoGrade(true);
      setErro("");
      setMensagemInfo("");

      const { dataInicioParam, dataFimParam } = montarIntervaloDatas(
        periodoOverride,
        datasOverride
      );

      const resp = await api.get("/gestor/reservas/grade", {
        params: {
          quadraId,
          ...(dataInicioParam ? { dataInicio: dataInicioParam } : {}),
          ...(dataFimParam ? { dataFim: dataFimParam } : {}),
        },
      });

      const dadosGrade = Array.isArray(resp.data?.grade)
        ? resp.data.grade
        : [];

      if (!dadosGrade.length) {
        setMensagemInfo("Nenhum horário configurado para esta quadra.");
      }

      setGrade(dadosGrade);
    } catch (error) {
      console.error("[GESTOR/RESERVAS] Erro ao carregar grade:", error);
      const msgBackend =
        error?.response?.data?.error ||
        "Erro ao carregar a agenda desta quadra. Verifique se a agenda foi configurada.";
      setErro(msgBackend);
      setGrade([]);
    } finally {
      setCarregandoGrade(false);
    }
  };

  const handleChangeEmpresa = (e) => {
    const novoId = e.target.value;
    setEmpresaSelecionada(novoId);
    setQuadraSelecionada("");
    setGrade([]);
    setMensagemInfo("");
    setErro("");
  };

  const handleChangeQuadra = (e) => {
    const novaQuadraId = e.target.value;
    setQuadraSelecionada(novaQuadraId);
    setGrade([]);
    setMensagemInfo("");
    setErro("");

    if (novaQuadraId) {
      carregarGrade(novaQuadraId);
    }
  };

  const handleChangePeriodo = (e) => {
    const novoPeriodo = e.target.value;
    setPeriodo(novoPeriodo);
    setMensagemInfo("");
    setErro("");

    if (quadraSelecionada) {
      carregarGrade(quadraSelecionada, novoPeriodo, {});
    }
  };

  const handleChangeDataBaseSemana = (e) => {
    const novaData = e.target.value;
    setDataBaseSemana(novaData);
    setMensagemInfo("");
    setErro("");

    if (quadraSelecionada && periodo === "semana" && novaData) {
      carregarGrade(quadraSelecionada, "semana", {
        dataBaseSemana: novaData,
      });
    }
  };

  const handleChangeDataInicioCustom = (e) => {
  const novaData = e.target.value;
  setDataInicioCustom(novaData);
  setMensagemInfo("");
  setErro("");

  // validação (se já existe fim preenchido)
  if (periodo === "intervalo" && novaData && dataFimCustom) {
    const v = validarIntervalo60Dias(novaData, dataFimCustom);
    if (!v.ok) {
      setErro(v.msg);
      setGrade([]);
      return;
    }
    if (quadraSelecionada) {
      carregarGrade(quadraSelecionada, "intervalo", {
        dataInicioCustom: novaData,
        dataFimCustom,
      });
    }
  }
};

const handleChangeDataFimCustom = (e) => {
  const novaData = e.target.value;
  setDataFimCustom(novaData);
  setMensagemInfo("");
  setErro("");

  if (periodo === "intervalo" && dataInicioCustom && novaData) {
    const v = validarIntervalo60Dias(dataInicioCustom, novaData);
    if (!v.ok) {
      setErro(v.msg);
      setGrade([]);
      return;
    }
    if (quadraSelecionada) {
      carregarGrade(quadraSelecionada, "intervalo", {
        dataInicioCustom,
        dataFimCustom: novaData,
      });
    }
  }
};


  const abrirModalCriar = (dia, slot) => {
    setSlotSelecionado({
      data: dia.data,
      dia_semana: dia.dia_semana,
      hora_inicio: slot.hora_inicio,
      hora_fim: slot.hora_fim,
      preco_hora: slot.preco_hora,
    });
    setModalCriarAberto(true);
  };

  const abrirModalEditar = (slot) => {
    if (!slot.reserva || !slot.reserva.id) {
      console.warn(
        "[GESTOR/RESERVAS] Slot reservado sem id de reserva vinculado."
      );
      return;
    }
    setReservaIdSelecionada(slot.reserva.id);
    setModalEditarAberto(true);
  };

     // ----------------------------------------
  // RENDERIZAÇÃO DA GRADE ESTILO CINEMA
  // ----------------------------------------
  const renderCinema = () => {
    if (!quadraSelecionada) {
      return (
        <p className="text-muted mt-3">
          Selecione um complexo e uma quadra para visualizar a agenda.
        </p>
      );
    }

    if (carregandoGrade) {
      return <p className="mt-3">Carregando horários...</p>;
    }

    if (erro) {
      return (
        <p className="mt-3 text-danger" style={{ fontWeight: 600 }}>
          {erro}
        </p>
      );
    }

    if (mensagemInfo) {
      return (
        <p className="mt-3 text-muted" style={{ fontStyle: "italic" }}>
          {mensagemInfo}
        </p>
      );
    }

    if (!grade || !grade.length) {
      return null;
    }

    // Normaliza o status enviado pelo backend ('disponivel' | 'reservado' | 'bloqueado')
    const normalizarStatus = (slot) => {
      const raw = (slot.status || "").toString().toLowerCase().trim();

      if (raw === "reservado" || raw === "reservada") return "reservado";
      if (raw === "bloqueado" || raw === "bloqueada") return "bloqueado";

      return "disponivel";
    };

    // Identifica origem da reserva (Painel x WhatsApp)
    const obterOrigemSlot = (slot) => {
      const origem = (slot?.reserva?.origem || "").toString().toLowerCase().trim();

      if (origem === "whatsapp") return "W";
      if (origem === "painel") return "P";

      if (slot?.reserva?.pago_via_pix) return "W";
      return "P";
    };

    // Cor do slot conforme status
    const getCorSlot = (slot) => {
      const statusNorm = normalizarStatus(slot);

      if (statusNorm === "disponivel") return "#198754"; // verde
      if (statusNorm === "reservado") return "#dc3545";  // vermelho
      if (statusNorm === "bloqueado") return "#6c757d";  // cinza

      return "#6c757d";
    };

    return (
      <div className="mt-4">
        <h5 className="mb-3">Agenda estilo cinema</h5>

        <div
          style={{
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            padding: "16px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {grade.map((dia) => (
            <div key={dia.data} className="mb-4">
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "8px",
                  fontSize: "0.95rem",
                }}
              >
                {formatarDataBR(dia.data)}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {dia.slots && dia.slots.length ? (
                  dia.slots.map((slot) => {
                    const statusNorm = normalizarStatus(slot);

                    return (
                      <div
                        key={`${dia.data}-${slot.hora_inicio}`}
                        style={{
                          minWidth: "80px",
                          textAlign: "center",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          backgroundColor: getCorSlot(slot),
                          color: "#fff",
                          fontSize: "0.85rem",
                          cursor:
                            statusNorm === "bloqueado"
                              ? "not-allowed"
                              : "pointer",
                          opacity: statusNorm === "bloqueado" ? 0.7 : 1,
                        }}
                        onClick={() => {
                          if (statusNorm === "bloqueado") return;
                          if (statusNorm === "disponivel") {
                            abrirModalCriar(dia, slot);
                          } else if (statusNorm === "reservado") {
                            abrirModalEditar(slot);
                          }
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {slot.hora_inicio} - {slot.hora_fim}
                        </div>

                        <div
                          style={{
                            fontSize: "0.7rem",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>
                            {statusNorm === "disponivel" && "Disponível"}
                            {statusNorm === "reservado" && "Reservada"}
                            {statusNorm === "bloqueado" && "Bloqueada"}
                          </span>

                          {statusNorm === "reservado" && (
                            <span
                              title={
                                obterOrigemSlot(slot) === "W"
                                  ? "Reserva via WhatsApp / PIX"
                                  : "Reserva criada pelo Painel"
                              }
                              style={{
                                fontSize: "0.65rem",
                                padding: "1px 6px",
                                borderRadius: "999px",
                                backgroundColor: "rgba(255,255,255,0.25)",
                                border: "1px solid rgba(255,255,255,0.35)",
                              }}
                            >
                              {obterOrigemSlot(slot)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-muted">
                    Nenhum horário configurado para este dia.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h4 style={{ marginBottom: "8px" }}>Editar Agenda / Reservas</h4>
        <p
          style={{
            marginBottom: "20px",
            color: "#6c757d",
            fontSize: "0.9rem",
          }}
        >
          Escolha primeiro o complexo e, em seguida, a quadra para visualizar a
          agenda em formato cinema. Os horários são montados a partir da Agenda
          (regras de horário) e dos Bloqueios.
        </p>

        {erro && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              backgroundColor: "#ffe5e5",
              color: "#b00020",
              fontSize: "0.85rem",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            {erro}
          </div>
        )}

        <div className="mb-3">
          <label
            htmlFor="select-periodo"
            className="form-label"
            style={{ fontWeight: 600 }}
          >
            Período
          </label>
          <select
            id="select-periodo"
            className="form-select"
            value={periodo}
            onChange={handleChangePeriodo}
          >
            <option value="padrao">Hoje + 6 dias (padrão)</option>
            <option value="semana">Semana (7 dias a partir da data)</option>
            <option value="intervalo">Intervalo personalizado</option>
          </select>
        </div>

        {periodo === "semana" && (
          <div className="mb-3">
            <label
              htmlFor="data-base-semana"
              className="form-label"
              style={{ fontWeight: 600 }}
            >
              Data base da semana
            </label>
            <input
              id="data-base-semana"
              type="date"
              className="form-control"
              value={dataBaseSemana}
              onChange={handleChangeDataBaseSemana}
            />
          </div>
        )}

        {periodo === "intervalo" && (
          <div className="mb-3 d-flex" style={{ gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="data-inicio-custom"
                className="form-label"
                style={{ fontWeight: 600 }}
              >
                Data início
              </label>
              <input
                id="data-inicio-custom"
                type="date"
                className="form-control"
                value={dataInicioCustom}
                onChange={handleChangeDataInicioCustom}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="data-fim-custom"
                className="form-label"
                style={{ fontWeight: 600 }}
              >
                Data fim
              </label>
              <input
                id="data-fim-custom"
                type="date"
                className="form-control"
                value={dataFimCustom}
                onChange={handleChangeDataFimCustom}
              />
            </div>
          </div>
        )}

        {/* FILTROS COMPLEXO + QUADRA LADO A LADO */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "24px",
            marginTop: "8px",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              htmlFor="select-empresa"
              className="form-label"
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                display: "block",
              }}
            >
              Complexo / Empresa
            </label>
            <select
              id="select-empresa"
              className="form-select"
              value={empresaSelecionada}
              onChange={handleChangeEmpresa}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Selecione o complexo...</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome || emp.nome_fantasia || "Sem nome"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label
              htmlFor="select-quadra"
              className="form-label"
              style={{
                fontWeight: 600,
                marginBottom: "8px",
                display: "block",
              }}
            >
              Quadra
            </label>
            <select
              id="select-quadra"
              className="form-select"
              value={quadraSelecionada}
              onChange={handleChangeQuadra}
              disabled={!empresaSelecionada}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">
                {empresaSelecionada
                  ? "Selecione a quadra..."
                  : "Selecione primeiro o complexo"}
              </option>
              {quadrasFiltradas.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nome || `${q.tipo} - ${q.modalidade || ""}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {renderCinema()}
      </div>

      {/* MODAIS */}
      <CriarReservaModal
        aberto={modalCriarAberto}
        onFechar={() => setModalCriarAberto(false)}
        slot={slotSelecionado}
        quadraId={quadraSelecionada}
        onCriado={() => {
          if (quadraSelecionada) {
            carregarGrade(quadraSelecionada);
          }
        }}
      />

      <EditarReservaModal
        aberto={modalEditarAberto}
        onFechar={() => setModalEditarAberto(false)}
        reservaId={reservaIdSelecionada}
        onAtualizado={() => {
          if (quadraSelecionada) {
            carregarGrade(quadraSelecionada);
          }
        }}
        onCancelado={() => {
          if (quadraSelecionada) {
            carregarGrade(quadraSelecionada);
          }
        }}
      />
    </div>
  );
};

export default GestorReservasPage;
