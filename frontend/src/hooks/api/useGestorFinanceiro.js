import { useState, useCallback } from "react";
import { gestorFinanceiroApi } from "../../api/endpoints/gestorFinanceiroApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorFinanceiro() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [overview, setOverview] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [repasses, setRepasses] = useState([]);
  const [detalheRepasse, setDetalheRepasse] = useState(null);
  const [dadosBancarios, setDadosBancarios] = useState(null);

  const obterOverview = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorFinanceiroApi.obterOverview(params),
      );
      setOverview(data);
      return data;
    },
    [executar],
  );

  const listarPagamentos = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorFinanceiroApi.listarPagamentos(params),
      );
      setPagamentos(data);
      return data;
    },
    [executar],
  );

  const obterReservasPorDia = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorFinanceiroApi.obterReservasPorDia(params),
      );
      setReservasPorDia(data);
      return data;
    },
    [executar],
  );

  const listarTransacoes = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorFinanceiroApi.listarTransacoes(params),
      );
      setTransacoes(data);
      return data;
    },
    [executar],
  );

  const listarRepasses = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorFinanceiroApi.listarRepasses(params),
      );
      setRepasses(data);
      return data;
    },
    [executar],
  );

  const obterDetalheRepasse = useCallback(
    async (id) => {
      const data = await executar(() =>
        gestorFinanceiroApi.obterDetalheRepasse(id),
      );
      setDetalheRepasse(data);
      return data;
    },
    [executar],
  );

  const solicitarRepasse = useCallback(
    async (dados) => {
      return await executar(() =>
        gestorFinanceiroApi.solicitarRepasse(dados),
      );
    },
    [executar],
  );

  const obterDadosBancarios = useCallback(async () => {
    const data = await executar(() =>
      gestorFinanceiroApi.obterDadosBancarios(),
    );
    setDadosBancarios(data);
    return data;
  }, [executar]);

  return {
    overview,
    pagamentos,
    reservasPorDia,
    transacoes,
    repasses,
    detalheRepasse,
    dadosBancarios,
    loading,
    erro,
    limparErro,
    obterOverview,
    listarPagamentos,
    obterReservasPorDia,
    listarTransacoes,
    listarRepasses,
    obterDetalheRepasse,
    solicitarRepasse,
    obterDadosBancarios,
  };
}
