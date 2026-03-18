// src/pages/LoginPage.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import loginImage from "../assets/23d74f35-26f6-49bd-9d7a-06996653420f (1).png"
import "./auth.css"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [tipoErro, setTipoErro] = useState("erro") // "erro" | "aviso" | "info"
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()
  const inputEmailRef = useRef(null)

  useEffect(() => {
    inputEmailRef.current?.focus?.()
  }, [])

  const normalizarMensagemErro = (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Falha no login. Verifique email/senha e tente novamente."

    const s = String(msg).toLowerCase()

    if (s.includes("senha") && (s.includes("invál") || s.includes("incorre") || s.includes("errad"))) {
      return {
        tipo: "erro",
        titulo: "Senha incorreta",
        texto: "A senha informada não confere. Tente novamente ou clique em \"Esqueci minha senha\".",
        raw: msg,
      }
    }

    if (s.includes("email") && (s.includes("invál") || s.includes("não encontrado") || s.includes("nao encontrado"))) {
      return {
        tipo: "erro",
        titulo: "E-mail não encontrado",
        texto: "Esse e-mail não está cadastrado. Verifique se digitou corretamente.",
        raw: msg,
      }
    }

    if (s.includes("bloque") || s.includes("inativ") || s.includes("desativ")) {
      return {
        tipo: "aviso",
        titulo: "Acesso bloqueado",
        texto: "Seu acesso está bloqueado/inativo. Fale com o administrador para liberar.",
        raw: msg,
      }
    }

    if (s.includes("trocar") && s.includes("senha")) {
      return {
        tipo: "info",
        titulo: "Troca de senha necessária",
        texto: "Para continuar, você precisa redefinir sua senha.",
        raw: msg,
      }
    }

    return {
      tipo: "erro",
      titulo: "Não foi possível entrar",
      texto: msg,
      raw: msg,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro("")
    setTipoErro("erro")
    setCarregando(true)

    try {
      const emailNorm = String(email || "").trim().toLowerCase()

      if (!emailNorm) {
        setTipoErro("erro")
        setErro("Informe seu e-mail.")
        setCarregando(false)
        inputEmailRef.current?.focus?.()
        return
      }

      if (!senha) {
        setTipoErro("erro")
        setErro("Informe sua senha.")
        setCarregando(false)
        return
      }

      const usuario = await login(emailNorm, senha)

      if (usuario?.precisa_trocar_senha) {
        navigate("/trocar-senha")
        return
      }

      if (usuario?.tipo === "admin") {
        navigate("/admin")
      } else if (usuario?.tipo === "gestor") {
        navigate("/gestor")
      } else {
        navigate("/")
      }
    } catch (err) {
      console.error(err)
      const info = normalizarMensagemErro(err)
      setTipoErro(info.tipo)
      setErro(`${info.titulo}: ${info.texto}`)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-imagem">
        <img src={loginImage} alt="VaiTerPlay" />
      </div>

      <div className="login-form-wrapper">
        <div className="login-card">
          <h1 className="login-titulo">VaiTerPlay – Login</h1>

          {erro && (
            <div
              role="alert"
              className={`login-alerta login-alerta--${tipoErro}`}
            >
              <div className="login-alerta-header">
                <div className="login-alerta-icone">
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
                <div className="login-alerta-corpo">
                  <div className="login-alerta-titulo-texto">
                    {erro.includes(":") ? erro.split(":")[0] + ":" : ""}
                  </div>
                  <div className="login-alerta-descricao">
                    {erro.includes(":") ? erro.split(":")[1].trim() : erro}
                  </div>
                </div>
              </div>

              {erro.toLowerCase().includes("senha") && (
                <div className={`login-alerta-acoes login-alerta-acoes--${tipoErro}`}>
                  <button
                    type="button"
                    onClick={() => navigate("/esqueci-senha")}
                    disabled={carregando}
                    className={`login-alerta-btn login-alerta-btn--${tipoErro}`}
                  >
                    Esqueci minha senha
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErro("")
                      setTipoErro("erro")
                      inputEmailRef.current?.focus?.()
                    }}
                    disabled={carregando}
                    className="login-alerta-btn login-alerta-btn--neutro"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-campo">
              <label htmlFor="email" className="auth-label">E-mail</label>
              <input
                ref={inputEmailRef}
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="Digite seu e-mail"
                autoComplete="email"
                disabled={carregando}
              />
            </div>

            <div className="login-campo">
              <label htmlFor="senha" className="auth-label">Senha</label>

              <div className="login-campo-senha-wrapper">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="auth-input login-input-senha"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  disabled={carregando}
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="login-btn-toggle-senha"
                  disabled={carregando}
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              <div className="login-esqueceu">
                <button
                  type="button"
                  onClick={() => navigate("/esqueci-senha")}
                  className="login-btn-esqueceu"
                  disabled={carregando}
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="login-btn-submit"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
