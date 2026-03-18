import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useGestorReservas } from "../../hooks/api";
import { ErrorMessage, ConfirmacaoModal } from "../../components/ui";
import useFocusTrap from "../../hooks/useFocusTrap";
import {
  formatarDataBR,
  formatarMoeda,
  formatarCPF,
  formatarTelefone,
  formatarNomeQuadra,
} from "../../utils/formatters";

// ─── Sub-componentes internos ─────────────────────────────────────────────────

const CampoReserva = ({ label, children }) => (
  <div>
    <label className="rv-modal-field-label">{label}</label>
    <div className="rv-modal-field-value">{children}</div>
  </div>
);

CampoReserva.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const reservaShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.string,
  hora: PropTypes.string,
  quadra: PropTypes.object,
  quadra_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  usuario_nome: PropTypes.string,
  nome: PropTypes.string,
  user_cpf: PropTypes.string,
  phone: PropTypes.string,
  pago_via_pix: PropTypes.bool,
  preco_total: PropTypes.number,
  preco_hora: PropTypes.number,
  todasReservas: PropTypes.array,
});

const DadosCliente = ({ reserva }) => {
  const nome = reserva.usuario_nome || reserva.nome;
  return (
    <div>
      <label className="rv-modal-field-label">Dados do Cliente</label>
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {nome && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">Nome: </span>
            <span className="rv-client-row-value">{nome}</span>
          </div>
        )}
        {reserva.user_cpf && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">CPF: </span>
            <span className="rv-client-row-value">{formatarCPF(reserva.user_cpf)}</span>
          </div>
        )}
        {reserva.phone && (
          <div className="rv-client-row">
            <span className="rv-client-row-label">Telefone: </span>
            <span className="rv-client-row-value">{formatarTelefone(reserva.phone)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

DadosCliente.propTypes = { reserva: reservaShape.isRequired };

const ReservaCard = ({ reserva, index, onCancelar, cancelando }) => {
  const statusPg = reserva.pago_via_pix ? "Reservado" : "Pendente";
  const nomeQuadra = formatarNomeQuadra(reserva.quadra);

  return (
    <div className="rv-reserva-item">
      <div className="rv-reserva-item-header">
        <h4 className="rv-reserva-item-title">Reserva {index + 1}</h4>
        <span className={`rv-modal-status rv-modal-status--${statusPg === "Reservado" ? "reservado" : "pendente"}`}>
          {statusPg}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CampoReserva label="Quadra">{nomeQuadra}</CampoReserva>
        <CampoReserva label="Data e Horário">
          {formatarDataBR(reserva.data)} às {reserva.hora}
        </CampoReserva>
        <DadosCliente reserva={reserva} />
        <CampoReserva label="Valor">
          <span className="rv-modal-field-value--lg">
            {formatarMoeda(reserva.preco_total || 0)}
          </span>
        </CampoReserva>

        <button
          type="button"
          className="dash-btn--cancel-sm"
          onClick={() => onCancelar(reserva)}
          disabled={cancelando}
        >
          {cancelando ? "Cancelando..." : "Cancelar Reserva"}
        </button>
      </div>
    </div>
  );
};

ReservaCard.propTypes = {
  reserva: reservaShape.isRequired,
  index: PropTypes.number.isRequired,
  onCancelar: PropTypes.func.isRequired,
  cancelando: PropTypes.bool,
};

// ─── Modal de detalhes / criar reserva ───────────────────────────────────────

const DetalhesReservaModal = ({ aberto, onFechar, reserva, reservas, onCancelado, onCriada }) => {
  const containerRef = useFocusTrap(aberto, onFechar);
  const { cancelar: cancelarReserva, criar: criarReserva } = useGestorReservas();
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [valor, setValor] = useState("");
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [reservaParaConfirmacao, setReservaParaConfirmacao] = useState(null);

  const reservasDoSlot = reserva?.todasReservas || reservas || [];
  const listaReservas = reservasDoSlot.length > 0 ? reservasDoSlot : (reserva ? [reserva] : []);
  const reservaAtual = listaReservas[0] || reserva;
  const temMultiplasReservas = listaReservas.length > 1;
  const isNovaReserva = reservaAtual && !reservaAtual.id;

  useEffect(() => {
    if (aberto && isNovaReserva) {
      setValor(reservaAtual.preco_hora ? String(reservaAtual.preco_hora) : "");
      setNome("");
      setCpf("");
      setPhone("");
      setErro("");
    }
  }, [aberto, isNovaReserva, reservaAtual]);

  if (!aberto || !reservaAtual) return null;

  const solicitarCancelamento = (reservaItem) => {
    setReservaParaConfirmacao({
      id: reservaItem.id,
      tipoQuadra: formatarNomeQuadra(reservaItem.quadra),
      data: reservaItem.data,
      hora: reservaItem.hora,
      valor: reservaItem.preco_total || 0,
    });
    setConfirmacaoAberta(true);
  };

  const executarCancelamento = async () => {
    if (!reservaParaConfirmacao) return;
    setConfirmacaoAberta(false);
    try {
      setCancelando(true);
      setErro("");
      await cancelarReserva(reservaParaConfirmacao.id);
      if (onCancelado) onCancelado();
      onFechar();
    } catch (error) {
      console.error("[CANCELAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao cancelar reserva.");
    } finally {
      setCancelando(false);
      setReservaParaConfirmacao(null);
    }
  };

  const handleCriarReserva = async () => {
    try {
      setSalvando(true);
      setErro("");
      if (!cpf || !nome) {
        setErro("Informe pelo menos CPF e nome do cliente.");
        setSalvando(false);
        return;
      }
      const body = {
        quadraId: reservaAtual.quadra_id,
        data: reservaAtual.data,
        hora: reservaAtual.hora,
        nome,
        cpf,
        phone,
      };
      if (valor !== "") body.valor = Number(valor);
      await criarReserva(body);
      if (onCriada) onCriada();
      onFechar();
    } catch (error) {
      console.error("[CRIAR RESERVA] Erro:", error);
      setErro(error?.response?.data?.error || "Erro ao criar reserva.");
    } finally {
      setSalvando(false);
    }
  };

  const statusPagamento = reservaAtual.pago_via_pix ? "Reservado" : "Pendente";
  const nomeQuadra = formatarNomeQuadra(reservaAtual.quadra);

  const tituloModal = isNovaReserva
    ? "Nova Reserva"
    : temMultiplasReservas
      ? `Detalhe das reservas (${listaReservas.length})`
      : "Detalhes da Reserva";

  return (
    <>
      <div className="vt-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalhes-reserva-modal-titulo"
          tabIndex="-1"
          className="vt-modal"
          style={{ maxWidth: temMultiplasReservas ? 700 : 500 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="vt-modal-header">
            <h3 id="detalhes-reserva-modal-titulo" className="dash-modal-title">{tituloModal}</h3>
            <button type="button" className="vt-modal-close" aria-label="Fechar modal" onClick={onFechar}>×</button>
          </div>

          <div className="vt-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

            {temMultiplasReservas && !isNovaReserva ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
                {listaReservas.map((reservaItem, index) => (
                  <ReservaCard
                    key={reservaItem.id || index}
                    reserva={reservaItem}
                    index={index}
                    onCancelar={solicitarCancelamento}
                    cancelando={cancelando}
                  />
                ))}
              </div>
            ) : (
              <>
                <CampoReserva label="Quadra">{nomeQuadra}</CampoReserva>
                <CampoReserva label="Data e Horário">
                  {formatarDataBR(reservaAtual.data)} às {reservaAtual.hora}
                </CampoReserva>

                {!isNovaReserva ? (
                  <>
                    <DadosCliente reserva={reservaAtual} />
                    <div style={{ display: "flex", gap: 24 }}>
                      <div style={{ flex: 1 }}>
                        <CampoReserva label="Valor">
                          <span className="rv-modal-field-value--lg">
                            {formatarMoeda(reservaAtual.preco_total || 0)}
                          </span>
                        </CampoReserva>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="rv-modal-field-label">Status do Pagamento</label>
                        <div style={{ marginTop: 4 }}>
                          <span className={`rv-modal-status rv-modal-status--${statusPagamento === "Reservado" ? "reservado" : "pendente"}`}>
                            {statusPagamento}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-field">
                      <label>Nome do Cliente *</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="form-field">
                      <label>CPF *</label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="form-field">
                      <label>Telefone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="form-field">
                      <label>Valor</label>
                      <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="dash-modal-actions">
            <button type="button" className="dash-btn dash-btn--secondary" onClick={onFechar}>
              Fechar
            </button>
            {!isNovaReserva && !temMultiplasReservas && (
              <button
                type="button"
                className="dash-btn dash-btn--danger"
                onClick={() => solicitarCancelamento(reservaAtual)}
                disabled={cancelando}
              >
                {cancelando ? "Cancelando..." : "Cancelar Reserva"}
              </button>
            )}
            {isNovaReserva && (
              <button
                type="button"
                className="dash-btn dash-btn--primary"
                onClick={handleCriarReserva}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Criar Reserva"}
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmacaoModal
        aberto={confirmacaoAberta}
        reserva={reservaParaConfirmacao}
        onFechar={() => { setConfirmacaoAberta(false); setReservaParaConfirmacao(null); }}
        onConfirmar={executarCancelamento}
      />
    </>
  );
};

DetalhesReservaModal.propTypes = {
  aberto: PropTypes.bool.isRequired,
  onFechar: PropTypes.func.isRequired,
  reserva: reservaShape,
  reservas: PropTypes.arrayOf(reservaShape),
  onCancelado: PropTypes.func,
  onCriada: PropTypes.func,
};

export default DetalhesReservaModal;
