import { useState, useCallback } from "react";
import { gestorQuadrasApi } from "../../api/endpoints/gestorQuadrasApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorQuadras() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [quadras, setQuadras] = useState([]);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() => gestorQuadrasApi.listar(params));
      setQuadras(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      return await executar(() => gestorQuadrasApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => gestorQuadrasApi.editar(id, dados));
    },
    [executar],
  );

  const atualizarFotos = useCallback(
    async (id, formData) => {
      return await executar(() =>
        gestorQuadrasApi.atualizarFotos(id, formData),
      );
    },
    [executar],
  );

  const removerFoto = useCallback(
    async (id, slot) => {
      return await executar(() => gestorQuadrasApi.removerFoto(id, slot));
    },
    [executar],
  );

  const desativar = useCallback(
    async (id) => {
      return await executar(() => gestorQuadrasApi.desativar(id));
    },
    [executar],
  );

  const reativar = useCallback(
    async (id) => {
      return await executar(() => gestorQuadrasApi.reativar(id));
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
    removerFoto,
    desativar,
    reativar,
  };
}
