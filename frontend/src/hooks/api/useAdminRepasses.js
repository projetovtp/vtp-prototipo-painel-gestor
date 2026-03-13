import { useState, useCallback } from "react";
import { adminRepassesApi } from "../../api/endpoints/adminRepassesApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminRepasses() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [repasses, setRepasses] = useState([]);
  const [detalhe, setDetalhe] = useState(null);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() => adminRepassesApi.listar(params));
      setRepasses(data);
      return data;
    },
    [executar],
  );

  const gerar = useCallback(
    async (dados) => {
      return await executar(() => adminRepassesApi.gerar(dados));
    },
    [executar],
  );

  const obterDetalhe = useCallback(
    async (id) => {
      const data = await executar(() =>
        adminRepassesApi.obterDetalhe(id),
      );
      setDetalhe(data);
      return data;
    },
    [executar],
  );

  const marcarPago = useCallback(
    async (id) => {
      return await executar(() => adminRepassesApi.marcarPago(id));
    },
    [executar],
  );

  return {
    repasses,
    detalhe,
    loading,
    erro,
    limparErro,
    listar,
    gerar,
    obterDetalhe,
    marcarPago,
  };
}
