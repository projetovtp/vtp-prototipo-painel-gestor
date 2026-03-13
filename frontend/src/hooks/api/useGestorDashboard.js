import { useState, useCallback } from "react";
import { gestorDashboardApi } from "../../api/endpoints/gestorDashboardApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorDashboard() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [kpis, setKpis] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  const obterKpis = useCallback(async () => {
    const data = await executar(() => gestorDashboardApi.obterKpis());
    setKpis(data);
    return data;
  }, [executar]);

  const obterContatos = useCallback(async () => {
    const data = await executar(() => gestorDashboardApi.obterContatos());
    setContatos(data);
    return data;
  }, [executar]);

  const obterMensagensPorContato = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorDashboardApi.obterMensagensPorContato(params),
      );
      setMensagens(data);
      return data;
    },
    [executar],
  );

  return {
    kpis,
    contatos,
    mensagens,
    loading,
    erro,
    limparErro,
    obterKpis,
    obterContatos,
    obterMensagensPorContato,
  };
}
