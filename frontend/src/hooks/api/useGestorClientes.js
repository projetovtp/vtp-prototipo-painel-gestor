import { useState, useCallback } from "react";
import { gestorClientesApi } from "../../api/endpoints/gestorClientesApi";
import { useApiRequest } from "../useApiRequest";
import { gerarMockClientes, gerarMockHistoricoCliente } from "../../mocks/mockClientes";

const TTL = 5 * 60 * 1000; // 5 minutos

export function useGestorClientes() {
  const { loading, erro, executar, limparErro, invalidarCache } = useApiRequest();

  const [clientes, setClientes] = useState([]);
  const [historico, setHistorico] = useState([]);

  const listar = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:clientes:listar:${JSON.stringify(params)}`
        : "gestor:clientes:listar";
      try {
        const data = await executar(() => gestorClientesApi.listar(params), { chave, ttl: TTL });
        const result = data ?? gerarMockClientes();
        setClientes(result);
        return result;
      } catch {
        // TODO: remover quando gestorClientesApi.listar() estiver pronto
        limparErro();
        const mockData = gerarMockClientes();
        setClientes(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const obterHistorico = useCallback(
    async (clienteId) => {
      const chave = clienteId
        ? `gestor:clientes:historico:${clienteId}`
        : "gestor:clientes:historico";
      try {
        const data = await executar(
          () => gestorClientesApi.obterHistorico(clienteId),
          { chave, ttl: TTL },
        );
        const result = data ?? gerarMockHistoricoCliente();
        setHistorico(result);
        return result;
      } catch {
        // TODO: remover quando gestorClientesApi.obterHistorico() estiver pronto
        limparErro();
        const mockData = gerarMockHistoricoCliente();
        setHistorico(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  return {
    clientes,
    historico,
    loading,
    erro,
    limparErro,
    invalidarCache,
    listar,
    obterHistorico,
  };
}
