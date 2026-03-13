import { useState, useCallback } from "react";
import { adminAgendaApi } from "../../api/endpoints/adminAgendaApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminAgenda() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [regras, setRegras] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [slots, setSlots] = useState([]);

  const listarRegras = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminAgendaApi.listarRegras(params),
      );
      setRegras(data);
      return data;
    },
    [executar],
  );

  const listarBloqueios = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminAgendaApi.listarBloqueios(params),
      );
      setBloqueios(data);
      return data;
    },
    [executar],
  );

  const criarRegrasLote = useCallback(
    async (dados) => {
      return await executar(() => adminAgendaApi.criarRegrasLote(dados));
    },
    [executar],
  );

  const editarRegra = useCallback(
    async (id, dados) => {
      return await executar(() => adminAgendaApi.editarRegra(id, dados));
    },
    [executar],
  );

  const excluirRegra = useCallback(
    async (id) => {
      return await executar(() => adminAgendaApi.excluirRegra(id));
    },
    [executar],
  );

  const criarBloqueiosLote = useCallback(
    async (dados) => {
      return await executar(() =>
        adminAgendaApi.criarBloqueiosLote(dados),
      );
    },
    [executar],
  );

  const excluirBloqueio = useCallback(
    async (id) => {
      return await executar(() => adminAgendaApi.excluirBloqueio(id));
    },
    [executar],
  );

  const obterSlots = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminAgendaApi.obterSlots(params),
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
    listarBloqueios,
    criarRegrasLote,
    editarRegra,
    excluirRegra,
    criarBloqueiosLote,
    excluirBloqueio,
    obterSlots,
  };
}
