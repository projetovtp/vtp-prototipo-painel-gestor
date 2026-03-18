import { useState, useCallback } from "react";
import { gestorDashboardApi } from "../../api/endpoints/gestorDashboardApi";
import { useApiRequest } from "../useApiRequest";
import { mockKpisDashboard, gerarMockHistoricoContato } from "../../mocks/mockDashboard";
import { mockContatos } from "../../mocks/mockContatos";

const TTL_CURTO = 2 * 60 * 1000; // 2 minutos — dados que mudam com frequência
const TTL_MEDIO = 5 * 60 * 1000; // 5 minutos

export function useGestorDashboard() {
  const { loading, erro, executar, limparErro, invalidarCache } = useApiRequest();

  const [kpis, setKpis] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [mensagens, setMensagens] = useState([]);

  const obterKpis = useCallback(async () => {
    try {
      const data = await executar(
        () => gestorDashboardApi.obterKpis(),
        { chave: "gestor:dashboard:kpis", ttl: TTL_CURTO },
      );
      const result = data ?? mockKpisDashboard;
      setKpis(result);
      return result;
    } catch {
      // TODO: remover quando gestorDashboardApi.obterKpis() estiver pronto
      limparErro();
      setKpis(mockKpisDashboard);
      return mockKpisDashboard;
    }
  }, [executar, limparErro]);

  const obterContatos = useCallback(async () => {
    try {
      const data = await executar(
        () => gestorDashboardApi.obterContatos(),
        { chave: "gestor:dashboard:contatos", ttl: TTL_CURTO },
      );
      const result = data ?? mockContatos;
      setContatos(result);
      return result;
    } catch {
      // TODO: remover quando gestorDashboardApi.obterContatos() estiver pronto
      limparErro();
      setContatos(mockContatos);
      return mockContatos;
    }
  }, [executar, limparErro]);

  const obterMensagensPorContato = useCallback(
    async (params) => {
      const chave = params?.contatoId
        ? `gestor:dashboard:mensagens:${params.contatoId}`
        : "gestor:dashboard:mensagens";
      try {
        const data = await executar(
          () => gestorDashboardApi.obterMensagensPorContato(params),
          { chave, ttl: TTL_MEDIO },
        );
        const result = data ?? gerarMockHistoricoContato();
        setMensagens(result);
        return result;
      } catch {
        // TODO: remover quando gestorDashboardApi.obterMensagensPorContato() estiver pronto
        limparErro();
        const mockData = gerarMockHistoricoContato();
        setMensagens(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  return {
    kpis,
    contatos,
    mensagens,
    loading,
    erro,
    limparErro,
    invalidarCache,
    obterKpis,
    obterContatos,
    obterMensagensPorContato,
  };
}
