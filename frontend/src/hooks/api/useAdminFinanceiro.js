import { useState, useCallback } from "react";
import { adminFinanceiroApi } from "../../api/endpoints/adminFinanceiroApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminFinanceiro() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [overview, setOverview] = useState(null);
  const [resumo, setResumo] = useState(null);

  const obterOverview = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminFinanceiroApi.obterOverview(params),
      );
      setOverview(data);
      return data;
    },
    [executar],
  );

  const obterResumo = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminFinanceiroApi.obterResumo(params),
      );
      setResumo(data);
      return data;
    },
    [executar],
  );

  return {
    overview,
    resumo,
    loading,
    erro,
    limparErro,
    obterOverview,
    obterResumo,
  };
}
