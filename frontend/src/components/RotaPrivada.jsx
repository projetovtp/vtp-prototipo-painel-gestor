// src/components/RotaPrivada.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RotaPrivada({ children, role }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }

  if (!usuario) {
    // Não logado → manda para /login
    return <Navigate to="/login" replace />;
  }

  if (role && usuario.tipo !== role) {
    // Logado mas tipo errado → poderia mandar pra home adequada
    // Aqui vou mandar pra /login só para simplificar
    return <Navigate to="/login" replace />;
  }

  return children;
}
