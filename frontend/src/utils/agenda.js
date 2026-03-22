export function gerarHorarios(horaInicio, horaFim) {
    const horarios = [];
    const inicio = parseInt(horaInicio.split(":")[0]);
    const fim = parseInt(horaFim.split(":")[0]);
    for (let h = inicio; h < fim; h++) {
      horarios.push(String(h).padStart(2, "0") + ":00");
    }
    return horarios;
  }

 export function gerarDiasDoMes(mesBloqueio, bloqueios) {
    const ano = mesBloqueio.getFullYear();
    const mes = mesBloqueio.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicialSemana = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicialSemana; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      dias.push({
        dia,
        data: dataISO,
        bloqueado: bloqueios.some(b => b.data === dataISO),
        bloqueiosDoDia: bloqueios.filter(b => b.data === dataISO)
      });
    }
    return dias;
  }

  export function getHorariosBloqueados(bloqueios, dataBloqueioSelecionada) {
    if (!dataBloqueioSelecionada) return [];
    const bloqueiosDoDia = bloqueios.filter(b => b.data === dataBloqueioSelecionada);
    const horariosBloqueados = [];
    bloqueiosDoDia.forEach(bloqueio => {
      const horaInicio = parseInt(bloqueio.hora_inicio?.split(":")[0] || 0);
      const horaFim = parseInt(bloqueio.hora_fim?.split(":")[0] || 23);
      for (let hora = horaInicio; hora < horaFim; hora++) {
        const horario = String(hora).padStart(2, "0") + ":00";
        if (!horariosBloqueados.includes(horario)) {
          horariosBloqueados.push(horario);
        }
      }
    });
    return horariosBloqueados;
  }

  export function getGrupoQuadra(quadras, quadraId, formatFn) {
    if (!quadraId || quadras.length === 0) return null;
    const quadraSelecionada = quadras.find(q => q.id === quadraId);
    if (!quadraSelecionada) return null;
    const nomeGrupo = formatFn(quadraSelecionada);
    return quadras.filter(q => formatFn(q) === nomeGrupo);
  }

  export function getQuadrasParaBloquear(grupo, bloquearTodas, quantidade, fallbackId) {
    if (!grupo || grupo.length <= 1) return [fallbackId];
    if (bloquearTodas) return grupo.map(q => q.id);
    const qty = Math.min(quantidade, grupo.length);
    return grupo.slice(0, qty).map(q => q.id);
  }