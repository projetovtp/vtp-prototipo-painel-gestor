export const MOCK_QUADRAS = [
    {
      id: 1, nome: "Indoor - Futsal", estrutura: "Indoor", material: "Sintético",
      modalidades: ["Futsal", "Handebol"], quantidade_quadras: 2,
      apelido: "Quadra Central", empresa_id: 1, status: "ativa",
      created_at: new Date().toISOString(),
    },
    {
      id: 2, nome: "Externa - Society", estrutura: "Externa", material: "Gramado Natural",
      modalidades: ["Society 5x5", "Society 7x7", "Futebol de campo"], quantidade_quadras: 3,
      apelido: "Campão", empresa_id: 1, status: "ativa",
      created_at: new Date().toISOString(),
    },
    {
      id: 3, nome: "Coberta - Beach Tennis", estrutura: "Coberta", material: "Areia",
      modalidades: ["Beach Tennis", "Vôlei de praia", "Futvôlei"], quantidade_quadras: 2,
      apelido: "Arena de Areia", empresa_id: 1, status: "ativa",
      created_at: new Date().toISOString(),
    },
    {
      id: 4, nome: "Indoor - Basquete", estrutura: "Indoor", material: "Cimento",
      modalidades: ["Basquete"], quantidade_quadras: 1,
      apelido: "Quadra NBA", empresa_id: 1, status: "inativa",
      created_at: new Date().toISOString(),
    },
    {
      id: 5, nome: "Coberta - Tênis", estrutura: "Coberta", material: "Saibro",
      modalidades: ["Tênis", "Pádel"], quantidade_quadras: 4,
      apelido: "Courts", empresa_id: 1, status: "ativa",
      created_at: new Date().toISOString(),
    },
    {
      id: 6, nome: "Externa - Vôlei", estrutura: "Externa", material: "Areia",
      modalidades: ["Vôlei de praia"], quantidade_quadras: 1,
      apelido: null, empresa_id: 1, status: "inativa",
      created_at: new Date().toISOString(),
    },
  ];
  
  export const MOCK_EMPRESAS = [
    { id: 1, nome: "Complexo Esportivo VTP", endereco_resumo: "Rua das Quadras, 123 - São Paulo, SP" },
  ];