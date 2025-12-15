// src/layouts/AdminLayout.jsx
import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import PainelHeader from "../components/PainelHeader";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const { usuario, carregando, logout } = useAuth();

  // Guard simples (UX): se não for admin, volta pro login
  useEffect(() => {
    if (carregando) return;

    const tipo = String(usuario?.tipo || "").toLowerCase();
    if (!usuario || tipo !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [usuario, carregando, navigate]);

  return (
    <div className="layout-root">
      <aside className="layout-sidebar">
        <div className="layout-logo">
          <span className="logo-main">VaiTerPlay</span>
          <span className="logo-tag">Admin</span>
        </div>

        <nav className="layout-menu">
          {/* 1) Dashboard */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Dashboard
          </NavLink>

          {/* 2) Gestores */}
          <NavLink
            to="/admin/gestores"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Gestores
          </NavLink>

          {/* 3) Complexos / Empresas */}
          <NavLink
            to="/admin/empresas"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Empresas / Complexos
          </NavLink>

          {/* 4) Quadras */}
          <NavLink
            to="/admin/quadras"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Quadras
          </NavLink>

          {/* 5) Agenda */}
          <NavLink
            to="/admin/agenda"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Agenda
          </NavLink>

          {/* 6) Reservas */}
          <NavLink
            to="/admin/reservas"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Reservas
          </NavLink>

          {/* 7) Financeiro */}
          <NavLink
            to="/admin/financeiro"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Financeiro
          </NavLink>

          {/* 8) Repasses */}
          <NavLink
            to="/admin/repasses"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Repasses
          </NavLink>

          {/* Sair */}
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            style={{ textAlign: "left" }}
          >
            Sair
          </button>
        </nav>
      </aside>

      <main className="layout-main">
        <PainelHeader titulo="Painel Admin" />
        <section className="layout-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;
