// src/pages/TrocarSenhaPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TrocarSenhaPage() {
  const navigate = useNavigate();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState("info"); // "erro" | "aviso" | "info" | "sucesso"
  const [carregando, setCarregando] = useState(false);

  const inputAtualRef = useRef(null);

  useEffect(() => {
    inputAtualRef.current?.focus?.();
  }, []);

  function setErro(msg) {
    setTipoMsg("erro");
    setMensagem(msg);
  }

  function validarNovaSenha(s) {
    const senha = String(s || "");
    if (senha.length < 8) return "A nova senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(senha)) return "A nova senha deve ter pelo menos 1 letra maiúscula.";
    if (!/[a-z]/.test(senha)) return "A nova senha deve ter pelo menos 1 letra minúscula.";
    if (!/[0-9]/.test(senha)) return "A nova senha deve ter pelo menos 1 número.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");
    setTipoMsg("info");

    if (!senhaAtual) {
      setErro("Informe sua senha atual.");
      inputAtualRef.current?.focus?.();
      return;
    }

    if (!novaSenha) {
      setErro("Informe a nova senha.");
      return;
    }

    const erroNova = validarNovaSenha(novaSenha);
    if (erroNova) {
      setErro(erroNova);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem. Verifique a confirmação.");
      return;
    }

    if (novaSenha === senhaAtual) {
      setErro("A nova senha precisa ser diferente da senha atual.");
      return;
    }

    setCarregando(true);

    try {
      // ✅ ajuste aqui se seu backend usar outro endpoint
      const { data } = await api.put("/auth/trocar-senha", {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      console.log("[TROCAR-SENHA] OK:", data);

      setTipoMsg("sucesso");
      setMensagem("Senha alterada com sucesso! Você será redirecionado para o login.");

      // limpa campos
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      console.error("[TROCAR-SENHA] Erro:", err);

      const msgBackend = err?.response?.data?.error;

      // mensagens mais claras
      const raw = String(msgBackend || err?.message || "").toLowerCase();

      if (raw.includes("atual") && (raw.includes("incorre") || raw.includes("invál") || raw.includes("inval"))) {
        setErro("Senha atual incorreta. Tente novamente.");
      } else if (raw.includes("token") || raw.includes("unauthor") || err?.response?.status === 401) {
        setErro("Sua sessão expirou. Faça login novamente.");
      } else {
        setErro(msgBackend || "Não foi possível alterar a senha. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  const alertStyle = (() => {
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
  })();

  function CampoSenha({
    id,
    label,
    value,
    onChange,
    mostrar,
    setMostrar,
    placeholder,
    inputRef,
    disabled,
    autoComplete,
  }) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label htmlFor={id} style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
          {label}
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            id={id}
            type={mostrar ? "text" : "password"}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#111827",
              fontSize: 14,
              outline: "none",
              opacity: disabled ? 0.75 : 1,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#37648c";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
            }}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
          />

          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#37648c",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 13,
              whiteSpace: "nowrap",
              opacity: disabled ? 0.7 : 1,
            }}
            disabled={disabled}
            title={mostrar ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrar ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
    );
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
          Trocar senha
        </h1>
        <p style={{ fontSize: 14, marginBottom: 18, textAlign: "center", color: "#6b7280" }}>
          Defina uma nova senha para continuar usando o sistema.
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
              ...alertStyle,
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
            Regras: mínimo 8 caracteres, com maiúscula, minúscula e número.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CampoSenha
            id="senhaAtual"
            label="Senha atual"
            value={senhaAtual}
            onChange={setSenhaAtual}
            mostrar={mostrarAtual}
            setMostrar={setMostrarAtual}
            placeholder="Digite sua senha atual"
            inputRef={inputAtualRef}
            disabled={carregando}
            autoComplete="current-password"
          />

          <CampoSenha
            id="novaSenha"
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            mostrar={mostrarNova}
            setMostrar={setMostrarNova}
            placeholder="Digite a nova senha"
            disabled={carregando}
            autoComplete="new-password"
          />

          <CampoSenha
            id="confirmarSenha"
            label="Confirmar nova senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            mostrar={mostrarConfirmar}
            setMostrar={setMostrarConfirmar}
            placeholder="Digite a nova senha novamente"
            disabled={carregando}
            autoComplete="new-password"
          />

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
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
