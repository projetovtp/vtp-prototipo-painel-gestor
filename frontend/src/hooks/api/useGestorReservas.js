import { useState, useCallback } from "react";
import { gestorReservasApi } from "../../api/endpoints/gestorReservasApi";
import { useApiRequest } from "../useApiRequest";

// TTL curto: reservas mudam com frequência (criação, cancelamento, reagendamento)
const TTL = 60 * 1000; // 1 minuto

export function useGestorReservas() {
  const { loading, erro, executar, limparErro, invalidarCache } = useApiRequest();

  const [reservas, setReservas] = useState([]);
  const [grade, setGrade] = useState(null);

  const listar = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:reservas:listar:${JSON.stringify(params)}`
        : "gestor:reservas:listar";
      const data = await executar(
        () => gestorReservasApi.listar(params),
        { chave, ttl: TTL },
      );
      setReservas(data);
      return data;
    },
    [executar],
  );

  const obterGrade = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:reservas:grade:${JSON.stringify(params)}`
        : "gestor:reservas:grade";
      const data = await executar(
        () => gestorReservasApi.obterGrade(params),
        { chave, ttl: TTL },
      );
      setGrade(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      const result = await executar(() => gestorReservasApi.criar(dados));
      invalidarCache("gestor:reservas:");
      return result;
    },
    [executar, invalidarCache],
  );

  const cancelar = useCallback(
    async (id) => {
      const result = await executar(() => gestorReservasApi.cancelar(id));
      invalidarCache("gestor:reservas:");
      return result;
    },
    [executar, invalidarCache],
  );

  return {
    reservas,
    grade,
    loading,
    erro,
    limparErro,
    invalidarCache,
    listar,
    obterGrade,
    criar,
    cancelar,
  };
}
