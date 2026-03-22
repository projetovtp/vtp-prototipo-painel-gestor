export const FAQ_DATA = [
    {
      category: "Reservas",
      icon: "calendar",
      items: [
        {
          pergunta: "Como criar uma reserva?",
          resposta:
            "Acesse a página de Reservas no menu lateral, selecione a data e o horário desejados na grade de horários, escolha a quadra disponível e confirme a reserva. Você pode também adicionar observações e definir o método de pagamento.",
        },
        {
          pergunta: "Como cancelar uma reserva?",
          resposta:
            "Acesse a página de Reservas ou o histórico do cliente, localize a reserva desejada e clique no botão \"Cancelar\". Reservas pendentes ou pagas criadas há menos de 24 horas podem ser canceladas. Após esse prazo, entre em contato com o suporte.",
        },
        {
          pergunta: "Posso editar uma reserva já confirmada?",
          resposta:
            "Sim. Na página de Reservas, clique sobre a reserva para abrir os detalhes. Você pode alterar horário, quadra ou observações, desde que o novo horário esteja disponível. Alterações de valor precisam ser feitas manualmente no financeiro.",
        },
      ],
    },
    {
      category: "Quadras e Horários",
      icon: "grid",
      items: [
        {
          pergunta: "Como configurar regras de horários?",
          resposta:
            "Acesse \"Regras de Horários\" no menu lateral. Na seção \"Regras\", defina os horários disponíveis, valores e duração dos slots para cada quadra. Você pode criar regras diferentes para dias da semana e finais de semana.",
        },
        {
          pergunta: "Como bloquear um horário específico?",
          resposta:
            "Na seção \"Bloqueios\" dentro de Regras de Horários, você pode criar bloqueios por data, faixa de horário e quadra. Bloqueios impedem que novas reservas sejam criadas naquele período.",
        },
        {
          pergunta: "Como adicionar uma nova quadra?",
          resposta:
            "Vá em Configurações > Quadras e clique em \"Nova Quadra\". Preencha as informações como nome, estrutura, material do piso, modalidades aceitas e quantidade de quadras do mesmo tipo. Após salvar, a quadra estará disponível para reservas.",
        },
      ],
    },
    {
      category: "Clientes",
      icon: "users",
      items: [
        {
          pergunta: "Como visualizar o histórico de um cliente?",
          resposta:
            "Na página de Clientes, clique sobre o nome do cliente para expandir seus detalhes. Você verá o histórico completo de reservas, total gasto, frequência e dados de contato.",
        },
        {
          pergunta: "O que significa o status do cliente?",
          resposta:
            "Clientes são classificados automaticamente como \"Ativo\" (reserva nos últimos 30 dias) ou \"Inativo\" (sem reservas há mais de 30 dias). Isso ajuda a identificar clientes que podem precisar de reengajamento.",
        },
      ],
    },
    {
      category: "Financeiro e Relatórios",
      icon: "dollar",
      items: [
        {
          pergunta: "Como acessar os relatórios financeiros?",
          resposta:
            "No menu lateral, acesse \"Relatórios\" para visualizar dados consolidados por período. Você pode filtrar por data, quadra e tipo de receita. Na página \"Financeiro\", acompanhe o fluxo de caixa detalhado.",
        },
        {
          pergunta: "Quais métodos de pagamento são suportados?",
          resposta:
            "A plataforma registra pagamentos via PIX, cartão de crédito, cartão de débito e dinheiro. A conciliação de pagamentos online é feita automaticamente; pagamentos presenciais precisam ser registrados manualmente.",
        },
      ],
    },
    {
      category: "Configurações",
      icon: "settings",
      items: [
        {
          pergunta: "Como editar as informações do complexo?",
          resposta:
            "Acesse Configurações > Complexo para editar nome, endereço, telefone, horário de funcionamento e outras informações do seu estabelecimento. Essas informações são exibidas para os clientes na página de reserva.",
        },
        {
          pergunta: "Posso ter mais de uma empresa no mesmo painel?",
          resposta:
            "Sim. Na seção Empresas, você pode cadastrar múltiplas unidades ou empresas. Cada empresa possui suas próprias quadras, regras e configurações independentes.",
        },
      ],
    },
  ];

 export const QUICK_LINKS = [
    { label: "Reservas", path: "/gestor/reservas", icon: "calendar" },
    { label: "Regras de Horários", path: "/gestor/regras-de-horarios", icon: "clock" },
    { label: "Configurações", path: "/gestor/configuracoes", icon: "settings" },
    { label: "Financeiro", path: "/gestor/financeiro", icon: "dollar" },
    { label: "Relatórios", path: "/gestor/relatorios", icon: "chart" },
  ];