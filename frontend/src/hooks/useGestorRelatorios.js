import { useState, useEffect, useRef, useMemo } from "react";
import { formatarDataISO, calcularDatasParaPeriodo } from "../utils/formatters";
import { gerarMockRelatorios, gerarMockReservasPorDiaDoMes } from "../mocks/mockRelatorios";

export default function useGestorRelatorios() {
  const hoje = new Date();
  const datasIniciais = calcularDatasParaPeriodo("mes");

  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(datasIniciais.inicio);
  const [dataFim, setDataFim] = useState(datasIniciais.fim);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(hoje.getMonth());
  const [anoCalendario, setAnoCalendario] = useState(hoje.getFullYear());
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState("");

  const calendarioRef = useRef(null);
  const conteudoRef = useRef(null);

  function handleChangePeriodo(novoPeriodo) {
    setPeriodo(novoPeriodo);
    const datas = calcularDatasParaPeriodo(novoPeriodo);
    if (datas) {
      setDataInicio(datas.inicio);
      setDataFim(datas.fim);
      setMostrarCalendario(false);
    } else {
      setMostrarCalendario(true);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target)) {
        setMostrarCalendario(false);
      }
    }
    if (mostrarCalendario) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarCalendario]);

  function handleClicarDia(dia) {
    const data = formatarDataISO(anoCalendario, mesCalendario, dia);
    if (!dataInicio || (dataInicio && dataFim)) {
      setDataInicio(data);
      setDataFim("");
    } else {
      if (data >= dataInicio) {
        setDataFim(data);
      } else {
        setDataFim(dataInicio);
        setDataInicio(data);
      }
    }
  }

  function handleSelecionarMes() {
    setDataInicio(formatarDataISO(anoCalendario, mesCalendario, 1));
    setDataFim(formatarDataISO(anoCalendario, mesCalendario, new Date(anoCalendario, mesCalendario + 1, 0).getDate()));
    setPeriodo("custom");
  }

  function avancarMes() {
    if (mesCalendario === 11) { setMesCalendario(0); setAnoCalendario(anoCalendario + 1); }
    else setMesCalendario(mesCalendario + 1);
  }

  function retrocederMes() {
    if (mesCalendario === 0) { setMesCalendario(11); setAnoCalendario(anoCalendario - 1); }
    else setMesCalendario(mesCalendario - 1);
  }

  const mesAtual = periodo === "mes" ? hoje.getMonth() : mesCalendario;
  const anoAtual = periodo === "mes" ? hoje.getFullYear() : anoCalendario;

  const reservasPorDiaDoMes = useMemo(() => {
    if (periodo !== "mes") return {};
    const mes = periodo === "mes" ? new Date().getMonth() : mesCalendario;
    const ano = periodo === "mes" ? new Date().getFullYear() : anoCalendario;
    return gerarMockReservasPorDiaDoMes(ano, mes);
  }, [periodo, mesCalendario, anoCalendario]);

  const dadosRelatorio = useMemo(
    () => gerarMockRelatorios(periodo, hoje),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periodo]
  );

  return {
    periodo,
    dataInicio,
    dataFim,
    mostrarCalendario,
    mesCalendario,
    anoCalendario,
    exportando,
    erro,
    calendarioRef,
    conteudoRef,
    mesAtual,
    anoAtual,
    reservasPorDiaDoMes,
    dadosRelatorio,
    handleChangePeriodo,
    handleClicarDia,
    handleSelecionarMes,
    avancarMes,
    retrocederMes,
    setDataInicio,
    setDataFim,
    setMostrarCalendario,
    setExportando,
    setErro,
    hoje
  };
}
