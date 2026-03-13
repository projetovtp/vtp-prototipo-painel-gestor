import { useState, useCallback } from "react";
import { adminReservasApi } from "../../api/endpoints/adminReservasApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminReservas() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [reservas, setReservas] = useState([]);
  const [grade, setGrade] = useState(null);

  const listar = useCallback(
    async (params) => {
      const data = await executar(() => adminReservasApi.listar(params));
      setReservas(data);
      return data;
    },
    [executar],
  );

  const obterGrade = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminReservasApi.obterGrade(params),
      );
      setGrade(data);
      return data;
    },
    [executar],
  );

  const criar = useCallback(
    async (dados) => {
      return await executar(() => adminReservasApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => adminReservasApi.editar(id, dados));
    },
    [executar],
  );

  const cancelar = useCallback(
    async (id) => {
      return await executar(() => adminReservasApi.cancelar(id));
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
    editar,
    cancelar,
  };
}
