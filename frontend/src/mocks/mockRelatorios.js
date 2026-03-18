// TODO: remover quando gestorRelatoriosApi estiver disponível

/**
 * Retorna os dados de relatório por período.
 * @param {"hoje"|"semana"|"mes"|"custom"} periodo
 * @param {Date} [hoje]
 */
export function gerarMockRelatorios(periodo, hoje = new Date()) {
  const seed = hoje.getFullYear() * 365 + hoje.getMonth() * 30 + hoje.getDate();

  const reservasPorHoraHoje = (() => {
    const horarios = [];
    for (let h = 8; h <= 22; h++) {
      horarios.push({
        hora: String(h).padStart(2, "0") + ":00",
        reservas: ((seed * 31 + h) * 17) % 6,
      });
    }
    return horarios;
  })();

  return {
    totalReservas:      periodo === "hoje" ? 8  : periodo === "semana" ? 45  : periodo === "mes" ? 145  : 200,
    totalReceita:       periodo === "hoje" ? 1200 : periodo === "semana" ? 6750 : periodo === "mes" ? 21750 : 30000,
    reservasCanceladas: periodo === "hoje" ? 1  : periodo === "semana" ? 3   : periodo === "mes" ? 8    : 12,
    taxaOcupacao:       periodo === "hoje" ? 45 : periodo === "semana" ? 58  : periodo === "mes" ? 68   : 72,
    reservasPorDia: periodo === "hoje" ? [] : [
      { dia: "Seg", reservas: 12 },
      { dia: "Ter", reservas: 15 },
      { dia: "Qua", reservas: 18 },
      { dia: "Qui", reservas: 20 },
      { dia: "Sex", reservas: 25 },
      { dia: "Sáb", reservas: 30 },
      { dia: "Dom", reservas: 25 },
    ],
    reservasPorHora: periodo === "hoje" ? reservasPorHoraHoje : [],
    topQuadras: [
      { nome: "Quadra 1", reservas: periodo === "hoje" ? 3 : periodo === "semana" ? 12 : 45, receita: periodo === "hoje" ? 450  : periodo === "semana" ? 1800 : 6750 },
      { nome: "Quadra 2", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 10 : 38, receita: periodo === "hoje" ? 300  : periodo === "semana" ? 1500 : 5700 },
      { nome: "Quadra 3", reservas: periodo === "hoje" ? 2 : periodo === "semana" ? 9  : 35, receita: periodo === "hoje" ? 300  : periodo === "semana" ? 1350 : 5250 },
      { nome: "Quadra 4", reservas: periodo === "hoje" ? 1 : periodo === "semana" ? 5  : 27, receita: periodo === "hoje" ? 150  : periodo === "semana" ? 750  : 4050 },
    ],
  };
}

/**
 * Gera o número de reservas por dia do mês usando uma seed determinística.
 * @param {number} ano
 * @param {number} mes  (0-based)
 */
export function gerarMockReservasPorDiaDoMes(ano, mes) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const reservasPorDia = {};
  const seed = ano * 12 + mes;
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    reservasPorDia[data] = ((seed * 31 + dia) * 17) % 9;
  }
  return reservasPorDia;
}
