// src/pages/TrocarSenhaPage.jsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../api/endpoints/authApi"
import { useApiRequest } from "../hooks/useApiRequest"
import { useAuth } from "../context/AuthContext"
import { validarSenha } from "../utils/validacoes"
import CampoSenha from "../components/ui/CampoSenha"
import "./auth.css"

const TrocarSenhaPage = () => {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const { loading: carregando, executar } = useApiRequest()

  const rotaDashboard = usuario?.tipo === "admin" ? "/admin" : "/gestor"

  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [mostrarAtual, setMostrarAtual] = useState(false)
  const [mostrarNova, setMostrarNova] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  const [mensagem, setMensagem] = useState("")
  const [tipoMsg, setTipoMsg] = useState("info")

  const inputAtualRef = useRef(null)

  useEffect(() => {
    inputAtualRef.current?.focus?.()
  }, [])

  const setErro = (msg) => {
    setTipoMsg("erro")
    setMensagem(msg)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem("")
    setTipoMsg("info")

    if (!senhaAtual) {
      setErro("Informe sua senha atual.")
      inputAtualRef.current?.focus?.()
      return
    }

    if (!novaSenha) {
      setErro("Informe a nova senha.")
      return
    }

    const erroNova = validarSenha(novaSenha)
    if (erroNova) {
      setErro(erroNova)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem. Verifique a confirmação.")
      return
    }

    if (novaSenha === senhaAtual) {
      setErro("A nova senha precisa ser diferente da senha atual.")
      return
    }

    try {
      await executar(() =>
        authApi.trocarSenha({ senha_atual: senhaAtual, nova_senha: novaSenha })
      )

      setTipoMsg("sucesso")
      setMensagem("Senha alterada com sucesso! Você será redirecionado para o login.")

      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")

      setTimeout(() => {
        logout()
        navigate("/login")
      }, 900)
    } catch (err) {
      console.error("[TROCAR-SENHA] Erro:", err)

      const msgBackend = err?.response?.data?.error
      const raw = String(msgBackend || err?.message || "").toLowerCase()

      if (raw.includes("atual") && (raw.includes("incorre") || raw.includes("invál") || raw.includes("inval"))) {
        setErro("Senha atual incorreta. Tente novamente.")
      } else if (raw.includes("token") || raw.includes("unauthor") || err?.response?.status === 401) {
        setErro("Sua sessão expirou. Faça login novamente.")
      } else {
        setErro(msgBackend || "Não foi possível alterar a senha. Tente novamente.")
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-titulo">Trocar senha</h1>
        <p className="auth-subtitulo">
          Defina uma nova senha para continuar usando o sistema.
        </p>

        {mensagem ? (
          <div role="alert" className={`auth-alerta auth-alerta--${tipoMsg}`}>
            {mensagem}
          </div>
        ) : (
          <div className="auth-alerta auth-alerta--info">
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

          <div className="auth-botoes">
            <button
              type="button"
              onClick={() => navigate(rotaDashboard)}
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
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TrocarSenhaPage
