import { useState, useCallback } from "react";
import { gestorRelatoriosApi } from "../../api/endpoints/gestorRelatoriosApi";
import { useApiRequest } from "../useApiRequest";
import { gerarMockRelatorios } from "../../mocks/mockRelatorios";

export function useGestorRelatorios() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [relatorioReservas, setRelatorioReservas] = useState(null);
  const [relatorioFaturamento, setRelatorioFaturamento] = useState(null);

  const obterReservas = useCallback(
    async (params) => {
      try {
        const data = await executar(() =>
          gestorRelatoriosApi.obterReservas(params),
        );
        const result = data ?? gerarMockRelatorios(params?.periodo || "mes");
        setRelatorioReservas(result);
        return result;
      } catch {
        // TODO: remover quando gestorRelatoriosApi.obterReservas() estiver pronto
        limparErro();
        const mockData = gerarMockRelatorios(params?.periodo || "mes");
        setRelatorioReservas(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const obterFaturamento = useCallback(
    async (params) => {
      try {
        const data = await executar(() =>
          gestorRelatoriosApi.obterFaturamento(params),
        );
        const result = data ?? gerarMockRelatorios(params?.periodo || "mes");
        setRelatorioFaturamento(result);
        return result;
      } catch {
        // TODO: remover quando gestorRelatoriosApi.obterFaturamento() estiver pronto
        limparErro();
        const mockData = gerarMockRelatorios(params?.periodo || "mes");
        setRelatorioFaturamento(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
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
