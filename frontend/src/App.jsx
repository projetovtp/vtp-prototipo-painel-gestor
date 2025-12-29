// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import GestorLayout from "./layouts/GestorLayout";



import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminGestoresPage from "./pages/admin/AdminGestoresPage";
import AdminEmpresasPage from "./pages/admin/AdminEmpresasPage";
import AdminQuadrasPage from "./pages/admin/AdminQuadrasPage";
import AdminAgendaPage from "./pages/admin/AdminAgendaPage";
import AdminReservasPage from "./pages/admin/AdminReservasPage";
import AdminFinanceiroPage from "./pages/admin/AdminFinanceiroPage";
import AdminRepassesPage from "./pages/admin/AdminRepassesPage";

import GestorDashboardPage from "./pages/gestor/GestorDashboardPage";
import GestorEmpresasPage from "./pages/gestor/GestorEmpresasPage";
import GestorQuadrasPage from "./pages/gestor/GestorQuadrasPage";
import GestorQuadrasListPage from "./pages/gestor/GestorQuadrasListPage";
import GestorQuadraEditarPage from "./pages/gestor/GestorQuadraEditarPage";
import GestorEmpresaEditarPage from "./pages/gestor/GestorEmpresaEditarPage";
import GestorAgendaEditPage from "./pages/gestor/GestorAgendaEditPage.jsx";
import GestorReservasPage from "./pages/gestor/GestorReservasPage";
import GestorFinanceiroPage from "./pages/gestor/GestorFinanceiroPage";

// 🔹 Agenda do Gestor (visualização tipo cinema + filtros)
import GestorAgendaPage from "./pages/gestor/GestorAgendaPage";

import LoginPage from "./pages/LoginPage"; // tela de login (pública)

// ✅ Novas telas públicas (Modelo A)
import EsqueciSenhaPage from "./pages/EsqueciSenhaPage";
import ResetarSenhaPage from "./pages/ResetarSenhaPage";
import TrocarSenhaPage from "./pages/TrocarSenhaPage";

import RotaPrivada from "./components/RotaPrivada"; // guarda de rota (admin/gestor)

function App() {
  return (
    <Routes>
      {/* Raiz manda para /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Telas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
      <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
      <Route path="/nova-senha" element={<ResetarSenhaPage />} />
      <Route path="/trocar-senha" element={<TrocarSenhaPage />} />



      {/* ROTAS DO ADMIN (protegidas) */}
      <Route
        path="/admin"
        element={
          <RotaPrivada role="admin">
            <AdminLayout />
          </RotaPrivada>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="gestores" element={<AdminGestoresPage />} />
        <Route path="empresas" element={<AdminEmpresasPage />} />
        <Route path="quadras" element={<AdminQuadrasPage />} />
        <Route path="agenda" element={<AdminAgendaPage />} />
        <Route path="reservas" element={<AdminReservasPage />} />
        <Route path="financeiro" element={<AdminFinanceiroPage />} />
        <Route path="repasses" element={<AdminRepassesPage />} />
      </Route>

      {/* ROTAS DO GESTOR (protegidas) */}
      <Route
        path="/gestor"
        element={
          <RotaPrivada role="gestor">
            <GestorLayout />
          </RotaPrivada>
        }
      >
        {/* Dashboard */}
        <Route index element={<GestorDashboardPage />} />

        {/* Empresas / Complexos */}
        <Route path="empresas" element={<GestorEmpresasPage />} />
        <Route
          path="empresas/editar/:empresaId"
          element={<GestorEmpresaEditarPage />}
        />

        {/* Lista de quadras */}
        <Route path="quadras" element={<GestorQuadrasListPage />} />

        {/* Cadastro/edição de quadra */}
        <Route path="quadras/nova" element={<GestorQuadrasPage />} />
        <Route
          path="quadras/editar/:quadraId"
          element={<GestorQuadraEditarPage />}
        />

        {/* Agenda do Gestor (visualização tipo cinema + filtros) */}
        <Route path="agenda" element={<GestorAgendaPage />} />

        {/* Página de edição da agenda (regras de horário + bloqueios) */}
        <Route path="agenda/editar" element={<GestorAgendaEditPage />} />

        {/* Reservas */}
        <Route path="reservas" element={<GestorReservasPage />} />

        {/* Financeiro do Gestor */}
        <Route path="financeiro" element={<GestorFinanceiroPage />} />
      </Route>

      {/* Qualquer outra rota → volta pro login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
