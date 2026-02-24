// src/pages/gestor/GestorDashboardPageMobile.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/useDevice";

export default function GestorDashboardPageMobile() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();

  useEffect(() => {
    if (isMobile || isTablet) {
      navigate("/gestor/mensagens", { replace: true });
    }
  }, [isMobile, isTablet, navigate]);

  return null;
}
