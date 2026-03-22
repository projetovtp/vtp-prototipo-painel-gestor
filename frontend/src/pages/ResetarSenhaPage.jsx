// src/pages/ResetarSenhaPage.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { authApi } from "../api/endpoints/authApi"
import { useApiRequest } from "../hooks/useApiRequest"
import { validarSenha } from "../utils/validacoes"
import CampoSenha from "../components/ui/CampoSenha"
import "./auth.css"

const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const ResetarSenhaPage = () => {
  const query = useQuery()
  const navigate = useNavigate()
  const { loading: carregando, executar } = useApiRequest()

  const email = (query.get("email") || "").toLowerCase()
  const token = query.get("token") || ""

  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [mostrar1, setMostrar1] = useState(false)
  const [mostrar2, setMostrar2] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [tipoMsg, setTipoMsg] = useState("info")

  const inputNovaRef = useRef(null)

  useEffect(() => {
    inputNovaRef.current?.focus?.()
  }, [])

  useEffect(() => {
    if (!email || !token) {
      setTipoMsg("aviso")
      setMensagem("Link inválido ou incompleto. Solicite um novo link de redefinição de senha.")
    }
  }, [email, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem("")

    if (!email || !token) {
      setTipoMsg("aviso")
      setMensagem("Link inválido. Solicite um novo link.")
      return
    }

    if (!novaSenha || !confirmarSenha) {
      setTipoMsg("erro")
      setMensagem("Informe e confirme a nova senha.")
      return
    }

    const errValidacao = validarSenha(novaSenha)
    if (errValidacao) {
      setTipoMsg("erro")
      setMensagem(errValidacao)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setTipoMsg("erro")
      setMensagem("As senhas não conferem.")
      return
    }

    try {
      await executar(() => authApi.resetarSenha({ email, token, novaSenha, confirmarSenha }))
      setTipoMsg("sucesso")
      setMensagem("Senha redefinida com sucesso! Você já pode fazer login.")
    } catch (err) {
      const msg = err?.response?.data?.error || "Falha ao redefinir senha. O link pode ter expirado."
      const raw = msg.toLowerCase()

      if (raw.includes("expir") || raw.includes("token")) {
        setTipoMsg("aviso")
        setMensagem("Este link expirou ou já foi utilizado. Solicite um novo link.")
      } else {
        setTipoMsg("erro")
        setMensagem(msg)
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-titulo">Redefinir senha</h1>
        <p className="auth-subtitulo">Defina uma nova senha para sua conta.</p>

        {mensagem && (
          <div className={`auth-alerta auth-alerta--${tipoMsg}`}>
            {mensagem}

            {(tipoMsg === "aviso" || tipoMsg === "erro") && (
              <div className="auth-alerta-acao">
                <button
                  onClick={() => navigate("/esqueci-senha")}
                  className="auth-link-btn"
                >
                  Solicitar novo link
                </button>
              </div>
            )}

            {tipoMsg === "sucesso" && (
              <div className="auth-alerta-acao">
                <button
                  onClick={() => navigate("/login")}
                  className="auth-link-btn"
                >
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
            onChange={setNovaSenha}
            mostrar={mostrar1}
            setMostrar={setMostrar1}
            inputRef={inputNovaRef}
            disabled={carregando}
          />

          <CampoSenha
            label="Confirmar senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            mostrar={mostrar2}
            setMostrar={setMostrar2}
            disabled={carregando}
          />

          <button
            type="submit"
            disabled={carregando}
            className="auth-btn-primario auth-btn-primario--full"
          >
            {carregando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetarSenhaPage
