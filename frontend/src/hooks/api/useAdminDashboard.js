import { useState, useCallback } from "react";
import { adminDashboardApi } from "../../api/endpoints/adminDashboardApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminDashboard() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [overview, setOverview] = useState(null);
  const [financeiroOverview, setFinanceiroOverview] = useState(null);

  const obterOverview = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminDashboardApi.obterOverview(params),
      );
      setOverview(data);
      return data;
    },
    [executar],
  );

  const obterFinanceiroOverview = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminDashboardApi.obterFinanceiroOverview(params),
      );
      setFinanceiroOverview(data);
      return data;
    },
    [executar],
  );

  return {
    overview,
    financeiroOverview,
    loading,
    erro,
    limparErro,
    obterOverview,
    obterFinanceiroOverview,
  };
}
