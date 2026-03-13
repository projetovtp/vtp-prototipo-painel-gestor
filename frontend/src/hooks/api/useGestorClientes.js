import { useState, useCallback } from "react";
import { gestorClientesApi } from "../../api/endpoints/gestorClientesApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorClientes() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [clientes, setClientes] = useState([]);
  const [historico, setHistorico] = useState([]);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorClientesApi.listar(params),
      );
      setClientes(data);
      return data;
    },
    [executar],
  );

  const obterHistorico = useCallback(
    async (clienteId) => {
      const data = await executar(() =>
        gestorClientesApi.obterHistorico(clienteId),
      );
      setHistorico(data);
      return data;
    },
    [executar],
  );

  return {
    clientes,
    historico,
    loading,
    erro,
    limparErro,
    listar,
    obterHistorico,
  };
}
