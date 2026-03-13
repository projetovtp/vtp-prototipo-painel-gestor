import { useState, useCallback } from "react";
import { adminEmpresasApi } from "../../api/endpoints/adminEmpresasApi";
import { useApiRequest } from "../useApiRequest";

export function useAdminEmpresas() {
  const { loading, erro, executar, limparErro } = useApiRequest();

  const [empresas, setEmpresas] = useState([]);
  const [detalheEmpresa, setDetalheEmpresa] = useState(null);
  const [detalheGestor, setDetalheGestor] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [resultadosConsulta, setResultadosConsulta] = useState([]);

  const listar = useCallback(async () => {
    const data = await executar(() => adminEmpresasApi.listar());
    setEmpresas(data);
    return data;
  }, [executar]);

  const criar = useCallback(
    async (dados) => {
      return await executar(() => adminEmpresasApi.criar(dados));
    },
    [executar],
  );

  const editar = useCallback(
    async (id, dados) => {
      return await executar(() => adminEmpresasApi.editar(id, dados));
    },
    [executar],
  );

  const excluir = useCallback(
    async (id) => {
      return await executar(() => adminEmpresasApi.excluir(id));
    },
    [executar],
  );

  const consultar = useCallback(
    async (q) => {
      const data = await executar(() => adminEmpresasApi.consultar(q));
      setResultadosConsulta(data);
      return data;
    },
    [executar],
  );

  const obterDetalheGestor = useCallback(
    async (id) => {
      const data = await executar(() =>
        adminEmpresasApi.obterDetalheGestor(id),
      );
      setDetalheGestor(data);
      return data;
    },
    [executar],
  );

  const obterDetalheEmpresa = useCallback(
    async (id) => {
      const data = await executar(() =>
        adminEmpresasApi.obterDetalheEmpresa(id),
      );
      setDetalheEmpresa(data);
      return data;
    },
    [executar],
  );

  const obterAuditLog = useCallback(
    async (params) => {
      const data = await executar(() =>
        adminEmpresasApi.obterAuditLog(params),
      );
      setAuditLog(data);
      return data;
    },
    [executar],
  );

  return {
    empresas,
    detalheEmpresa,
    detalheGestor,
    auditLog,
    resultadosConsulta,
    loading,
    erro,
    limparErro,
    listar,
    criar,
    editar,
    excluir,
    consultar,
    obterDetalheGestor,
    obterDetalheEmpresa,
    obterAuditLog,
  };
}
