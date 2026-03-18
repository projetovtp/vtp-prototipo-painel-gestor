// TODO: remover quando gestorFinanceiroApi estiver disponível

export function gerarMockFinanceiro() {
  const hoje = new Date();
  const dia = (offset) => new Date(hoje.getTime() - offset * 86400000).toISOString();

  const mockPagamentos = [
    { id: 1,  created_at: dia(0),  valor_total: 250.0, taxa_plataforma: 25.0, status: "paid" },
    { id: 2,  created_at: dia(1),  valor_total: 180.0, taxa_plataforma: 18.0, status: "paid" },
    { id: 3,  created_at: dia(2),  valor_total: 320.0, taxa_plataforma: 32.0, status: "paid" },
    { id: 4,  created_at: dia(3),  valor_total: 200.0, taxa_plataforma: 20.0, status: "pending" },
    { id: 5,  created_at: dia(4),  valor_total: 150.0, taxa_plataforma: 15.0, status: "pending" },
    { id: 6,  created_at: dia(5),  valor_total: 280.0, taxa_plataforma: 28.0, status: "canceled" },
    { id: 7,  created_at: dia(6),  valor_total: 220.0, taxa_plataforma: 22.0, status: "canceled" },
    { id: 8,  created_at: dia(35), valor_total: 400.0, taxa_plataforma: 40.0, status: "paid" },
    { id: 9,  created_at: dia(38), valor_total: 350.0, taxa_plataforma: 35.0, status: "paid" },
    { id: 10, created_at: dia(42), valor_total: 290.0, taxa_plataforma: 29.0, status: "paid" },
    { id: 11, created_at: dia(50), valor_total: 180.0, taxa_plataforma: 18.0, status: "paid" },
    { id: 12, created_at: dia(65), valor_total: 500.0, taxa_plataforma: 50.0, status: "paid" },
    { id: 13, created_at: dia(70), valor_total: 420.0, taxa_plataforma: 42.0, status: "paid" },
    { id: 14, created_at: dia(75), valor_total: 310.0, taxa_plataforma: 31.0, status: "paid" },
  ];

  const allPaid = mockPagamentos.filter((p) => p.status === "paid");
  const totalTaxa = allPaid.reduce((s, p) => s + p.taxa_plataforma, 0);
  const totalBruta = allPaid.reduce((s, p) => s + p.valor_total, 0);

  const ovTotal = {
    kpis: { receita_bruta: totalBruta, taxa_plataforma: totalTaxa, valor_liquido: totalBruta - totalTaxa, qtd_pagamentos: allPaid.length },
    ultimos_pagamentos: allPaid,
  };
  const ovPendente = {
    kpis: { receita_bruta: 15000.0, taxa_plataforma: 1500.0, valor_liquido: 13500.0, qtd_pagamentos: 8 },
    ultimos_pagamentos: mockPagamentos.filter((p) => p.status === "pending"),
  };
  const ovCancelado = {
    kpis: { receita_bruta: 5000.0, taxa_plataforma: 500.0, valor_liquido: 4500.0, qtd_pagamentos: 3 },
    ultimos_pagamentos: mockPagamentos.filter((p) => p.status === "canceled"),
  };

  const reservasPorDia = [
    { data: new Date(hoje.getTime() - 5 * 86400000), valor: 1000.0 },
    { data: new Date(hoje.getTime() - 4 * 86400000), valor: 3000.0 },
    { data: new Date(hoje.getTime() - 3 * 86400000), valor: 2000.0 },
    { data: new Date(hoje.getTime() - 2 * 86400000), valor: 2500.0 },
    { data: new Date(hoje.getTime() - 1 * 86400000), valor: 3500.0 },
    { data: hoje, valor: 3000.0 },
  ];

  const transacoesConcluidas = [
    { id: 1, data: new Date(hoje.getTime() - 30 * 86400000), valor: 15000.0, descricao: "Reservas do mês anterior" },
    { id: 2, data: new Date(hoje.getTime() - 25 * 86400000), valor: 12000.0, descricao: "Pacote de reservas semanais" },
    { id: 3, data: new Date(hoje.getTime() - 20 * 86400000), valor: 18000.0, descricao: "Evento corporativo" },
    { id: 4, data: new Date(hoje.getTime() - 15 * 86400000), valor: 22000.0, descricao: "Campeonato de futebol" },
    { id: 5, data: new Date(hoje.getTime() - 10 * 86400000), valor: 25000.0, descricao: "Reservas mensais" },
    { id: 6, data: new Date(hoje.getTime() - 5 * 86400000),  valor: 18000.0, descricao: "Eventos diversos" },
    { id: 7, data: new Date(hoje.getTime() - 2 * 86400000),  valor: 2500.0,  descricao: "Reservas finais de semana" },
  ];

  const umMesAtras = new Date(hoje.getTime() - 30 * 86400000);
  const doisMesesAtras = new Date(hoje.getTime() - 60 * 86400000);
  const tresMesesAtras = new Date(hoje.getTime() - 90 * 86400000);

  const repassesMock = [
    { id: 1, valor_total_liquido: 12500.0, nome_titular: "Lorenzo Formenton", data_pagamento: hoje.toISOString().split("T")[0],          status: "pago",     created_at: hoje.toISOString() },
    { id: 2, valor_total_liquido: 9800.0,  nome_titular: "Lorenzo Formenton", data_pagamento: umMesAtras.toISOString().split("T")[0],    status: "pago",     created_at: umMesAtras.toISOString() },
    { id: 3, valor_total_liquido: 15200.0, nome_titular: "Lorenzo Formenton", data_pagamento: doisMesesAtras.toISOString().split("T")[0], status: "pago",     created_at: doisMesesAtras.toISOString() },
    { id: 4, valor_total_liquido: 7500.0,  nome_titular: "Lorenzo Formenton", data_pagamento: null,                                      status: "pendente", created_at: tresMesesAtras.toISOString() },
    { id: 5, valor_total_liquido: 11000.0, nome_titular: "Lorenzo Formenton", data_pagamento: null,                                      status: "recusado", created_at: tresMesesAtras.toISOString() },
  ];

  return { ovTotal, ovPendente, ovCancelado, reservasPorDia, transacoesConcluidas, repassesMock };
}

/** Dados bancários fictícios para o formulário de solicitação de repasse */
export const mockDadosBancarios = {
  nomeTitular: "Lorenzo Formenton",
  chavePix: "lorenzo.formenton@email.com",
};
