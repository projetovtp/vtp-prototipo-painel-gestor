import { useState, useCallback } from "react";
import { gestorEmpresasApi } from "../../api/endpoints/gestorEmpresasApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorEmpresas() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [empresas, setEmpresas] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  const listar = useCallback(async () => {
    const data = await executar(() => gestorEmpresasApi.listar());
    setEmpresas(data);
    return data;
  }, [executar]);

  const obter = useCallback(
    async (id) => {
      const data = await executar(() => gestorEmpresasApi.obter(id));
      setEmpresa(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      return await executar(() => gestorEmpresasApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => gestorEmpresasApi.editar(id, dados));
    },
    [executar],
  );

  const desativar = useCallback(
    async (id) => {
      return await executar(() => gestorEmpresasApi.desativar(id));
    },
    [executar],
  );

  const reativar = useCallback(
    async (id) => {
      return await executar(() => gestorEmpresasApi.reativar(id));
    },
    [executar],
  );

  return {
    empresas,
    empresa,
    loading,
    erro,
    limparErro,
    listar,
    obter,
    criar,
    editar,
    desativar,
    reativar,
  };
}
