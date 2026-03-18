// TODO: remover quando gestorClientesApi.listar() retornar dados reais

export function gerarMockClientes() {
  const hoje = new Date();
  const d = (dias) =>
    new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

  return [
    { id: 1,  nome: "João Silva",        cpf: "123.456.789-00", telefone: "(11) 98765-4321", email: "joao.silva@email.com",        totalReservas: 15, totalGasto: 2250.0, ultimaReserva: d(15), dataCadastro: "2023-12-01" },
    { id: 2,  nome: "Maria Santos",      cpf: "987.654.321-00", telefone: "(11) 91234-5678", email: "maria.santos@email.com",      totalReservas: 8,  totalGasto: 1200.0, ultimaReserva: d(0),  dataCadastro: "2024-01-05" },
    { id: 3,  nome: "Pedro Costa",       cpf: "456.789.123-00", telefone: "(11) 99876-5432", email: "pedro.costa@email.com",       totalReservas: 22, totalGasto: 3300.0, ultimaReserva: d(40), dataCadastro: "2023-11-20" },
    { id: 5,  nome: "Carlos Mendes",     cpf: "321.654.987-00", telefone: "(11) 94567-8901", email: "carlos.mendes@email.com",     totalReservas: 5,  totalGasto: 750.0,  ultimaReserva: d(25), dataCadastro: "2023-12-15" },
    { id: 6,  nome: "Fernanda Lima",     cpf: "111.222.333-44", telefone: "(11) 91111-2222", email: "fernanda.lima@email.com",     totalReservas: 12, totalGasto: 1800.0, ultimaReserva: d(0),  dataCadastro: "2024-01-10" },
    { id: 7,  nome: "Roberto Alves",     cpf: "222.333.444-55", telefone: "(11) 92222-3333", email: "roberto.alves@email.com",     totalReservas: 18, totalGasto: 2700.0, ultimaReserva: d(15), dataCadastro: "2023-11-25" },
    { id: 8,  nome: "Juliana Ferreira",  cpf: "333.444.555-66", telefone: "(11) 93333-4444", email: "juliana.ferreira@email.com",  totalReservas: 6,  totalGasto: 900.0,  ultimaReserva: d(25), dataCadastro: "2024-01-08" },
    { id: 9,  nome: "Lucas Souza",       cpf: "444.555.666-77", telefone: "(11) 94444-5555", email: "lucas.souza@email.com",       totalReservas: 20, totalGasto: 3000.0, ultimaReserva: d(40), dataCadastro: "2023-10-15" },
    { id: 10, nome: "Patricia Rocha",    cpf: "555.666.777-88", telefone: "(11) 95555-6666", email: "patricia.rocha@email.com",    totalReservas: 9,  totalGasto: 1350.0, ultimaReserva: d(0),  dataCadastro: "2024-01-12" },
    { id: 11, nome: "Ricardo Martins",   cpf: "666.777.888-99", telefone: "(11) 96666-7777", email: "ricardo.martins@email.com",   totalReservas: 14, totalGasto: 2100.0, ultimaReserva: d(15), dataCadastro: "2023-12-20" },
    { id: 12, nome: "Amanda Costa",      cpf: "777.888.999-00", telefone: "(11) 97777-8888", email: "amanda.costa@email.com",      totalReservas: 7,  totalGasto: 1050.0, ultimaReserva: d(25), dataCadastro: "2024-01-03" },
    { id: 13, nome: "Bruno Oliveira",    cpf: "888.999.000-11", telefone: "(11) 98888-9999", email: "bruno.oliveira@email.com",    totalReservas: 11, totalGasto: 1650.0, ultimaReserva: d(60), dataCadastro: "2023-09-10" },
    { id: 14, nome: "Camila Rodrigues",  cpf: "999.000.111-22", telefone: "(11) 99999-0000", email: "camila.rodrigues@email.com",  totalReservas: 4,  totalGasto: 600.0,  ultimaReserva: d(0),  dataCadastro: "2024-01-15" },
    { id: 15, nome: "Diego Pereira",     cpf: "000.111.222-33", telefone: "(11) 90000-1111", email: "diego.pereira@email.com",     totalReservas: 16, totalGasto: 2400.0, ultimaReserva: d(15), dataCadastro: "2023-12-05" },
    { id: 16, nome: "Eduarda Silva",     cpf: "111.222.333-44", telefone: "(11) 90111-2222", email: "eduarda.silva@email.com",     totalReservas: 3,  totalGasto: 450.0,  ultimaReserva: d(25), dataCadastro: "2024-01-18" },
    { id: 17, nome: "Felipe Araújo",     cpf: "222.333.444-55", telefone: "(11) 91234-5678", email: "felipe.araujo@email.com",     totalReservas: 10, totalGasto: 1500.0, ultimaReserva: d(0),  dataCadastro: "2024-01-20" },
    { id: 18, nome: "Gabriela Nunes",    cpf: "333.444.555-66", telefone: "(11) 92345-6789", email: "gabriela.nunes@email.com",    totalReservas: 13, totalGasto: 1950.0, ultimaReserva: d(15), dataCadastro: "2023-12-28" },
    { id: 19, nome: "Henrique Barbosa",  cpf: "444.555.666-77", telefone: "(11) 93456-7890", email: "henrique.barbosa@email.com",  totalReservas: 8,  totalGasto: 1200.0, ultimaReserva: d(25), dataCadastro: "2024-01-07" },
    { id: 20, nome: "Isabela Teixeira",  cpf: "555.666.777-88", telefone: "(11) 94567-8901", email: "isabela.teixeira@email.com",  totalReservas: 6,  totalGasto: 900.0,  ultimaReserva: d(0),  dataCadastro: "2024-01-22" },
  ];
}

export function gerarMockHistoricoCliente() {
  const agora = new Date();
  const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);
  const vinteCincoHorasAtras = new Date(agora.getTime() - 25 * 60 * 60 * 1000);
  return [
    { id: 1, data: agora.toISOString().split("T")[0], hora: "18:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid",    empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 2, data: agora.toISOString().split("T")[0], hora: "20:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "pending", empresa: "Complexo Esportivo ABC", created_at: duasHorasAtras.toISOString() },
    { id: 3, data: "2024-01-05",                      hora: "19:00", tipoQuadra: "Futebol - Campo Society", valor: 150.0, status: "paid",    empresa: "Complexo Esportivo ABC", created_at: vinteCincoHorasAtras.toISOString() },
  ];
}
