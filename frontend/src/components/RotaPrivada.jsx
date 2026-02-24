// src/components/RotaPrivada.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function RotaPrivada({ children, role }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Aguarda um pouco para garantir que o AuthContext terminou de carregar
    if (!carregando) {
      const timer = setTimeout(() => {
        setVerificando(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [carregando]);

  if (carregando || verificando) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }

  // Verifica se há token no localStorage mesmo que o usuário não esteja no estado
  const token = localStorage.getItem("vaiterplay_token");
  const userJson = localStorage.getItem("vaiterplay_usuario");
  
  // Se não há usuário no estado mas há token, tenta recuperar do localStorage
  let usuarioAtual = usuario;
  if (!usuarioAtual && token && userJson) {
    try {
      usuarioAtual = JSON.parse(userJson);
    } catch (e) {
      // Se não conseguir parsear, remove e redireciona
      localStorage.removeItem("vaiterplay_token");
      localStorage.removeItem("vaiterplay_usuario");
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  if (!usuarioAtual && !token) {
    // Não logado → manda para /login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && usuarioAtual && usuarioAtual.tipo !== role) {
    // Logado mas tipo errado → redireciona para a home adequada
    if (usuarioAtual.tipo === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (usuarioAtual.tipo === "gestor") {
      return <Navigate to="/gestor" replace />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
