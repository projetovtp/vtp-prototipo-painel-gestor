import { useState, useCallback, useRef } from "react";

/**
 * Hook genérico que encapsula o padrão loading/erro para chamadas de API.
 *
 * Uso básico:
 *   const { loading, erro, executar, limparErro } = useApiRequest();
 *   const dados = await executar(() => gestorClientesApi.listar(params));
 *
 * Chamadas sobrepostas são tratadas: `loading` só volta a false quando
 * todas as chamadas pendentes terminarem.
 */
export function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const pendentesRef = useRef(0);

  const executar = useCallback(async (chamadaApi) => {
    pendentesRef.current += 1;
    setLoading(true);
    setErro(null);

    try {
      const resultado = await chamadaApi();
      return resultado.data;
    } catch (err) {
      const mensagem =
        err.response?.data?.error || err.message || "Erro inesperado";
      setErro(mensagem);
      throw err;
    } finally {
      pendentesRef.current -= 1;
      if (pendentesRef.current === 0) {
        setLoading(false);
      }
    }
  }, []);

  const limparErro = useCallback(() => setErro(null), []);

  return { loading, erro, executar, limparErro };
}
