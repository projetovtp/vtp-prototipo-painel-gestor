import { useState, useCallback } from "react";
import { gestorConfiguracoesApi } from "../../api/endpoints/gestorConfiguracoesApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorConfiguracoes() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [complexo, setComplexo] = useState(null);

  const obterComplexo = useCallback(async () => {
    const data = await executar(() =>
      gestorConfiguracoesApi.obterComplexo(),
    );
    setComplexo(data);
    return data;
  }, [executar]);

  const salvarComplexo = useCallback(
    async (dados) => {
      return await executar(() =>
        gestorConfiguracoesApi.salvarComplexo(dados),
      );
    },
    [executar],
  );

  const salvarEndereco = useCallback(
    async (dados) => {
      return await executar(() =>
        gestorConfiguracoesApi.salvarEndereco(dados),
      );
    },
    [executar],
  );

  const salvarFinanceiro = useCallback(
    async (dados) => {
      return await executar(() =>
        gestorConfiguracoesApi.salvarFinanceiro(dados),
      );
    },
    [executar],
  );

  const uploadLogo = useCallback(
    async (formData) => {
      return await executar(() =>
        gestorConfiguracoesApi.uploadLogo(formData),
      );
    },
    [executar],
  );

  return {
    complexo,
    loading,
    erro,
    limparErro,
    obterComplexo,
    salvarComplexo,
    salvarEndereco,
    salvarFinanceiro,
    uploadLogo,
  };
}
