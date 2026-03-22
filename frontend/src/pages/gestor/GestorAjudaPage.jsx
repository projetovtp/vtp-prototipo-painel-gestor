import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QUICK_LINKS, FAQ_DATA } from "../../data/faqData";

import IconCalendar from "../../components/icons/IconCalendar";
import IconGrid from "../../components/icons/IconGrid";
import IconUsers from "../../components/icons/IconUsers";
import IconDollar from "../../components/icons/IconDollar";
import IconSettings from "../../components/icons/IconSettings";
import IconChevronDown from "../../components/icons/IconChevronDown";
import IconSearch from "../../components/icons/IconSearch";
import IconClock from "../../components/icons/IconClock";
import IconChart from "../../components/icons/IconChart";
import IconHelp from "../../components/icons/IconHelp";
import IconPhone from "../../components/icons/IconPhone";
import IconChat from "../../components/icons/IconChat";
import IconEmail from "../../components/icons/IconEmail";
import IconLightning from "../../components/icons/IconLightning";

const CATEGORY_ICONS = {
  calendar: IconCalendar,
  grid: IconGrid,
  users: IconUsers,
  dollar: IconDollar,
  settings: IconSettings,
};
const QUICK_LINK_ICONS = {
  calendar: IconCalendar,
  clock: IconClock,
  settings: IconSettings,
  dollar: IconDollar,
  chart: IconChart,
};

const GestorAjudaPage = () => {
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
          item.resposta.toLowerCase().includes(termo),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [busca]);

  const totalResultados = categoriasFiltradas.reduce(
    (acc, cat) => acc + cat.items.length,
    0,
  );

  return (
    <div className="page">
      <h2 className="page-title">Ajuda</h2>

      <div className="ajuda-intro">
        <div className="ajuda-intro-icon">
          <IconHelp size={28} />
        </div>
        <div className="ajuda-intro-text">
          <h2>Central de Ajuda</h2>
          <p>
            Encontre respostas para as dúvidas mais frequentes sobre o uso da
            plataforma VaiTerPlay. Navegue pelas categorias abaixo ou use a
            busca para encontrar o que precisa.
          </p>
        </div>
      </div>

      <div className="ajuda-search">
        <span className="ajuda-search-icon">
          <IconSearch size={18} />
        </span>
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
              <IconSearch size={48} strokeWidth={1.5} />
              <span>
                Nenhum resultado encontrado para "<strong>{busca}</strong>"
              </span>
              <p>
                Tente buscar com outros termos ou entre em contato com o
                suporte.
              </p>
            </div>
          )}

          {categoriasFiltradas.map((cat) => (
            <div key={cat.category} className="ajuda-category">
              <div className="ajuda-category-title">
                {(() => {
                  const Icon = CATEGORY_ICONS[cat.icon];
                  return Icon ? <Icon size={20} /> : null;
                })()}
                {cat.category}
              </div>

              {cat.items.map((item, idx) => {
                const key = `${cat.category}-${idx}`;
                const isOpen = !!abertos[key];
                return (
                  <div
                    key={key}
                    className={`ajuda-item${isOpen ? " open" : ""}`}
                  >
                    <button
                      className="ajuda-item-header"
                      onClick={() => toggleItem(key)}
                      aria-expanded={isOpen}
                    >
                      {item.pergunta}
                      <IconChevronDown size={18} />
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
            <p
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              {totalResultados} resultado{totalResultados !== 1 ? "s" : ""}{" "}
              encontrado{totalResultados !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="ajuda-sidebar">
          <div className="ajuda-sidebar-card">
            <h3>
              <IconPhone size={18} />
              Contato e Suporte
            </h3>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <IconChat size={16} />
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">WhatsApp</span>
                <span className="ajuda-contact-value">(11) 99999-9999</span>
              </div>
            </div>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <IconEmail size={16} />
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">E-mail</span>
                <span className="ajuda-contact-value">
                  suporte@vaiterplay.com.br
                </span>
              </div>
            </div>

            <div className="ajuda-contact-row">
              <div className="ajuda-contact-icon">
                <IconClock size={16} />
              </div>
              <div className="ajuda-contact-info">
                <span className="ajuda-contact-label">
                  Horário de atendimento
                </span>
                <span className="ajuda-contact-value">
                  Seg a Sex, 9h às 18h
                </span>
              </div>
            </div>
          </div>

          <div className="ajuda-sidebar-card">
            <h3>
              <IconLightning size={18} />
              Acesso Rápido
            </h3>
            <div className="ajuda-link-list">
              {QUICK_LINKS.map((link) => {
                const LinkIcon = QUICK_LINK_ICONS[link.icon];
                return (
                  <button
                    key={link.path}
                    className="ajuda-link"
                    onClick={() => navigate(link.path)}
                  >
                    {LinkIcon && <LinkIcon size={16} />}
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorAjudaPage;
