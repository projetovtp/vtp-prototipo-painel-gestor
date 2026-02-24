// src/pages/EsqueciSenhaPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EsqueciSenhaPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState("info"); // "erro" | "aviso" | "info" | "sucesso"

  const inputEmailRef = useRef(null);

  useEffect(() => {
    inputEmailRef.current?.focus?.();
  }, []);

  function alertStyle() {
    if (!mensagem) return {};
    if (tipoMsg === "sucesso") {
      return {
        background: "rgba(34,197,94,0.1)",
        border: "1px solid rgba(34,197,94,0.3)",
        color: "#166534",
      };
    }
    if (tipoMsg === "aviso") {
      return {
        background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.3)",
        color: "#92400e",
      };
    }
    if (tipoMsg === "info") {
      return {
        background: "rgba(55,100,140,0.1)",
        border: "1px solid rgba(55,100,140,0.3)",
        color: "#1e3a5f",
      };
    }
    return {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#991b1b",
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");
    setTipoMsg("info");

    const emailNorm = String(email || "").trim().toLowerCase();
    if (!emailNorm) {
      setTipoMsg("erro");
      setMensagem("Informe seu e-mail.");
      inputEmailRef.current?.focus?.();
      return;
    }

    setCarregando(true);

    try {
      // ✅ Ajuste aqui se seu backend usa outro endpoint
      await api.post("/auth/esqueci-senha", { email: emailNorm });

      // Segurança: não revelar se existe ou não
      setTipoMsg("sucesso");
      setMensagem(
        "Se este e-mail estiver cadastrado, enviamos um link de redefinição. Verifique sua caixa de entrada e o spam."
      );
    } catch (err) {
      console.error("[ESQUECI-SENHA] Erro:", err);

      const msgBackend = err?.response?.data?.error;
      const raw = String(msgBackend || err?.message || "").toLowerCase();

      if (raw.includes("rate") || raw.includes("muitas") || raw.includes("aguarde")) {
        setTipoMsg("aviso");
        setMensagem("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setTipoMsg("erro");
        setMensagem(msgBackend || "Não foi possível solicitar a redefinição. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        color: "#111827",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 24,
          borderRadius: 16,
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 8, textAlign: "center", color: "#37648c" }}>
          Esqueci minha senha
        </h1>
        <p style={{ fontSize: 14, marginBottom: 18, textAlign: "center", color: "#6b7280" }}>
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {mensagem ? (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.35,
              ...alertStyle(),
            }}
          >
            {mensagem}
          </div>
        ) : (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.35,
              background: "rgba(55,100,140,0.1)",
              border: "1px solid rgba(55,100,140,0.3)",
              color: "#1e3a5f",
            }}
          >
            Dica: pode demorar alguns minutos. Verifique também o <strong>spam</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
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
                opacity: carregando ? 0.75 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#37648c";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
              }}
              placeholder="Digite seu email"
              autoComplete="email"
              disabled={carregando}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={carregando}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                fontSize: 14,
                fontWeight: 600,
                cursor: carregando ? "not-allowed" : "pointer",
                background: "transparent",
                color: "#6b7280",
                opacity: carregando ? 0.7 : 1,
              }}
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={carregando}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 999,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: carregando ? "not-allowed" : "pointer",
                background: "#37648c",
                color: "#ffffff",
                opacity: carregando ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!carregando) e.target.style.background = "#2d5070";
              }}
              onMouseLeave={(e) => {
                if (!carregando) e.target.style.background = "#37648c";
              }}
            >
              {carregando ? "Enviando..." : "Enviar link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
