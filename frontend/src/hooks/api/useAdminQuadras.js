import { useState, useCallback } from "react";
import { adminQuadrasApi } from "../../api/endpoints/adminQuadrasApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminQuadras() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [quadras, setQuadras] = useState([]);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() => adminQuadrasApi.listar(params));
      setQuadras(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      return await executar(() => adminQuadrasApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => adminQuadrasApi.editar(id, dados));
    },
    [executar],
  );

  const atualizarFotos = useCallback(
    async (id, formData) => {
      return await executar(() =>
        adminQuadrasApi.atualizarFotos(id, formData),
      );
    },
    [executar],
  );

  const desativar = useCallback(
    async (id, dados) => {
      return await executar(() => adminQuadrasApi.desativar(id, dados));
    },
    [executar],
  );

  const reativar = useCallback(
    async (id) => {
      return await executar(() => adminQuadrasApi.reativar(id));
    },
    [executar],
  );

  const excluir = useCallback(
    async (id) => {
      return await executar(() => adminQuadrasApi.excluir(id));
    },
    [executar],
  );

  return {
    quadras,
    loading,
    erro,
    limparErro,
    listar,
    criar,
    editar,
    atualizarFotos,
    desativar,
    reativar,
    excluir,
  };
}
