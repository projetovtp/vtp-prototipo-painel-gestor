import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "./ui";

const RotaPrivada = ({ children, role }) => {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <LoadingSpinner fullPage />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && usuario.tipo !== role) {
    if (usuario.tipo === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.tipo === "gestor") {
      return <Navigate to="/gestor" replace />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RotaPrivada;
