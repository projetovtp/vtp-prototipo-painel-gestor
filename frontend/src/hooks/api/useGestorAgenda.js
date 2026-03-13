import { useState, useCallback } from "react";
import { gestorAgendaApi } from "../../api/endpoints/gestorAgendaApi";
import { useApiRequest } from "../useApiRequest";

export function useGestorAgenda() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [regras, setRegras] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [slots, setSlots] = useState([]);

  const listarRegras = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorAgendaApi.listarRegras(params),
      );
      setRegras(data);
      return data;
    },
    [executar],
  );

  const criarRegra = useCallback(
    async (dados) => {
      return await executar(() => gestorAgendaApi.criarRegra(dados));
    },
    [executar],
  );

  const editarRegra = useCallback(
    async (id, dados) => {
      return await executar(() =>
        gestorAgendaApi.editarRegra(id, dados),
      );
    },
    [executar],
  );

  const excluirRegra = useCallback(
    async (id) => {
      return await executar(() => gestorAgendaApi.excluirRegra(id));
    },
    [executar],
  );

  const listarBloqueios = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorAgendaApi.listarBloqueios(params),
      );
      setBloqueios(data);
      return data;
    },
    [executar],
  );

  const criarBloqueiosLote = useCallback(
    async (dados) => {
      return await executar(() =>
        gestorAgendaApi.criarBloqueiosLote(dados),
      );
    },
    [executar],
  );

  const editarBloqueio = useCallback(
    async (id, dados) => {
      return await executar(() =>
        gestorAgendaApi.editarBloqueio(id, dados),
      );
    },
    [executar],
  );

  const excluirBloqueio = useCallback(
    async (id) => {
      return await executar(() => gestorAgendaApi.excluirBloqueio(id));
    },
    [executar],
  );

  const obterSlots = useCallback(
    async (params) => {
      const data = await executar(() =>
        gestorAgendaApi.obterSlots(params),
      );
      setSlots(data);
      return data;
    },
    [executar],
  );

  return {
    regras,
    bloqueios,
    slots,
    loading,
    erro,
    limparErro,
    listarRegras,
    criarRegra,
    editarRegra,
    excluirRegra,
    listarBloqueios,
    criarBloqueiosLote,
    editarBloqueio,
    excluirBloqueio,
    obterSlots,
  };
}
