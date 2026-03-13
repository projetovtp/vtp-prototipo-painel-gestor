import { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";
import { setLogoutCallback } from "../api/interceptors";

const TOKEN_KEY = "vaiterplay_token";
const USER_KEY = "vaiterplay_usuario";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
    return () => setLogoutCallback(null);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setUsuario(user);
      } catch {
        logout();
      }
    }

    setCarregando(false);

    if (token) {
      apiClient.get("/auth/validar-token").catch(() => {
        // 401 handled by interceptor (calls logout); other errors ignored
      });
    }
  }, [logout]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== TOKEN_KEY && e.key !== USER_KEY) return;

      const token = localStorage.getItem(TOKEN_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (token && userJson) {
        try {
          setUsuario(JSON.parse(userJson));
        } catch {
          logout();
        }
      } else {
        setUsuario(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout]);

  const login = useCallback(async (email, senha) => {
    const response = await apiClient.post("/auth/login", { email, senha });
    const { token, usuario: dadosUsuario } = response.data;

    const usuarioNormalizado = {
      ...dadosUsuario,
      tipo: (dadosUsuario.tipo || "").toLowerCase(),
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuarioNormalizado));
    setUsuario(usuarioNormalizado);

    return usuarioNormalizado;
  }, []);

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
