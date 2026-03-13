import { useState, useCallback } from "react";
import { adminGestoresApi } from "../../api/endpoints/adminGestoresApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminGestores() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [gestores, setGestores] = useState([]);

  const listar = useCallback(async () => {
    const data = await executar(() => adminGestoresApi.listar());
    setGestores(data);
    return data;
  }, [executar]);

  const criar = useCallback(
    async (dados) => {
      return await executar(() => adminGestoresApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => adminGestoresApi.editar(id, dados));
    },
    [executar],
  );

  const promover = useCallback(
    async (id) => {
      return await executar(() => adminGestoresApi.promover(id));
    },
    [executar],
  );

  const reenviarAtivacao = useCallback(
    async (id) => {
      return await executar(() => adminGestoresApi.reenviarAtivacao(id));
    },
    [executar],
  );

  return {
    gestores,
    loading,
    erro,
    limparErro,
    listar,
    criar,
    editar,
    promover,
    reenviarAtivacao,
  };
}
