import { useState, useCallback, useRef } from "react";

// Cache singleton em memória — persiste entre re-renders e navegações SPA.
// Entradas expiradas são removidas lazily na leitura.
const cacheStore = new Map(); // chave → { dados, expiracao }

const TTL_PADRAO = 5 * 60 * 1000; // 5 minutos

function obterDoCache(chave) {
  const entrada = cacheStore.get(chave);
  if (!entrada) return undefined;
  if (Date.now() > entrada.expiracao) {
    cacheStore.delete(chave);
    return undefined;
  }
  return entrada.dados;
}

function salvarNoCache(chave, dados, ttl) {
  cacheStore.set(chave, { dados, expiracao: Date.now() + ttl });
}

/**
 * Remove entradas do cache global.
 *
 * - Sem argumento: limpa todo o cache.
 * - Chave exata: remove apenas aquela entrada.
 * - Prefixo terminando em ":": remove todas as chaves com esse prefixo.
 *   Ex: limparCacheGlobal("gestor:reservas:") invalida todas as entradas de reservas.
 */
export function limparCacheGlobal(prefixoOuChave) {
  if (!prefixoOuChave) {
    cacheStore.clear();
    return;
  }
  if (prefixoOuChave.endsWith(":")) {
    for (const chave of cacheStore.keys()) {
      if (chave.startsWith(prefixoOuChave)) cacheStore.delete(chave);
    }
  } else {
    cacheStore.delete(prefixoOuChave);
  }
}

/**
 * Hook genérico que encapsula o padrão loading/erro para chamadas de API.
 *
 * Uso básico (sem cache — retrocompatível):
 *   const { loading, erro, executar, limparErro } = useApiRequest();
 *   const dados = await executar(() => gestorClientesApi.listar(params));
 *
 * Uso com cache em memória:
 *   const dados = await executar(
 *     () => gestorClientesApi.listar(params),
 *     { chave: "gestor:clientes:listar", ttl: 5 * 60 * 1000 }
 *   );
 *
 * Para forçar revalidação ignorando o cache:
 *   await executar(() => api.listar(), { chave: "...", forcar: true });
 *
 * Para invalidar cache após uma mutação use `invalidarCache`:
 *   const { invalidarCache } = useApiRequest();
 *   await executar(() => api.cancelar(id));
 *   invalidarCache("gestor:reservas:"); // invalida todas as chaves com esse prefixo
 *
 * Chamadas sobrepostas são tratadas: `loading` só volta a false quando
 * todas as chamadas pendentes terminarem.
 */
export function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const pendentesRef = useRef(0);

  const executar = useCallback(async (chamadaApi, opcoes = {}) => {
    const { chave, ttl = TTL_PADRAO, forcar = false } = opcoes;

    // Retorna do cache se disponível e não for revalidação forçada.
    // Respostas nulas nunca são salvas (garante que fallbacks de mock funcionem).
    if (chave && !forcar) {
      const cached = obterDoCache(chave);
      if (cached !== undefined) return cached;
    }

    pendentesRef.current += 1;
    setLoading(true);
    setErro(null);

    try {
      const resultado = await chamadaApi();
      const dados = resultado.data;
      if (chave && dados !== null && dados !== undefined) {
        salvarNoCache(chave, dados, ttl);
      }
      return dados;
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

  const invalidarCache = useCallback(
    (prefixoOuChave) => limparCacheGlobal(prefixoOuChave),
    [],
  );

  return { loading, erro, executar, limparErro, invalidarCache };
}
