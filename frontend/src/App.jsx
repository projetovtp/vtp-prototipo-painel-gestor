// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { setNavigate } from "./api/interceptors";

import AdminLayout from "./layouts/AdminLayout";
import GestorLayout from "./layouts/GestorLayout";
import MobileLayout from "./layouts/MobileLayout";



import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminGestoresPage from "./pages/admin/AdminGestoresPage";
import AdminEmpresasPage from "./pages/admin/AdminEmpresasPage";
import AdminQuadrasPage from "./pages/admin/AdminQuadrasPage";
import AdminAgendaPage from "./pages/admin/AdminAgendaPage";
import AdminReservasPage from "./pages/admin/AdminReservasPage";
import AdminFinanceiroPage from "./pages/admin/AdminFinanceiroPage";
import AdminRepassesPage from "./pages/admin/AdminRepassesPage";

import GestorDashboardPage from "./pages/gestor/GestorDashboardPage";
import GestorDashboardPageMobile from "./pages/gestor/GestorDashboardPageMobile";
import GestorEmpresasPage from "./pages/gestor/GestorEmpresasPage";
import GestorQuadrasPage from "./pages/gestor/GestorQuadrasPage";
import GestorQuadrasListPage from "./pages/gestor/GestorQuadrasListPage";
import GestorQuadraEditarPage from "./pages/gestor/GestorQuadraEditarPage";
import GestorEmpresaEditarPage from "./pages/gestor/GestorEmpresaEditarPage";
import GestorReservasPage from "./pages/gestor/GestorReservasPage";
import GestorFinanceiroPage from "./pages/gestor/GestorFinanceiroPage";
import GestorClientesPage from "./pages/gestor/GestorClientesPage";
import GestorRelatoriosPage from "./pages/gestor/GestorRelatoriosPage";
import GestorConfiguracoesPage from "./pages/gestor/GestorConfiguracoesPage";
import GestorConfiguracoesQuadrasPage from "./pages/gestor/GestorConfiguracoesQuadrasPage";
import GestorConfiguracoesSelecaoPage from "./pages/gestor/GestorConfiguracoesSelecaoPage";
import GestorAjudaPage from "./pages/gestor/GestorAjudaPage";
import GestorRegrasSelecaoPage from "./pages/gestor/GestorRegrasSelecaoPage";

// 🔹 Agenda do Gestor (visualização tipo cinema + filtros)
import GestorAgendaPage from "./pages/gestor/GestorAgendaPage";
import GestorBloqueiosPage from "./pages/gestor/GestorBloqueiosPage";

// 📱 Páginas Mobile
import GestorMobileMensagensPage from "./pages/gestor/mobile/GestorMobileMensagensPage";
import GestorMobileChatPage from "./pages/gestor/mobile/GestorMobileChatPage";
import GestorMobileClientesPage from "./pages/gestor/mobile/GestorMobileClientesPage";
import GestorMobileRelatoriosPage from "./pages/gestor/mobile/GestorMobileRelatoriosPage";
import GestorMobileReservasPage from "./pages/gestor/mobile/GestorMobileReservasPage";
import GestorMobileRegrasSelecaoPage from "./pages/gestor/mobile/GestorMobileRegrasSelecaoPage";
import GestorMobileAgendaPage from "./pages/gestor/mobile/GestorMobileAgendaPage";
import GestorMobileBloqueiosPage from "./pages/gestor/mobile/GestorMobileBloqueiosPage";

import ResponsivePage from "./components/ResponsivePage";

import LoginPage from "./pages/LoginPage"; // tela de login (pública)

// ✅ Novas telas públicas (Modelo A)
import EsqueciSenhaPage from "./pages/EsqueciSenhaPage";
import ResetarSenhaPage from "./pages/ResetarSenhaPage";
import TrocarSenhaPage from "./pages/TrocarSenhaPage";
import LandingPage from "./pages/LandingPage";

import RotaPrivada from "./components/RotaPrivada"; // guarda de rota (admin/gestor)
import DeviceRouter from "./components/DeviceRouter";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

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
            <DeviceRouter />
          </RotaPrivada>
        }
      >
        {/* Dashboard - Redireciona para mensagens no mobile */}
        <Route index element={<GestorDashboardPage />} />

        {/* Mensagens (Mobile) */}
        <Route path="mensagens" element={<GestorMobileMensagensPage />} />
        <Route path="mensagens/chat/:chatId" element={<GestorMobileChatPage />} />

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
        <Route path="regras-de-horarios" element={<ResponsivePage desktop={GestorRegrasSelecaoPage} mobile={GestorMobileRegrasSelecaoPage} />} />
        <Route path="regras-de-horarios/regras" element={<ResponsivePage desktop={GestorAgendaPage} mobile={GestorMobileAgendaPage} />} />
        <Route path="regras-de-horarios/bloqueios" element={<ResponsivePage desktop={GestorBloqueiosPage} mobile={GestorMobileBloqueiosPage} />} />

        {/* Reservas */}
        <Route path="reservas" element={<ResponsivePage desktop={GestorReservasPage} mobile={GestorMobileReservasPage} />} />

        {/* Clientes */}
        <Route path="clientes" element={<ResponsivePage desktop={GestorClientesPage} mobile={GestorMobileClientesPage} />} />

        {/* Relatórios */}
        <Route path="relatorios" element={<ResponsivePage desktop={GestorRelatoriosPage} mobile={GestorMobileRelatoriosPage} />} />

        {/* Financeiro do Gestor */}
        <Route path="financeiro" element={<GestorFinanceiroPage />} />

        {/* Configurações */}
        <Route path="configuracoes" element={<GestorConfiguracoesSelecaoPage />} />
        <Route path="configuracoes/complexo" element={<GestorConfiguracoesPage />} />
        <Route path="configuracoes/quadras" element={<GestorConfiguracoesQuadrasPage />} />

        {/* Ajuda */}
        <Route path="ajuda" element={<GestorAjudaPage />} />
      </Route>

      {/* Qualquer outra rota → volta pro login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
