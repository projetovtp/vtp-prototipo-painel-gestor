// src/layouts/GestorLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import PainelHeader from "../components/PainelHeader";

function GestorLayout() {
  return (
    <div className="layout-root">
      <aside className="layout-sidebar">
        <div className="layout-logo">
          <span className="logo-main">VaiTerPlay</span>
          <span className="logo-tag">Gestor</span>
        </div>

        <nav className="layout-menu">
          <NavLink
            to="/gestor"
            end
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/gestor/empresas"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Empresas / Complexos
          </NavLink>

          <NavLink
            to="/gestor/quadras"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Quadras
          </NavLink>

          {/* ✅ Agenda → tela de configurar agenda */}
          <NavLink
            to="/gestor/agenda"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Agenda
          </NavLink>

          {/* ✅ Reservas → tela cinema */}
          <NavLink
            to="/gestor/reservas"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Reservas
          </NavLink>

          {/* ✅ Financeiro → relatórios + repasses */}
          <NavLink
            to="/gestor/financeiro"
            className={({ isActive }) =>
              isActive ? "menu-link active" : "menu-link"
            }
          >
            Financeiro
          </NavLink>
        </nav>
      </aside>

      <main className="layout-main">
        {/* Header novo com nome + email + botão Sair */}
        <PainelHeader titulo="Painel do Gestor" />

        <section className="layout-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default GestorLayout;
