import { useState, useCallback } from "react"
import { useApiRequest } from "../useApiRequest"
import {
  mockContatos,
  mockNovaReserva,
  gerarNotificacoes,
  contarNotificacoesPendentes,
} from "../../mocks/mockNotificacoes"

// TODO: criar gestorNotificacoesApi.js e substituir o mock quando o endpoint estiver pronto
export const useNotificacoes = () => {
  const { executar, limparErro } = useApiRequest()

  const [contatos, setContatos] = useState(mockContatos)
  const [novaReserva, setNovaReserva] = useState(mockNovaReserva)
  const [notificacoes, setNotificacoes] = useState(() => gerarNotificacoes())
  const [totalPendentes, setTotalPendentes] = useState(() => contarNotificacoesPendentes())

  const carregar = useCallback(async () => {
    try {
      // TODO: substituir por chamada real quando gestorNotificacoesApi.listar() estiver pronto
      // const data = await executar(() => gestorNotificacoesApi.listar())
      // setContatos(data.contatos ?? mockContatos)
      // setNovaReserva(data.novaReserva ?? mockNovaReserva)
      limparErro()
      const notifs = gerarNotificacoes()
      setNotificacoes(notifs)
      setTotalPendentes(contarNotificacoesPendentes())
    } catch {
      limparErro()
    }
  }, [executar, limparErro])

  const marcarComoLida = useCallback((id) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    )
    setTotalPendentes((prev) => Math.max(0, prev - 1))
  }, [])

  return {
    contatos,
    novaReserva,
    notificacoes,
    totalPendentes,
    carregar,
    marcarComoLida,
  }
}
