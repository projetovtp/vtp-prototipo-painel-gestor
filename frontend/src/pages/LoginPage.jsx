// src/pages/LoginPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginImage from "../assets/23d74f35-26f6-49bd-9d7a-06996653420f (1).png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // aviso principal (mais chamativo)
  const [erro, setErro] = useState("");
  const [tipoErro, setTipoErro] = useState("erro"); // "erro" | "aviso" | "info"

  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const navigate = useNavigate();
  const { login } = useAuth();

  const inputEmailRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // foca no email ao abrir
    inputEmailRef.current?.focus?.();
  }, []);

  function normalizarMensagemErro(err) {
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Falha no login. Verifique email/senha e tente novamente.";

    const s = String(msg).toLowerCase();

    // heurísticas simples pra deixar mais claro pro usuário
    // (sem depender do backend mudar mensagens)
    if (s.includes("senha") && (s.includes("invál") || s.includes("incorre") || s.includes("errad"))) {
      return {
        tipo: "erro",
        titulo: "Senha incorreta",
        texto: "A senha informada não confere. Tente novamente ou clique em “Esqueci minha senha”.",
        raw: msg,
      };
    }

    if (s.includes("email") && (s.includes("invál") || s.includes("não encontrado") || s.includes("nao encontrado"))) {
      return {
        tipo: "erro",
        titulo: "E-mail não encontrado",
        texto: "Esse e-mail não está cadastrado. Verifique se digitou corretamente.",
        raw: msg,
      };
    }

    if (s.includes("bloque") || s.includes("inativ") || s.includes("desativ")) {
      return {
        tipo: "aviso",
        titulo: "Acesso bloqueado",
        texto: "Seu acesso está bloqueado/inativo. Fale com o administrador para liberar.",
        raw: msg,
      };
    }

    if (s.includes("trocar") && s.includes("senha")) {
      return {
        tipo: "info",
        titulo: "Troca de senha necessária",
        texto: "Para continuar, você precisa redefinir sua senha.",
        raw: msg,
      };
    }

    return {
      tipo: "erro",
      titulo: "Não foi possível entrar",
      texto: msg,
      raw: msg,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErro("");
    setTipoErro("erro");
    setCarregando(true);

    try {
      const emailNorm = String(email || "").trim().toLowerCase();

      if (!emailNorm) {
        setTipoErro("erro");
        setErro("Informe seu e-mail.");
        setCarregando(false);
        inputEmailRef.current?.focus?.();
        return;
      }

      if (!senha) {
        setTipoErro("erro");
        setErro("Informe sua senha.");
        setCarregando(false);
        return;
      }

      const usuario = await login(emailNorm, senha);

      // 1) Se for obrigado trocar senha, vai pra tela específica
      if (usuario?.precisa_trocar_senha) {
        navigate("/trocar-senha");
        return;
      }

      // 2) Redireciona por tipo (backend já devolve "admin" / "gestor")
      if (usuario?.tipo === "admin") {
        navigate("/admin");
      } else if (usuario?.tipo === "gestor") {
        navigate("/gestor");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const info = normalizarMensagemErro(err);
      setTipoErro(info.tipo);
      setErro(`${info.titulo}: ${info.texto}`);
    } finally {
      setCarregando(false);
    }
  }

  const alertStyle = (() => {
    if (tipoErro === "info") {
      return {
        background: "rgba(55,100,140,0.1)",
        border: "1px solid rgba(55,100,140,0.3)",
        color: "#1e3a5f",
      };
    }
    if (tipoErro === "aviso") {
      return {
        background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.3)",
        color: "#92400e",
      };
    }
    return {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#991b1b",
    };
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#ffffff",
        color: "#111827",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Imagem - 2/3 da tela (apenas em desktop) */}
      {!isMobile && (
        <div
          style={{
            width: "66.666%",
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={loginImage}
            alt="VaiTerPlay"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Container do Login - 1/3 da tela (desktop) ou 100% (mobile) */}
      <div
        style={{
          width: isMobile ? "100%" : "33.333%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "24px 16px" : "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: 24,
            borderRadius: 16,
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
        <h1 style={{ fontSize: 24, marginBottom: 20, textAlign: "center", color: "#37648c" }}>
          VaiTerPlay – Login
        </h1>

        {/* AVISO MAIS CLARO / CHAMATIVO */}
        {erro && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: "16px",
              borderRadius: 12,
              fontSize: 14,
              lineHeight: 1.5,
              ...alertStyle,
              borderLeft: "4px solid",
              borderLeftColor: tipoErro === "erro" ? "#dc2626" : tipoErro === "aviso" ? "#f59e0b" : "#37648c",
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: 12,
              marginBottom: erro.includes("Esqueci minha senha") ? 12 : 0
            }}>
              <div style={{ 
                flexShrink: 0,
                marginTop: 2
              }}>
                {tipoErro === "erro" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                ) : tipoErro === "aviso" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: erro.includes(":") ? 4 : 0,
                  fontSize: 14
                }}>
                  {erro.includes(":") ? erro.split(":")[0] + ":" : ""}
                </div>
                <div style={{ fontSize: 13 }}>
                  {erro.includes(":") ? erro.split(":")[1].trim() : erro}
                </div>
              </div>
            </div>
            {erro.toLowerCase().includes("senha") && (
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12,
                borderTop: "1px solid",
                borderTopColor: tipoErro === "erro" ? "rgba(220, 38, 38, 0.2)" : tipoErro === "aviso" ? "rgba(245, 158, 11, 0.2)" : "rgba(55, 100, 140, 0.2)",
                display: "flex", 
                gap: 10, 
                flexWrap: "wrap" 
              }}>
                <button
                  type="button"
                  onClick={() => navigate("/esqueci-senha")}
                  disabled={carregando}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: tipoErro === "erro" ? "#dc2626" : tipoErro === "aviso" ? "#f59e0b" : "#37648c",
                    backgroundColor: "transparent",
                    color: tipoErro === "erro" ? "#dc2626" : tipoErro === "aviso" ? "#f59e0b" : "#37648c",
                    cursor: carregando ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: carregando ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = tipoErro === "erro" ? "rgba(220, 38, 38, 0.1)" : tipoErro === "aviso" ? "rgba(245, 158, 11, 0.1)" : "rgba(55, 100, 140, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  Esqueci minha senha
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErro("");
                    setTipoErro("erro");
                    inputEmailRef.current?.focus?.();
                  }}
                  disabled={carregando}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    backgroundColor: "transparent",
                    color: "#6b7280",
                    cursor: carregando ? "not-allowed" : "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    opacity: carregando ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.borderColor = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!carregando) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.borderColor = "#d1d5db";
                    }
                  }}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 4, fontSize: 14 }}
            >
              E-mail
            </label>
            <input
              ref={inputEmailRef}
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#111827",
                fontSize: 14,
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#37648c";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
              }}
              placeholder="Digite seu e-mail"
              autoComplete="email"
              disabled={carregando}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="senha"
              style={{ display: "block", marginBottom: 4, fontSize: 14 }}
            >
              Senha
            </label>

            <div 
              style={{ 
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}
            >
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 45px 10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#37648c";
                  e.target.parentElement.style.borderColor = "#37648c";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.parentElement.style.borderColor = "#d1d5db";
                }}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={carregando}
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                style={{
                  position: "absolute",
                  right: "8px",
                  padding: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#37648c",
                  cursor: carregando ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: carregando ? 0.7 : 1,
                }}
                disabled={carregando}
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <div style={{ marginTop: 10, textAlign: "right" }}>
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#37648c",
                  cursor: carregando ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                  fontSize: 13,
                  padding: 0,
                  opacity: carregando ? 0.7 : 1,
                }}
                disabled={carregando}
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 999,
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              cursor: carregando ? "not-allowed" : "pointer",
              background: "#37648c",
              color: "#ffffff",
              opacity: carregando ? 0.7 : 1,
              marginTop: 6,
            }}
            onMouseEnter={(e) => {
              if (!carregando) e.target.style.background = "#2d5070";
            }}
            onMouseLeave={(e) => {
              if (!carregando) e.target.style.background = "#37648c";
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
