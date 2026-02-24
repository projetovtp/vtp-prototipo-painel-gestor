import React, { useState } from "react";

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(yyyyMmDd) {
  if (!yyyyMmDd) return "—";
  const s = String(yyyyMmDd).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

export default function GestorRelatoriosPage() {
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Mock de dados para ilustração
  const dadosRelatorio = {
    totalReservas: 145,
    totalReceita: 21750.00,
    reservasCanceladas: 8,
    taxaOcupacao: 68,
    reservasPorDia: [
      { dia: "Seg", reservas: 12 },
      { dia: "Ter", reservas: 15 },
      { dia: "Qua", reservas: 18 },
      { dia: "Qui", reservas: 20 },
      { dia: "Sex", reservas: 25 },
      { dia: "Sáb", reservas: 30 },
      { dia: "Dom", reservas: 25 }
    ],
    topQuadras: [
      { nome: "Quadra 1", reservas: 45, receita: 6750.00 },
      { nome: "Quadra 2", reservas: 38, receita: 5700.00 },
      { nome: "Quadra 3", reservas: 35, receita: 5250.00 },
      { nome: "Quadra 4", reservas: 27, receita: 4050.00 }
    ]
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>Relatórios</h1>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginTop: 0, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#111827" }}>Filtros</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div className="form-field">
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>
              Período
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
                backgroundColor: "#fff"
              }}
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {periodo === "custom" && (
            <>
              <div className="form-field">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none"
                  }}
                />
              </div>
              <div className="form-field">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    outline: "none"
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ marginTop: 0, padding: "20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total de Reservas</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#37648c" }}>
            {dadosRelatorio.totalReservas}
          </div>
        </div>
        <div className="card" style={{ marginTop: 0, padding: "20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total Receita</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#37648c" }}>
            {formatBRL(dadosRelatorio.totalReceita)}
          </div>
        </div>
        <div className="card" style={{ marginTop: 0, padding: "20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Reservas Canceladas</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ef4444" }}>
            {dadosRelatorio.reservasCanceladas}
          </div>
        </div>
        <div className="card" style={{ marginTop: 0, padding: "20px" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Taxa de Ocupação</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#37648c" }}>
            {dadosRelatorio.taxaOcupacao}%
          </div>
        </div>
      </div>

      {/* Gráfico de reservas por dia */}
      <div className="card" style={{ marginTop: 0, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
          Reservas por Dia da Semana
        </h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
          {dadosRelatorio.reservasPorDia.map((item, index) => {
            const altura = (item.reservas / 30) * 100;
            return (
              <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${altura}%`,
                    backgroundColor: "#37648c",
                    borderRadius: "4px 4px 0 0",
                    minHeight: 20,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: 4,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {item.reservas}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  {item.dia}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top quadras */}
      <div className="card" style={{ marginTop: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
          Quadras Mais Utilizadas
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dadosRelatorio.topQuadras.map((quadra, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb"
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  {quadra.nome}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {quadra.reservas} reservas
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#37648c" }}>
                  {formatBRL(quadra.receita)}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Receita total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
