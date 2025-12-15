// src/pages/LoginPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // aviso principal (mais chamativo)
  const [erro, setErro] = useState("");
  const [tipoErro, setTipoErro] = useState("erro"); // "erro" | "aviso" | "info"

  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const inputEmailRef = useRef(null);

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
        background: "rgba(59,130,246,0.12)",
        border: "1px solid rgba(59,130,246,0.35)",
        color: "#bfdbfe",
      };
    }
    if (tipoErro === "aviso") {
      return {
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.35)",
        color: "#fde68a",
      };
    }
    return {
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.35)",
      color: "#fecaca",
    };
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        color: "#f9fafb",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 16,
          backgroundColor: "#020617",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          border: "1px solid #1f2937",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>
          VaiTerPlay – Login
        </h1>
        <p
          style={{
            fontSize: 14,
            marginBottom: 18,
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          Acesse com seu usuário <strong>Admin</strong> ou <strong>Gestor</strong>
        </p>

        {/* AVISO MAIS CLARO / CHAMATIVO */}
        {erro && (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.35,
              ...alertStyle,
            }}
          >
            {erro}
            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                disabled={carregando}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #374151",
                  backgroundColor: "#0b1220",
                  color: "#f9fafb",
                  cursor: carregando ? "not-allowed" : "pointer",
                  fontSize: 12,
                  opacity: carregando ? 0.7 : 1,
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
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #374151",
                  backgroundColor: "transparent",
                  color: "#cbd5e1",
                  cursor: carregando ? "not-allowed" : "pointer",
                  fontSize: 12,
                  opacity: carregando ? 0.7 : 1,
                }}
              >
                Tentar novamente
              </button>
            </div>
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
                border: "1px solid #374151",
                backgroundColor: "#020617",
                color: "#f9fafb",
                fontSize: 14,
                outline: "none",
              }}
              placeholder="admin@vaiterplay.com"
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

            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #374151",
                  backgroundColor: "#020617",
                  color: "#f9fafb",
                  fontSize: 14,
                  outline: "none",
                }}
                placeholder="Sua senha"
                autoComplete="current-password"
                disabled={carregando}
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #374151",
                  backgroundColor: "#0b1220",
                  color: "#f9fafb",
                  cursor: carregando ? "not-allowed" : "pointer",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  opacity: carregando ? 0.7 : 1,
                }}
                disabled={carregando}
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <div style={{ marginTop: 10, textAlign: "right" }}>
              <button
                type="button"
                onClick={() => navigate("/esqueci-senha")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
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
              background:
                "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)",
              color: "#020617",
              opacity: carregando ? 0.7 : 1,
              marginTop: 6,
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* ajuda discreta */}
        <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
          Dica: se você redefiniu a senha do Admin agora, tente entrar novamente com a senha nova.
        </div>
      </div>
    </div>
  );
}
