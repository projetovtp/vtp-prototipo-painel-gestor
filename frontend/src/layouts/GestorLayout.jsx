import React from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import PainelHeader from "../components/PainelHeader";
import logoVaiTerPlay from "../assets/Design sem nome (4).png";
import { mockContatos, mockNovaReserva, contarNotificacoesPendentes } from "../data/mockContatos";


const chevronIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function SubMenu({ icon, label, aberto, onToggle, children }) {
  return (
    <div>
      <div onClick={onToggle} className="menu-link" role="button" tabIndex={0}>
        {icon}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>{label}</span>
          <span className={`menu-chevron${aberto ? " open" : ""}`}>
            {chevronIcon}
          </span>
        </div>
      </div>

      {aberto && <div className="menu-submenu">{children}</div>}
    </div>
  );
}

function SidebarLink({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}

function SubMenuLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
    >
      <span>{children}</span>
    </NavLink>
  );
}

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor" />
    </svg>
  ),
  reservas: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 11H7V9C7 7.9 7.9 7 9 7H11V9H9V11ZM13 7H15C16.1 7 17 7.9 17 9V11H15V9H13V7ZM7 13H9V15H7V13ZM15 13H17V15H15V13ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor" />
    </svg>
  ),
  clientes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor" />
    </svg>
  ),
  relatorios: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor" />
    </svg>
  ),
  regrasHorarios: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z" fill="currentColor" />
    </svg>
  ),
  financeiro: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.5 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.5 11.8 10.9Z" fill="currentColor" />
    </svg>
  ),
  configuracoes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.38 9.08 21.24 8.86L19.24 5.82C19.1 5.6 18.84 5.54 18.62 5.68L16.26 7.26C15.78 6.87 15.25 6.55 14.66 6.33L14.36 3.72C14.32 3.5 14.14 3.34 13.92 3.34H10.08C9.86 3.34 9.68 3.5 9.64 3.72L9.34 6.33C8.75 6.55 8.22 6.87 7.74 7.26L5.38 5.68C5.16 5.54 4.9 5.6 4.76 5.82L2.76 8.86C2.62 9.08 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.62 14.92 2.76 15.14L4.76 18.18C4.9 18.4 5.16 18.46 5.38 18.32L7.74 16.74C8.22 17.13 8.75 17.45 9.34 17.67L9.64 20.28C9.68 20.5 9.86 20.66 10.08 20.66H13.92C14.14 20.66 14.32 20.5 14.36 20.28L14.66 17.67C15.25 17.45 15.78 17.13 16.26 16.74L18.62 18.32C18.84 18.46 19.1 18.4 19.24 18.18L21.24 15.14C21.38 14.92 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor" />
    </svg>
  ),
  ajuda: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};

function GestorLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const notificacoesPendentes = contarNotificacoesPendentes(mockContatos, mockNovaReserva);

  const isConfiguracoesRoute = location.pathname.startsWith("/gestor/configuracoes");
  const isRegrasHorariosRoute = location.pathname.startsWith("/gestor/regras-de-horarios");

  const configuracoesAberto = isConfiguracoesRoute;
  const regrasHorariosAberto = isRegrasHorariosRoute;

  return (
    <div className="layout-root">
      <aside className="layout-sidebar">
        <div className="sidebar-logo">
          <img src={logoVaiTerPlay} alt="VaiTerPlay" />
          <div>
            <div className="sidebar-brand-name">VaiTerPlay</div>
            <div className="sidebar-brand-tag">Gestor</div>
          </div>
        </div>

        <nav className="layout-menu">
          <SidebarLink to="/gestor" end icon={icons.dashboard}>
            Dashboard
          </SidebarLink>

          <SidebarLink to="/gestor/reservas" icon={icons.reservas}>
            Reservas
          </SidebarLink>

          <SidebarLink to="/gestor/clientes" icon={icons.clientes}>
            Clientes
          </SidebarLink>

          <SidebarLink to="/gestor/relatorios" icon={icons.relatorios}>
            Relatórios
          </SidebarLink>

          <SubMenu
            icon={icons.regrasHorarios}
            label="Regra de Horários"
            aberto={regrasHorariosAberto}
            onToggle={() => navigate("/gestor/regras-de-horarios")}
          >
            <SubMenuLink to="/gestor/regras-de-horarios/regras">
              Regra de Horários
            </SubMenuLink>
            <SubMenuLink to="/gestor/regras-de-horarios/bloqueios">
              Bloqueio de Horários
            </SubMenuLink>
          </SubMenu>

          <SidebarLink to="/gestor/financeiro" icon={icons.financeiro}>
            Financeiro
          </SidebarLink>

          <SubMenu
            icon={icons.configuracoes}
            label="Configurações"
            aberto={configuracoesAberto}
            onToggle={() => navigate("/gestor/configuracoes")}
          >
            <SubMenuLink to="/gestor/configuracoes/complexo">
              Complexo
            </SubMenuLink>
            <SubMenuLink to="/gestor/configuracoes/quadras">
              Quadras
            </SubMenuLink>
          </SubMenu>

          <SidebarLink to="/gestor/ajuda" icon={icons.ajuda}>
            Ajuda
          </SidebarLink>
        </nav>
      </aside>

      <main className="layout-main">
        <PainelHeader
          notificacoesPendentes={notificacoesPendentes}
          contatos={mockContatos}
          novaReserva={mockNovaReserva}
        />

        <section className="layout-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default GestorLayout;
