// src/pages/ResetarSenhaPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetarSenhaPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const email = (query.get("email") || "").toLowerCase();
  const token = query.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrar1, setMostrar1] = useState(false);
  const [mostrar2, setMostrar2] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState("info"); // erro | aviso | info | sucesso
  const [carregando, setCarregando] = useState(false);

  const inputNovaRef = useRef(null);

  useEffect(() => {
    inputNovaRef.current?.focus?.();
  }, []);

  // 🚨 Se abrir sem token/email → bloqueia fluxo
  useEffect(() => {
    if (!email || !token) {
      setTipoMsg("aviso");
      setMensagem(
        "Link inválido ou incompleto. Solicite um novo link de redefinição de senha."
      );
    }
  }, [email, token]);

  function validarSenha(s) {
    if (s.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Za-z]/.test(s) || !/[0-9]/.test(s))
      return "A senha deve conter letras e números.";
    return "";
  }

  function alertStyle() {
    if (tipoMsg === "sucesso")
      return { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#166534" };
    if (tipoMsg === "aviso")
      return { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#92400e" };
    if (tipoMsg === "info")
      return { background: "rgba(55,100,140,0.1)", border: "1px solid rgba(55,100,140,0.3)", color: "#1e3a5f" };
    return { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#991b1b" };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");

    if (!email || !token) {
      setTipoMsg("aviso");
      setMensagem("Link inválido. Solicite um novo link.");
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      setTipoMsg("erro");
      setMensagem("Informe e confirme a nova senha.");
      return;
    }

    const err = validarSenha(novaSenha);
    if (err) {
      setTipoMsg("erro");
      setMensagem(err);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setTipoMsg("erro");
      setMensagem("As senhas não conferem.");
      return;
    }

    setCarregando(true);
    try {
      await api.post("/auth/resetar-senha", {
        email,
        token,
        novaSenha,
        confirmarSenha,
      });

      setTipoMsg("sucesso");
      setMensagem("Senha redefinida com sucesso! Você já pode fazer login.");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Falha ao redefinir senha. O link pode ter expirado.";

      const raw = msg.toLowerCase();

      if (raw.includes("expir") || raw.includes("token")) {
        setTipoMsg("aviso");
        setMensagem(
          "Este link expirou ou já foi utilizado. Solicite um novo link."
        );
      } else {
        setTipoMsg("erro");
        setMensagem(msg);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", fontSize: 22, color: "#37648c" }}>Redefinir senha</h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
          Defina uma nova senha para sua conta.
        </p>

        {mensagem && (
          <div style={{ ...alertStyle(), padding: 12, borderRadius: 12, marginBottom: 14 }}>
            {mensagem}

            {(tipoMsg === "aviso" || tipoMsg === "erro") && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => navigate("/esqueci-senha")} style={linkBtn}>
                  Solicitar novo link
                </button>
              </div>
            )}

            {tipoMsg === "sucesso" && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => navigate("/login")} style={linkBtn}>
                  Ir para login
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CampoSenha
            label="Nova senha"
            value={novaSenha}
            setValue={setNovaSenha}
            mostrar={mostrar1}
            setMostrar={setMostrar1}
            inputRef={inputNovaRef}
            disabled={carregando}
          />

          <CampoSenha
            label="Confirmar senha"
            value={confirmarSenha}
            setValue={setConfirmarSenha}
            mostrar={mostrar2}
            setMostrar={setMostrar2}
            disabled={carregando}
          />

          <button 
            type="submit" 
            disabled={carregando} 
            style={submitBtn(carregando)}
            onMouseEnter={(e) => {
              if (!carregando) e.target.style.background = "#2d5070";
            }}
            onMouseLeave={(e) => {
              if (!carregando) e.target.style.background = "#37648c";
            }}
          >
            {carregando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CampoSenha({ label, value, setValue, mostrar, setMostrar, inputRef, disabled }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: "#111827" }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = "#37648c";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
          }}
        />
        <button type="button" onClick={() => setMostrar(v => !v)} style={eyeBtn}>
          {mostrar ? "Ocultar" : "Ver"}
        </button>
      </div>
    </div>
  );
}

/* ===== estilos ===== */

const wrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ffffff",
  padding: 16,
};

const cardStyle = {
  width: "100%",
  maxWidth: 460,
  padding: 24,
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  color: "#111827",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const inputStyle = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  outline: "none",
};

const eyeBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#37648c",
  cursor: "pointer",
};

const submitBtn = (loading) => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 999,
  border: "none",
  fontWeight: 700,
  cursor: loading ? "not-allowed" : "pointer",
  background: "#37648c",
  color: "#ffffff",
  opacity: loading ? 0.75 : 1,
});

const linkBtn = {
  background: "transparent",
  border: "none",
  color: "#37648c",
  cursor: "pointer",
  textDecoration: "underline",
  fontWeight: 700,
};
