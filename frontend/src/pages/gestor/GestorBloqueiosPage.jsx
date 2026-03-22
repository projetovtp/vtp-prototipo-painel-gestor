import { useGestorBloqueiosPage } from "../../hooks/useGestorBloqueiosPage";
import { ErrorMessage } from "../../components/ui";
import { CalendarioNav } from "../../components/ui/CalendarioNav";
import { formatarNomeQuadra } from "../../utils/formatters";
import { DIAS_SEMANA_ABREVIADOS, MESES } from "../../utils/constants";
import PainelHorariosBloqueio from "./PainelHorariosBloqueio";

const GestorBloqueiosPage = () => {
  const {
    quadras,
    carregando,
    erro,
    mensagem,
    quadraSelecionadaId,
    setQuadraSelecionadaId,
    mesBloqueio,
    setMesBloqueio,
    dataBloqueioSelecionada,
    setDataBloqueioSelecionada,
    horariosBloqueio,
    setHorariosBloqueio,
    toggleHorarioBloqueio,
    bloquearTodasQuadras,
    setBloquearTodasQuadras,
    quantidadeQuadrasBloquear,
    setQuantidadeQuadrasBloquear,
    salvandoBloqueio,
    removendoBloqueio,
    isOperando,
    handleBloquear,
    handleDesbloquear,
    setErro,
    diasDoMes,
    horariosBloqueados,
    diaEstaBloqueado,
    totalQuadrasNoGrupo,
    temMultiplasQuadras,
  } = useGestorBloqueiosPage();

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Bloqueio de Horários</h1>
      </div>

      {mensagem && <div className="rh-success-msg">{mensagem}</div>}

      <ErrorMessage mensagem={erro} onDismiss={() => setErro(null)} />

      <div className="card" style={{ marginTop: 0 }}>
        {/* Seleção de Quadra */}
        <div className="rh-separator">
          <label
            style={{
              display: "block",
              fontSize: "var(--font-base)",
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 8,
            }}
          >
            Quadra
          </label>
          {carregando && quadras.length === 0 ? (
            <div className="rh-loading-box">Carregando quadras...</div>
          ) : (
            <select
              className="rh-quadra-select"
              value={quadraSelecionadaId}
              onChange={(e) => setQuadraSelecionadaId(e.target.value)}
            >
              <option value="">Selecione uma quadra</option>
              {quadras.map((quadra) => (
                <option key={quadra.id} value={quadra.id}>
                  {formatarNomeQuadra(quadra)}
                </option>
              ))}
            </select>
          )}
        </div>

        {!quadraSelecionadaId && (
          <div className="rh-empty">
            Selecione uma quadra para configurar os bloqueios
          </div>
        )}

        {quadraSelecionadaId && (
          <>
            <p
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: 20,
              }}
            >
              Selecione uma data no calendário e os horários que deseja bloquear
              ou desbloquear.
            </p>

            {/* Calendário */}
            <CalendarioNav
              labelMes={`${MESES[mesBloqueio.getMonth()]} ${mesBloqueio.getFullYear()}`}
              onMesAnterior={() => {
                const novoMes = new Date(mesBloqueio);
                novoMes.setMonth(novoMes.getMonth() - 1);
                setMesBloqueio(novoMes);
              }}
              onProximoMes={() => {
                const novoMes = new Date(mesBloqueio);
                novoMes.setMonth(novoMes.getMonth() + 1);
                setMesBloqueio(novoMes);
              }}
            />

            <div className="rh-calendar-grid">
              {DIAS_SEMANA_ABREVIADOS.map((dia) => (
                <div key={dia} className="rh-calendar-day-header">
                  {dia}
                </div>
              ))}
              {diasDoMes.map((dia, index) => {
                if (!dia) return <div key={`empty-${index}`} />;

                const isSelecionado = dataBloqueioSelecionada === dia.data;
                const isBloqueado = dia.bloqueado;

                let cls = "rh-calendar-day";
                if (isSelecionado) cls += " rh-calendar-day--selected";
                else if (isBloqueado) cls += " rh-calendar-day--blocked";

                return (
                  <button
                    key={dia.dia}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setDataBloqueioSelecionada(dia.data);
                      setHorariosBloqueio([]);
                    }}
                  >
                    {dia.dia}
                  </button>
                );
              })}
            </div>

            {/* Seleção de Horários */}
            {dataBloqueioSelecionada && (
              <PainelHorariosBloqueio
                dataBloqueioSelecionada={dataBloqueioSelecionada}
                horariosBloqueio={horariosBloqueio}
                horariosBloqueados={horariosBloqueados}
                toggleHorarioBloqueio={toggleHorarioBloqueio}
                diaEstaBloqueado={diaEstaBloqueado}
                temMultiplasQuadras={temMultiplasQuadras}
                totalQuadrasNoGrupo={totalQuadrasNoGrupo}
                bloquearTodasQuadras={bloquearTodasQuadras}
                setBloquearTodasQuadras={setBloquearTodasQuadras}
                quantidadeQuadrasBloquear={quantidadeQuadrasBloquear}
                setQuantidadeQuadrasBloquear={setQuantidadeQuadrasBloquear}
                salvandoBloqueio={salvandoBloqueio}
                removendoBloqueio={removendoBloqueio}
                isOperando={isOperando}
                handleBloquear={handleBloquear}
                handleDesbloquear={handleDesbloquear}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestorBloqueiosPage;
