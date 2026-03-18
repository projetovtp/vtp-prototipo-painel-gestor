// src/App.jsx
import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { setNavigate } from "./api/interceptors";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { LoadingSpinner } from "./components/ui";

import AdminLayout from "./layouts/AdminLayout";
import ResponsivePage from "./components/ResponsivePage";
import RotaPrivada from "./components/RotaPrivada";
import DeviceRouter from "./components/DeviceRouter";

// Lazy pages - Admin
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminGestoresPage = lazy(() => import("./pages/admin/AdminGestoresPage"));
const AdminEmpresasPage = lazy(() => import("./pages/admin/AdminEmpresasPage"));
const AdminQuadrasPage = lazy(() => import("./pages/admin/AdminQuadrasPage"));
const AdminAgendaPage = lazy(() => import("./pages/admin/AdminAgendaPage"));
const AdminReservasPage = lazy(() => import("./pages/admin/AdminReservasPage"));
const AdminFinanceiroPage = lazy(() => import("./pages/admin/AdminFinanceiroPage"));
const AdminRepassesPage = lazy(() => import("./pages/admin/AdminRepassesPage"));

// Lazy pages - Gestor
const GestorDashboardPage = lazy(() => import("./pages/gestor/GestorDashboardPage"));
const GestorEmpresasPage = lazy(() => import("./pages/gestor/GestorEmpresasPage"));
const GestorQuadrasPage = lazy(() => import("./pages/gestor/GestorQuadrasPage"));
const GestorQuadrasListPage = lazy(() => import("./pages/gestor/GestorQuadrasListPage"));
const GestorQuadraEditarPage = lazy(() => import("./pages/gestor/GestorQuadraEditarPage"));
const GestorEmpresaEditarPage = lazy(() => import("./pages/gestor/GestorEmpresaEditarPage"));
const GestorReservasPage = lazy(() => import("./pages/gestor/GestorReservasPage"));
const GestorFinanceiroPage = lazy(() => import("./pages/gestor/GestorFinanceiroPage"));
const GestorClientesPage = lazy(() => import("./pages/gestor/GestorClientesPage"));
const GestorRelatoriosPage = lazy(() => import("./pages/gestor/GestorRelatoriosPage"));
const GestorConfiguracoesPage = lazy(() => import("./pages/gestor/GestorConfiguracoesPage"));
const GestorConfiguracoesQuadrasPage = lazy(() => import("./pages/gestor/GestorConfiguracoesQuadrasPage"));
const GestorConfiguracoesSelecaoPage = lazy(() => import("./pages/gestor/GestorConfiguracoesSelecaoPage"));
const GestorAjudaPage = lazy(() => import("./pages/gestor/GestorAjudaPage"));
const GestorRegrasSelecaoPage = lazy(() => import("./pages/gestor/GestorRegrasSelecaoPage"));
const GestorAgendaPage = lazy(() => import("./pages/gestor/GestorAgendaPage"));
const GestorBloqueiosPage = lazy(() => import("./pages/gestor/GestorBloqueiosPage"));

// Lazy pages - Mobile
const GestorMobileMensagensPage = lazy(() => import("./pages/gestor/mobile/GestorMobileMensagensPage"));
const GestorMobileChatPage = lazy(() => import("./pages/gestor/mobile/GestorMobileChatPage"));
const GestorMobileClientesPage = lazy(() => import("./pages/gestor/mobile/GestorMobileClientesPage"));
const GestorMobileRelatoriosPage = lazy(() => import("./pages/gestor/mobile/GestorMobileRelatoriosPage"));
const GestorMobileReservasPage = lazy(() => import("./pages/gestor/mobile/GestorMobileReservasPage"));
const GestorMobileRegrasSelecaoPage = lazy(() => import("./pages/gestor/mobile/GestorMobileRegrasSelecaoPage"));
const GestorMobileAgendaPage = lazy(() => import("./pages/gestor/mobile/GestorMobileAgendaPage"));
const GestorMobileBloqueiosPage = lazy(() => import("./pages/gestor/mobile/GestorMobileBloqueiosPage"));

// Lazy pages - Auth/Public
const LoginPage = lazy(() => import("./pages/LoginPage"));
const EsqueciSenhaPage = lazy(() => import("./pages/EsqueciSenhaPage"));
const ResetarSenhaPage = lazy(() => import("./pages/ResetarSenhaPage"));
const TrocarSenhaPage = lazy(() => import("./pages/TrocarSenhaPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Telas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
        <Route path="/nova-senha" element={<ResetarSenhaPage />} />
        <Route
          path="/trocar-senha"
          element={
            <RotaPrivada>
              <TrocarSenhaPage />
            </RotaPrivada>
          }
        />

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
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
