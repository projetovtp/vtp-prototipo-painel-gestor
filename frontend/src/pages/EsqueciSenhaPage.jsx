// src/pages/EsqueciSenhaPage.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../api/endpoints/authApi"
import { useApiRequest } from "../hooks/useApiRequest"
import "./auth.css"

const EsqueciSenhaPage = () => {
  const navigate = useNavigate()
  const { loading: carregando, executar } = useApiRequest()

  const [email, setEmail] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [tipoMsg, setTipoMsg] = useState("info") // "erro" | "aviso" | "info" | "sucesso"

  const inputEmailRef = useRef(null)

  useEffect(() => {
    inputEmailRef.current?.focus?.()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem("")
    setTipoMsg("info")

    const emailNorm = String(email || "").trim().toLowerCase()
    if (!emailNorm) {
      setTipoMsg("erro")
      setMensagem("Informe seu e-mail.")
      inputEmailRef.current?.focus?.()
      return
    }

    try {
      await executar(() => authApi.esqueciSenha({ email: emailNorm }))
      setTipoMsg("sucesso")
      setMensagem(
        "Se este e-mail estiver cadastrado, enviamos um link de redefinição. Verifique sua caixa de entrada e o spam."
      )
    } catch (err) {
      console.error("[ESQUECI-SENHA] Erro:", err)

      const msgBackend = err?.response?.data?.error
      const raw = String(msgBackend || err?.message || "").toLowerCase()

      if (raw.includes("rate") || raw.includes("muitas") || raw.includes("aguarde")) {
        setTipoMsg("aviso")
        setMensagem("Muitas tentativas. Aguarde alguns minutos e tente novamente.")
      } else {
        setTipoMsg("erro")
        setMensagem(msgBackend || "Não foi possível solicitar a redefinição. Tente novamente.")
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-titulo">Esqueci minha senha</h1>
        <p className="auth-subtitulo">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {mensagem ? (
          <div role="alert" className={`auth-alerta auth-alerta--${tipoMsg}`}>
            {mensagem}
          </div>
        ) : (
          <div className="auth-alerta auth-alerta--info">
            Dica: pode demorar alguns minutos. Verifique também o <strong>spam</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-campo">
            <label htmlFor="email" className="auth-label">E-mail</label>
            <input
              ref={inputEmailRef}
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="Digite seu email"
              autoComplete="email"
              disabled={carregando}
            />
          </div>

          <div className="auth-botoes">
            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={carregando}
              className="auth-btn-secundario"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={carregando}
              className="auth-btn-primario"
            >
              {carregando ? "Enviando..." : "Enviar link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EsqueciSenhaPage
