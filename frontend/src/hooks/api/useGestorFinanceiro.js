import { useState, useCallback } from "react";
import { gestorFinanceiroApi } from "../../api/endpoints/gestorFinanceiroApi";
import { useApiRequest } from "../useApiRequest";
import { gerarMockFinanceiro, mockDadosBancarios } from "../../mocks/mockFinanceiro";

const TTL = 5 * 60 * 1000;        // 5 minutos — dados financeiros
const TTL_LONGO = 10 * 60 * 1000; // 10 minutos — dados bancários mudam raramente

export function useGestorFinanceiro() {
  const { loading, erro, executar, limparErro, invalidarCache } = useApiRequest();

  const [overview, setOverview] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [repasses, setRepasses] = useState([]);
  const [detalheRepasse, setDetalheRepasse] = useState(null);
  const [dadosBancarios, setDadosBancarios] = useState(null);

  const obterOverview = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:financeiro:overview:${JSON.stringify(params)}`
        : "gestor:financeiro:overview";
      try {
        const data = await executar(
          () => gestorFinanceiroApi.obterOverview(params),
          { chave, ttl: TTL },
        );
        const result = data ?? (() => {
          const m = gerarMockFinanceiro();
          return { total: m.ovTotal, pendente: m.ovPendente, cancelado: m.ovCancelado };
        })();
        setOverview(result);
        return result;
      } catch {
        // TODO: remover quando gestorFinanceiroApi.obterOverview() estiver pronto
        limparErro();
        const m = gerarMockFinanceiro();
        const mockData = { total: m.ovTotal, pendente: m.ovPendente, cancelado: m.ovCancelado };
        setOverview(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const listarPagamentos = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:financeiro:pagamentos:${JSON.stringify(params)}`
        : "gestor:financeiro:pagamentos";
      try {
        const data = await executar(
          () => gestorFinanceiroApi.listarPagamentos(params),
          { chave, ttl: TTL },
        );
        const result = data ?? gerarMockFinanceiro().ovTotal.ultimos_pagamentos;
        setPagamentos(result);
        return result;
      } catch {
        // TODO: remover quando gestorFinanceiroApi.listarPagamentos() estiver pronto
        limparErro();
        const mockData = gerarMockFinanceiro().ovTotal.ultimos_pagamentos;
        setPagamentos(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const obterReservasPorDia = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:financeiro:reservas-por-dia:${JSON.stringify(params)}`
        : "gestor:financeiro:reservas-por-dia";
      try {
        const data = await executar(
          () => gestorFinanceiroApi.obterReservasPorDia(params),
          { chave, ttl: TTL },
        );
        const result = data ?? gerarMockFinanceiro().reservasPorDia;
        setReservasPorDia(result);
        return result;
      } catch {
        // TODO: remover quando gestorFinanceiroApi.obterReservasPorDia() estiver pronto
        limparErro();
        const mockData = gerarMockFinanceiro().reservasPorDia;
        setReservasPorDia(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const listarTransacoes = useCallback(
    async (params) => {
      const chave = params
        ? `gestor:financeiro:transacoes:${JSON.stringify(params)}`
        : "gestor:financeiro:transacoes";
      try {
        const data = await executar(
          () => gestorFinanceiroApi.listarTransacoes(params),
          { chave, ttl: TTL },
        );
        const result = data ?? gerarMockFinanceiro().transacoesConcluidas;
        setTransacoes(result);
        return result;
      } catch {
        // TODO: remover quando gestorFinanceiroApi.listarTransacoes() estiver pronto
        limparErro();
        const mockData = gerarMockFinanceiro().transacoesConcluidas;
        setTransacoes(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const listarRepasses = useCallback(
    async (params) => {
      const normalizar = (raw) => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === "object") {
          return raw.repasses ?? raw.results ?? raw.data ?? raw.items ?? [];
        }
        return [];
      };
      const chave = params
        ? `gestor:financeiro:repasses:${JSON.stringify(params)}`
        : "gestor:financeiro:repasses";
      try {
        const data = await executar(
          () => gestorFinanceiroApi.listarRepasses(params),
          { chave, ttl: TTL },
        );
        const result = data != null ? normalizar(data) : gerarMockFinanceiro().repassesMock;
        setRepasses(result);
        return result;
      } catch {
        // TODO: remover quando gestorFinanceiroApi.listarRepasses() estiver pronto
        limparErro();
        const mockData = gerarMockFinanceiro().repassesMock;
        setRepasses(mockData);
        return mockData;
      }
    },
    [executar, limparErro],
  );

  const obterDetalheRepasse = useCallback(
    async (id) => {
      const data = await executar(
        () => gestorFinanceiroApi.obterDetalheRepasse(id),
        { chave: `gestor:financeiro:repasse:${id}`, ttl: TTL },
      );
      setDetalheRepasse(data);
      return data;
    },
    [executar],
  );

  const solicitarRepasse = useCallback(
    async (dados) => {
      const result = await executar(() => gestorFinanceiroApi.solicitarRepasse(dados));
      // Invalida repasses e overview após solicitar
      invalidarCache("gestor:financeiro:repasses:");
      invalidarCache("gestor:financeiro:overview:");
      return result;
    },
    [executar, invalidarCache],
  );

  const obterDadosBancarios = useCallback(async () => {
    try {
      const data = await executar(
        () => gestorFinanceiroApi.obterDadosBancarios(),
        { chave: "gestor:financeiro:dados-bancarios", ttl: TTL_LONGO },
      );
      const result = data ?? mockDadosBancarios;
      setDadosBancarios(result);
      return result;
    } catch {
      // TODO: remover quando gestorFinanceiroApi.obterDadosBancarios() estiver pronto
      limparErro();
      setDadosBancarios(mockDadosBancarios);
      return mockDadosBancarios;
    }
  }, [executar, limparErro]);

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
    invalidarCache,
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
