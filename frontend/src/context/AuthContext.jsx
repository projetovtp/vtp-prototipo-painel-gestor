// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Função para carregar usuário do localStorage
  const carregarUsuario = () => {
    const token = localStorage.getItem("vaiterplay_token");
    const userJson = localStorage.getItem("vaiterplay_usuario");

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setUsuario(user);
        return true;
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage", e);
        localStorage.removeItem("vaiterplay_token");
        localStorage.removeItem("vaiterplay_usuario");
        setUsuario(null);
        return false;
      }
    }
    setUsuario(null);
    return false;
  };

  useEffect(() => {
    carregarUsuario();
    setCarregando(false);
  }, []);

  // Sincroniza o estado com localStorage quando há mudanças em outras abas
  useEffect(() => {
    const handleStorageChange = () => {
      carregarUsuario();
    };

    // Escuta mudanças no localStorage (de outras abas)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });

    const { token, usuario: dadosUsuario } = response.data;

    // NORMALIZA o tipo para minúsculo: "ADMIN" -> "admin", "GESTOR" -> "gestor"
    const usuarioNormalizado = {
      ...dadosUsuario,
      tipo: (dadosUsuario.tipo || "").toLowerCase(),
    };

    localStorage.setItem("vaiterplay_token", token);
    localStorage.setItem(
      "vaiterplay_usuario",
      JSON.stringify(usuarioNormalizado)
    );
    setUsuario(usuarioNormalizado);

    return usuarioNormalizado;
  }

  function logout() {
    localStorage.removeItem("vaiterplay_token");
    localStorage.removeItem("vaiterplay_usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        login,
        logout,
        estaAutenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
