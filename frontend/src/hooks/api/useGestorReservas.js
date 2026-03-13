import { useState, useCallback } from "react";
import { gestorReservasApi } from "../../api/endpoints/gestorReservasApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorReservas() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [reservas, setReservas] = useState([]);
  const [grade, setGrade] = useState(null);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorReservasApi.listar(params),
      );
      setReservas(data);
      return data;
    },
    [executar],
  );

  const obterGrade = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorReservasApi.obterGrade(params),
      );
      setGrade(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      return await executar(() => gestorReservasApi.criar(dados));
    },
    [executar],
  );

  const cancelar = useCallback(
    async (id) => {
      return await executar(() => gestorReservasApi.cancelar(id));
    },
    [executar],
  );

  return {
    reservas,
    grade,
    loading,
    erro,
    limparErro,
    listar,
    obterGrade,
    criar,
    cancelar,
  };
}
