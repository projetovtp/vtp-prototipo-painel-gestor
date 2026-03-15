import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FAQ_DATA = [
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

function CategoryIcon({ type }) {
  const props = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (type) {
    case "calendar":
      return (<svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
    case "grid":
      return (<svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
    case "users":
      return (<svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
    case "dollar":
      return (<svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
    case "settings":
      return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
    default:
      return null;
  }
}

function ChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: "Reservas", path: "/gestor/reservas", icon: "calendar" },
  { label: "Regras de Horários", path: "/gestor/regras-de-horarios", icon: "clock" },
  { label: "Configurações", path: "/gestor/configuracoes", icon: "settings" },
  { label: "Financeiro", path: "/gestor/financeiro", icon: "dollar" },
  { label: "Relatórios", path: "/gestor/relatorios", icon: "chart" },
];

function QuickLinkIcon({ type }) {
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (type) {
    case "calendar":
      return (<svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
    case "clock":
      return (<svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
    case "settings":
      return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
    case "dollar":
      return (<svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
    case "chart":
      return (<svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>);
    default:
      return null;
  }
}

export default function GestorAjudaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState({});

  function toggleItem(key) {
    setAbertos((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const categoriasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return FAQ_DATA;

    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.pergunta.toLowerCase().includes(termo) ||
          item.resposta.toLowerCase().includes(termo)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [busca]);

  const totalResultados = categoriasFiltradas.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="page">
      <h2 className="page-title">Ajuda</h2>

      <div className="ajuda-intro">
        <div className="ajuda-intro-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="ajuda-intro-text">
          <h2>Central de Ajuda</h2>
          <p>
            Encontre respostas para as dúvidas mais frequentes sobre o uso da plataforma VaiTerPlay.
            Navegue pelas categorias abaixo ou use a busca para encontrar o que precisa.
          </p>
        </div>
      </div>

      <div className="ajuda-search">
        <span className="ajuda-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Buscar nas perguntas frequentes..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="ajuda-grid">
        <div className="ajuda-faq-section">
          {categoriasFiltradas.length === 0 && (
            <div className="ajuda-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Nenhum resultado encontrado para "<strong>{busca}</strong>"</span>
              <p>Tente buscar com outros termos ou entre em contato com o suporte.</p>
            </div>
          )}

          {categoriasFiltradas.map((cat) => (
            <div key={cat.category} className="ajuda-category">
              <div className="ajuda-category-title">
                <CategoryIcon type={cat.icon} />
                {cat.category}
              </div>

              {cat.items.map((item, idx) => {
                const key = `${cat.category}-${idx}`;
                const isOpen = !!abertos[key];
                return (
                  <div key={key} className={`ajuda-item${isOpen ? " open" : ""}`}>
                    <button
                      className="ajuda-item-header"
                      onClick={() => toggleItem(key)}
                      aria-expanded={isOpen}
                    >
                      {item.pergunta}
                      <ChevronDown />
                    </button>
                    {isOpen && (
                      <div className="ajuda-item-body">{item.resposta}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {busca && totalResultados > 0 && (
            <p style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              {totalResultados} resultado{totalResultados !== 1 ? "s" : ""} encontrado{totalResultados !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="ajuda-sidebar">
          <div className="ajuda-sidebar-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Contato e Suporte
            </h3>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">WhatsApp</span>
                <span className="ajuda-contact-value">(11) 99999-9999</span>
              </div>
            </div>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">E-mail</span>
                <span className="ajuda-contact-value">suporte@vaiterplay.com.br</span>
              </div>
            </div>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">Horário de atendimento</span>
                <span className="ajuda-contact-value">Seg a Sex, 9h às 18h</span>
              </div>
            </div>
          </div>

          <div className="ajuda-sidebar-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Acesso Rápido
            </h3>
            <div className="ajuda-link-list">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.path}
                  className="ajuda-link"
                  onClick={() => navigate(link.path)}
                >
                  <QuickLinkIcon type={link.icon} />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
