import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useGestorReservas } from "../../hooks/api";
import { ErrorMessage, ConfirmacaoModal } from "../../components/ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarMoeda,
  formatarDataBR,
  formatarHoraStr,
  formatarCPF,
  formatarTelefone,
} from "../../utils/formatters";

const DetalhesReservaModalDashboard = ({ aberto, onFechar, reserva, onCancelado, onCriada }) => {
  const containerRef = useFocusTrap(aberto, onFechar);
  const { criar, cancelar, loading } = useGestorReservas();
  const [erro, setErro] = useState("");
  const [modoNova, setModoNova] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [itemParaConfirmar, setItemParaConfirmar] = useState(null);

  const listaReservas = reserva?.todasReservas || [];
  const isNovaReserva = reserva && !reserva.id && listaReservas.length === 0;
  const mostrarFormulario = isNovaReserva || modoNova;
  const slotInfo = reserva?.slotInfo;
  const infoSlot = isNovaReserva ? reserva : slotInfo;

  useEffect(() => {
    if (aberto) {
      setModoNova(false);
      setNome("");
      setCpf("");
      setPhone("");
      setValor(isNovaReserva ? String(reserva?.preco_hora || "") : "");
      setErro("");
    }
  }, [aberto]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!aberto || !reserva) return null;

  const nomeQuadra = infoSlot?.quadra
    ? `${infoSlot.quadra.tipo || "Quadra"}${infoSlot.quadra.modalidade ? ` - ${infoSlot.quadra.modalidade}` : ""}`
    : "Quadra";

  const solicitarCancelamento = (item) => {
    const nomeQ = item.quadra
      ? `${item.quadra.tipo || "Quadra"}${item.quadra.modalidade ? ` - ${item.quadra.modalidade}` : ""}`
      : "Quadra";
    setItemParaConfirmar({
      id: item.id,
      tipoQuadra: nomeQ,
      data: item.data,
      hora: item.hora,
      valor: item.preco_total || 0,
    });
    setConfirmacaoAberta(true);
  };

  const executarCancelamento = async () => {
    if (!itemParaConfirmar) return;
    setConfirmacaoAberta(false);
    try {
      setErro("");
      await cancelar(itemParaConfirmar.id);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao cancelar reserva.");
    } finally {
      setItemParaConfirmar(null);
    }
  };

  const handleCriarReserva = async () => {
    const info = isNovaReserva ? reserva : slotInfo;
    if (!cpf || !nome) {
      setErro("Informe pelo menos CPF e nome do cliente.");
      return;
    }
    try {
      setErro("");
      const body = { quadraId: info.quadra_id, data: info.data, hora: info.hora, nome, cpf, phone };
      if (valor !== "") body.valor = Number(valor);
      await criar(body);
      if (onCriada) onCriada();
      onFechar();
    } catch (error) {
      console.error("[CRIAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao criar reserva.");
    }
  };

  const titulo = mostrarFormulario
    ? "Nova Reserva"
    : `Reservas do horário (${listaReservas.length})`;

  return (
    <>
      <div className="dash-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalhes-dashboard-modal-titulo"
          tabIndex="-1"
          className="dash-modal dash-modal--md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dash-modal-header">
            <div className="dash-modal-header-left">
              {modoNova && (
                <button type="button" className="dash-modal-back" aria-label="Voltar" onClick={() => setModoNova(false)}>←</button>
              )}
              <h3 id="detalhes-dashboard-modal-titulo" className="dash-modal-title">{titulo}</h3>
            </div>
            <button type="button" onClick={onFechar} className="dash-modal-close" aria-label="Fechar modal">×</button>
          </div>

          <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

          {mostrarFormulario ? (
            <div className="dash-fields">
              <div className="dash-nova-reserva-info">
                <div>
                  <div className="dash-field-label">Quadra</div>
                  <div className="dash-field-value">{nomeQuadra}</div>
                </div>
                <div>
                  <div className="dash-field-label">Data e Horário</div>
                  <div className="dash-field-value">{formatarDataBR(infoSlot?.data)} às {infoSlot?.hora}</div>
                </div>
              </div>
              <div>
                <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Nome do Cliente *</label>
                <input type="text" className="dash-form-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>CPF *</label>
                <input type="text" className="dash-form-input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Telefone</label>
                <input type="text" className="dash-form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="dash-field-label" style={{ marginBottom: 6, display: "block" }}>Valor</label>
                <input type="number" className="dash-form-input" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" step="0.01" />
              </div>
            </div>
          ) : (
            <div className="dash-fields" style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {listaReservas.map((item, idx) => (
                <div key={item.id || idx} className="dash-reserva-card">
                  <div className="dash-reserva-card-header">
                    <h4 className="dash-reserva-card-title">Reserva {idx + 1}</h4>
                    <span className={`dash-status-tag ${item.pago_via_pix ? "dash-status-tag--reservado" : "dash-status-tag--pendente"}`}>
                      {item.pago_via_pix ? "Pago" : "Pendente"}
                    </span>
                  </div>
                  <div className="dash-fields">
                    <div>
                      <div className="dash-field-label">Quadra</div>
                      <div className="dash-field-value">
                        {item.quadra ? `${item.quadra.tipo || "Quadra"}${item.quadra.modalidade ? ` - ${item.quadra.modalidade}` : ""}` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="dash-field-label">Data e Horário</div>
                      <div className="dash-field-value">{formatarDataBR(item.data)} às {formatarHoraStr(item.hora)}</div>
                    </div>
                    {(item.nome || item.usuario_nome) && (
                      <div>
                        <div className="dash-field-label">Cliente</div>
                        <div className="dash-field-value">{item.nome || item.usuario_nome}</div>
                      </div>
                    )}
                    {item.user_cpf && (
                      <div>
                        <div className="dash-field-label">CPF</div>
                        <div className="dash-field-value">{formatarCPF(item.user_cpf)}</div>
                      </div>
                    )}
                    {item.phone && (
                      <div>
                        <div className="dash-field-label">Telefone</div>
                        <div className="dash-field-value">{formatarTelefone(item.phone)}</div>
                      </div>
                    )}
                    <div>
                      <div className="dash-field-label">Valor</div>
                      <div className="dash-field-value dash-field-value--lg">{formatarMoeda(item.preco_total || 0)}</div>
                    </div>
                    <button
                      type="button"
                      className="dash-btn--cancel-sm"
                      onClick={() => solicitarCancelamento(item)}
                      disabled={loading}
                    >
                      {loading ? "Cancelando..." : "Cancelar Reserva"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dash-modal-actions">
            <button type="button" className="dash-btn dash-btn--secondary" onClick={onFechar}>Fechar</button>
            {mostrarFormulario ? (
              <button type="button" className="dash-btn dash-btn--primary" onClick={handleCriarReserva} disabled={loading}>
                {loading ? "Salvando..." : "Criar Reserva"}
              </button>
            ) : (
              <button type="button" className="dash-btn dash-btn--primary" onClick={() => {
                setModoNova(true);
                setValor(String(slotInfo?.preco_hora || ""));
              }}>
                + Adicionar Reserva
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        reserva={itemParaConfirmar}
        onFechar={() => { setConfirmacaoAberta(false); setItemParaConfirmar(null); }}
        onConfirmar={executarCancelamento}
      />
    </>
  );
};

const reservaShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.string,
  hora: PropTypes.string,
  quadra: PropTypes.object,
  quadra_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nome: PropTypes.string,
  usuario_nome: PropTypes.string,
  user_cpf: PropTypes.string,
  phone: PropTypes.string,
  pago_via_pix: PropTypes.bool,
  preco_total: PropTypes.number,
  preco_hora: PropTypes.number,
  todasReservas: PropTypes.array,
  slotInfo: PropTypes.object,
});

DetalhesReservaModalDashboard.propTypes = {
  aberto: PropTypes.bool.isRequired,
  onFechar: PropTypes.func.isRequired,
  reserva: reservaShape,
  onCancelado: PropTypes.func,
  onCriada: PropTypes.func,
};

export default DetalhesReservaModalDashboard;
