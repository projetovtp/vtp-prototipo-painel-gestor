// src/pages/admin/AdminDashboardPage.jsx
import { useEffect, useMemo } from "react"
import { useAdminDashboard } from "../../hooks/api"
import { ErrorMessage } from "../../components/ui"
import {
  formatarMoeda as formatBRL,
  formatarNumero as formatInt,
  formatarDataBR as formatDateBR,
} from "../../utils/formatters"
import { statusLabelReserva } from "../../utils/status"
import "./admin.css"

const getMesAtualRange = () => {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const pad = (n) => String(n).padStart(2, "0")
  const toISODate = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
  return { from: toISODate(inicio), to: toISODate(hoje) }
}

const KPI = ({ title, value, hint }) => (
  <div className="card kpi-card">
    <div className="kpi-label">{title}</div>
    <div className="kpi-valor">{value}</div>
    {hint ? <div className="kpi-hint">{hint}</div> : null}
  </div>
)

const AdminDashboardPage = () => {
  const { overview, financeiroOverview, loading, erro, obterOverview, obterFinanceiroOverview } = useAdminDashboard()

  const carregar = async () => {
    try {
      const { from, to } = getMesAtualRange()
      await Promise.all([
        obterOverview({ from, to }),
        obterFinanceiroOverview({ from, to }),
      ])
    } catch {}
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kpis = overview?.kpis || {}
  const finKpis = financeiroOverview?.kpis || {}
  const ultimasReservas = overview?.ultimas_reservas || []
  const vendasPorQuadra = overview?.vendas_por_quadra || []
  const reservasPorQuadraStatus = overview?.reservas_por_quadra_status || []
  const quadrasSemRegras = overview?.quadras_sem_regras || []
  const utilizacao = overview?.utilizacao_canal || {}

  const origemResumo = useMemo(() => {
    const criadas = Array.isArray(utilizacao?.reservas_criadas)
      ? utilizacao.reservas_criadas.reduce((a, b) => a + Number(b || 0), 0)
      : 0
    const pagas = Array.isArray(utilizacao?.reservas_pagas)
      ? utilizacao.reservas_pagas.reduce((a, b) => a + Number(b || 0), 0)
      : 0
    const dias = Array.isArray(utilizacao?.labels) ? utilizacao.labels.length : 0
    return { criadas, pagas, dias }
  }, [utilizacao])

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Dashboard (Admin)</h1>
          <p className="page-subtitle">
            Visão geral do sistema: reservas, faturamento, repasses e diagnósticos.
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={carregar} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <ErrorMessage mensagem={erro} />

      {/* KPIs mês atual */}
      <div className="dash-grid-4">
        <KPI title="Faturamento bruto (mês)" value={formatBRL(kpis?.receita_bruta)} hint="Somente reservas pagas no período." />
        <KPI title="Reservas pagas (mês)" value={formatInt(kpis?.reservas_pagas)} hint="Pagas no mês." />
        <KPI title="Reservas pendentes (mês)" value={formatInt(kpis?.reservas_pendentes)} hint="Aguardando pagamento." />
        <KPI title="Reservas canceladas (mês)" value={formatInt(kpis?.reservas_canceladas)} hint="Canceladas no mês." />
      </div>

      {/* Financeiro / Repasses */}
      <div className="dash-grid-3">
        <KPI title="Taxa da plataforma (mês)" value={formatBRL(finKpis?.taxa_plataforma)} hint="Quanto o sistema reteve (Admin)." />
        <KPI title="Repasses aos gestores (mês)" value={formatBRL(finKpis?.valor_liquido)} hint="Valor líquido estimado aos complexos (receita - taxa)." />
        <KPI title="PIX pendentes (mês)" value={formatInt(kpis?.reservas_pendentes)} hint="Reservas pendentes no período." />
      </div>

      {/* Série de reservas */}
      <div className="card card-mt">
        <h3>Reservas no período</h3>
        <p className="section-hint">Resumo do mês atual (criações vs. pagas).</p>

        <div className="dash-grid-3-inline">
          <div className="mini-card">
            <div className="mini-card-label">Dias analisados</div>
            <div className="mini-card-valor">{formatInt(origemResumo.dias)}</div>
          </div>
          <div className="mini-card">
            <div className="mini-card-label">Reservas criadas</div>
            <div className="mini-card-valor">{formatInt(origemResumo.criadas)}</div>
          </div>
          <div className="mini-card">
            <div className="mini-card-label">Reservas pagas</div>
            <div className="mini-card-valor">{formatInt(origemResumo.pagas)}</div>
          </div>
        </div>
      </div>

      {/* Top quadras + Diagnósticos */}
      <div className="dash-grid-2">
        <div className="card">
          <h3>Top quadras por faturamento</h3>
          <p className="section-hint">Mostra onde o dinheiro está concentrado (somente pagas).</p>

          {vendasPorQuadra.length === 0 ? (
            <p className="card-mt">Sem dados.</p>
          ) : (
            <div className="tabela-wrapper">
              <table className="tabela-simples" style={{ minWidth: 650 }}>
                <thead>
                  <tr>
                    <th>Quadra</th>
                    <th className="col-num">Reservas pagas</th>
                    <th className="col-num">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasPorQuadra.slice(0, 12).map((q) => (
                    <tr key={q.quadra_id}>
                      <td className="col-bold">{q.quadra_nome}</td>
                      <td className="col-num">{formatInt(q.reservas_pagas)}</td>
                      <td className="col-num">{formatBRL(q.receita_bruta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Diagnósticos do sistema</h3>
          <p className="section-hint">O que costuma "travar venda" ou gerar agenda vazia.</p>

          <div className="dash-grid-1 card-mt">
            <div className="diag-row">
              <div className="diag-row-label">Quadras sem regras de horários</div>
              <div>{formatInt(quadrasSemRegras.length)}</div>
            </div>
            <div className="diag-row">
              <div className="diag-row-label">Pendências por quadra (Top)</div>
              <div>{formatInt(reservasPorQuadraStatus.length)}</div>
            </div>
          </div>

          {reservasPorQuadraStatus.length > 0 && (
            <div className="card-mt">
              <div className="section-subtitle">Top pendências</div>
              <div className="dash-grid-1">
                {reservasPorQuadraStatus.slice(0, 6).map((q) => (
                  <div key={q.quadra_id} className="diag-card">
                    <div className="diag-card-nome">{q.quadra_nome}</div>
                    <div className="diag-card-detalhe">
                      Pendentes: <strong>{formatInt(q.pending)}</strong> | Pagas: {formatInt(q.paid)} | Canceladas: {formatInt(q.canceled)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quadrasSemRegras.length > 0 && (
            <div className="card-mt">
              <div className="section-subtitle">Exemplos (sem regra)</div>
              <div className="dash-grid-1">
                {quadrasSemRegras.slice(0, 6).map((q) => (
                  <div key={q.quadra_id} className="diag-card">
                    <div className="diag-card-nome">{q.quadra_nome}</div>
                    <div className="diag-card-detalhe">
                      status: {String(q.status ?? "—")} | ativo: {String(q.ativo ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reservas por quadra */}
      <div className="card card-mt">
        <h3>Reservas por quadra (status)</h3>
        <p className="section-hint">Top 30 quadras com mais pendências (para atacar rápido).</p>

        {reservasPorQuadraStatus.length === 0 ? (
          <p className="card-mt">Sem dados (ou backend ainda não enviou esse campo).</p>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela-simples" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Quadra</th>
                  <th className="col-num">Total</th>
                  <th className="col-num">Pagas</th>
                  <th className="col-num">Pendentes</th>
                  <th className="col-num">Canceladas</th>
                  <th className="col-num">Receita paga</th>
                </tr>
              </thead>
              <tbody>
                {reservasPorQuadraStatus.map((q) => (
                  <tr key={q.quadra_id}>
                    <td className="col-bold">{q.quadra_nome}</td>
                    <td className="col-num">{formatInt(q.total)}</td>
                    <td className="col-num">{formatInt(q.paid)}</td>
                    <td className="col-num col-heavy">{formatInt(q.pending)}</td>
                    <td className="col-num">{formatInt(q.canceled)}</td>
                    <td className="col-num">{formatBRL(q.receita_paga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimas reservas */}
      <div className="card card-mt">
        <h3>Últimas reservas</h3>
        {ultimasReservas.length === 0 ? (
          <p className="card-mt">Sem reservas recentes.</p>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela-simples" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th className="col-num">Data</th>
                  <th className="col-num">Hora</th>
                  <th className="col-num">Status</th>
                  <th className="col-num">Origem</th>
                  <th>Quadra</th>
                  <th className="col-num">Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimasReservas.map((r) => (
                  <tr key={r.id}>
                    <td className="col-num">{formatDateBR(r.data)}</td>
                    <td className="col-num">{r.hora || "—"}</td>
                    <td className="col-num col-heavy">{statusLabelReserva(r.status)}</td>
                    <td className="col-num">{r.origem || "—"}</td>
                    <td>{r.quadra_nome || r.quadra_id || "—"}</td>
                    <td className="col-num">{formatBRL(r.preco_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
