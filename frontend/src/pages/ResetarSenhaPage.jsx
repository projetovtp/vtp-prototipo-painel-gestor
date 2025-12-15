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
      return { background: "#052e16", border: "1px solid #166534", color: "#86efac" };
    if (tipoMsg === "aviso")
      return { background: "#451a03", border: "1px solid #92400e", color: "#fde68a" };
    if (tipoMsg === "info")
      return { background: "#020617", border: "1px solid #1f2937", color: "#bfdbfe" };
    return { background: "#450a0a", border: "1px solid #7f1d1d", color: "#fca5a5" };
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
        <h1 style={{ textAlign: "center", fontSize: 22 }}>Redefinir senha</h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
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

          <button type="submit" disabled={carregando} style={submitBtn(carregando)}>
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
      <label style={{ fontSize: 13 }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type={mostrar ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          disabled={disabled}
          style={inputStyle}
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
  background: "#0f172a",
  padding: 16,
};

const cardStyle = {
  width: "100%",
  maxWidth: 460,
  padding: 24,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #1f2937",
  color: "#f9fafb",
};

const inputStyle = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#020617",
  color: "#f9fafb",
};

const eyeBtn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#f9fafb",
  cursor: "pointer",
};

const submitBtn = (loading) => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 999,
  border: "none",
  fontWeight: 900,
  cursor: loading ? "not-allowed" : "pointer",
  background:
    "linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #22c55e 100%)",
  color: "#020617",
  opacity: loading ? 0.75 : 1,
});

const linkBtn = {
  background: "transparent",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  textDecoration: "underline",
  fontWeight: 700,
};
