import { useState, useCallback } from "react";
import { gestorRelatoriosApi } from "../../api/endpoints/gestorRelatoriosApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorRelatorios() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [relatorioReservas, setRelatorioReservas] = useState(null);
  const [relatorioFaturamento, setRelatorioFaturamento] = useState(null);

  const obterReservas = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorRelatoriosApi.obterReservas(params),
      );
      setRelatorioReservas(data);
      return data;
    },
    [executar],
  );

  const obterFaturamento = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorRelatoriosApi.obterFaturamento(params),
      );
      setRelatorioFaturamento(data);
      return data;
    },
    [executar],
  );

  const exportar = useCallback(
    async (params) => {
      return await executar(() => gestorRelatoriosApi.exportar(params));
    },
    [executar],
  );

  return {
    relatorioReservas,
    relatorioFaturamento,
    loading,
    erro,
    limparErro,
    obterReservas,
    obterFaturamento,
    exportar,
  };
}
