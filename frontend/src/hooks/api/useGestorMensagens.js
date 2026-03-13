import { useState, useCallback } from "react";
import { gestorMensagensApi } from "../../api/endpoints/gestorMensagensApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorMensagens() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [conversas, setConversas] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [historicoReservas, setHistoricoReservas] = useState([]);

  const listarConversas = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorMensagensApi.listarConversas(params),
      );
      setConversas(data);
      return data;
    },
    [executar],
  );

  const obterMensagens = useCallback(
    async (conversaId) => {
      const data = await executar(() =>
        gestorMensagensApi.obterMensagens(conversaId),
      );
      setMensagens(data);
      return data;
    },
    [executar],
  );

  const enviarMensagem = useCallback(
    async (conversaId, dados) => {
      return await executar(() =>
        gestorMensagensApi.enviarMensagem(conversaId, dados),
      );
    },
    [executar],
  );

  const obterHistoricoReservas = useCallback(
    async (clienteId) => {
      const data = await executar(() =>
        gestorMensagensApi.obterHistoricoReservas(clienteId),
      );
      setHistoricoReservas(data);
      return data;
    },
    [executar],
  );

  return {
    conversas,
    mensagens,
    historicoReservas,
    loading,
    erro,
    limparErro,
    listarConversas,
    obterMensagens,
    enviarMensagem,
    obterHistoricoReservas,
  };
}
