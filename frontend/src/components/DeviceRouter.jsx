// src/components/DeviceRouter.jsx
import { useEffect, useRef } from "react";
import { useDevice } from "../hooks/useDevice";
import GestorLayout from "../layouts/GestorLayout";
import MobileLayout from "../layouts/MobileLayout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function DeviceRouter() {
  const { isMobile, isTablet } = useDevice();
  const usarMobileLayout = isMobile || isTablet;
  const location = useLocation();
  const navigate = useNavigate();
  const eraMobileRef = useRef(usarMobileLayout);

  // Detecta mudança de mobile para desktop e redireciona para dashboard
  useEffect(() => {
    const eraMobile = eraMobileRef.current;
    const agoraEDesktop = !usarMobileLayout;

    // Se estava no mobile e agora está no desktop
    if (eraMobile && agoraEDesktop) {
      // Se estiver em uma rota mobile (mensagens), redireciona para dashboard
      if (location.pathname.includes("/mensagens") || location.pathname.includes("/chat")) {
        navigate("/gestor", { replace: true });
      }
    }

    // Atualiza a referência
    eraMobileRef.current = usarMobileLayout;
  }, [usarMobileLayout, location.pathname, navigate]);

  if (usarMobileLayout) {
    return <MobileLayout><Outlet /></MobileLayout>;
  }
  return <GestorLayout><Outlet /></GestorLayout>;
}
