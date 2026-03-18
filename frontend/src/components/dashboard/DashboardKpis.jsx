import React from "react";
import { formatarMoeda } from "../../utils/formatters";

const DashboardKpis = ({ kpis }) => (
  <>
    <div className="card dash-kpi">
      <div className="dash-kpi-label">Reservas para hoje</div>
      <div className="dash-kpi-value">{kpis?.reservasHoje ?? 0}</div>
    </div>

    <div className="card dash-kpi">
      <div className="dash-kpi-label">Total Recebido Hoje</div>
      <div className="dash-kpi-value">{formatarMoeda(kpis?.pixHoje ?? 0)}</div>
    </div>

    <div className="card dash-kpi">
      <div className="dash-kpi-label">Taxa de ocupação das quadras</div>
      <div className="dash-kpi-value">{kpis?.taxaOcupacao ?? 0}%</div>
    </div>
  </>
);

export default DashboardKpis;
