import { DIAS_SEMANA } from "./constants";

export function labelDiaSemana(numero) {
  return DIAS_SEMANA.find(d => d.valor === numero)?.nome_curto ?? numero;
}


/**
 * Formata número como moeda brasileira (R$).
 * @param {number|string} valor
 * @returns {string} ex: "R$ 1.234,56"
 */
export function formatarMoeda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Formata número com separadores de milhar pt-BR.
 * @param {number|string} valor
 * @returns {string} ex: "1.234"
 */
export function formatarNumero(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString("pt-BR");
}

/**
 * Formata data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/AAAA).
 * @param {string} iso
 * @returns {string} ex: "25/03/2026"
 */
export function formatarDataBR(iso) {
  if (!iso) return "—";
  const s = String(iso).slice(0, 10);
  const partes = s.split("-");
  if (partes.length !== 3) return iso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Converte um Date para string ISO (YYYY-MM-DD).
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Retorna a data de hoje em ISO (YYYY-MM-DD).
 * @returns {string}
 */
export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Adiciona dias a uma data ISO.
 * @param {string} baseISO - Data base YYYY-MM-DD
 * @param {number} dias - Número de dias a adicionar
 * @returns {string}
 */
export function plusDiasISO(baseISO, dias) {
  const d = new Date(baseISO ? `${String(baseISO).slice(0, 10)}T00:00:00` : Date.now());
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Converte valor para string segura (null/undefined → "").
 * @param {*} v
 * @returns {string}
 */
export function safeStr(v) {
  return v == null ? "" : String(v);
}

/**
 * Formata hora inteira para string "HH:00".
 * @param {number} hora
 * @returns {string} ex: "08:00"
 */
export function formatarHora(hora) {
  return `${String(hora).padStart(2, "0")}:00`;
}

/**
 * Arredonda valor para 2 casas decimais evitando erros de floating point.
 * @param {number|string} valor
 * @returns {number}
 */
export function arredondar2(valor) {
  return Math.round((Number(valor || 0) + Number.EPSILON) * 100) / 100;
}

/**
 * Formata string de hora (ex: "18:00:00") para exibição curta ("18:00").
 * @param {string} hora
 * @returns {string}
 */
export function formatarHoraStr(hora) {
  if (!hora) return "—";
  return String(hora).slice(0, 5);
}

/**
 * Traduz status de reserva do backend para português.
 * @param {string} status - "paid" | "pending" | "canceled"
 * @returns {string}
 */
export function formatarStatus(status) {
  const map = { paid: "Pago", pending: "Pendente", canceled: "Cancelado" };
  return map[status] || status;
}

/**
 * Formata CPF para o padrão XXX.XXX.XXX-XX.
 * @param {string} cpf
 * @returns {string}
 */
export function formatarCPF(cpf) {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata número de telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 * @param {string} telefone
 * @returns {string}
 */
export function formatarTelefone(telefone) {
  if (!telefone) return "";
  const t = telefone.replace(/\D/g, "");
  if (t.length === 11) return t.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (t.length === 10) return t.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return telefone;
}

/**
 * Retorna o nome de exibição de uma quadra a partir do objeto quadra.
 * Prioridade: nome_dinamico > nome > tipo • material • modalidade
 * @param {object|null} quadra
 * @returns {string}
 */
export function formatarNomeQuadra(quadra) {
  if (!quadra) return "Quadra não encontrada";
  if (quadra.apelido) return quadra.apelido;
  if (quadra.nome_dinamico) return quadra.nome_dinamico;
  if (quadra.nome) return quadra.nome;
  const parts = [quadra.tipo || quadra.estrutura || "Quadra", quadra.material, quadra.modalidade || quadra.modalidades?.[0]].filter(Boolean);
  return parts.join(" • ") || "Quadra";
}


export function formatarNomeEmpresa(empresa) {
  if (!empresa) return "—";
  const nome = empresa.nome || "Empresa";
  const end = empresa.endereco_resumo ? ` — ${empresa.endereco_resumo}` : "";
  return `${nome}${end}`;
}

/**
 * Retorna período padrão dos últimos 30 dias em formato ISO.
 * @returns {{ inicio: string, fim: string }}
 */
export function defaultPeriodo30() {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);
  return { inicio: toISODate(inicio), fim: toISODate(fim) };
}

/**
 * Agrega slots de um grupo de quadras em um array ordenado por hora.
 * @param {object[]} quadrasGrupo - Array de quadras do mesmo grupo
 * @param {object} slotsPorQuadra - Mapa quadraId -> array de slots
 * @returns {object[]} Array de objetos { hora, hora_fim, disponiveis, reservadasPagas, reservadasPendentes, bloqueadas, total, reservas, bloqueios, preco_hora }
 */
export function agregarSlotsGrupo(quadrasGrupo, slotsPorQuadra) {
  const agg = {};
  quadrasGrupo.forEach((quadra) => {
    (slotsPorQuadra[quadra.id] || []).forEach((slot) => {
      const hora = slot.hora || slot.hora_inicio || "";
      if (!agg[hora]) {
        const h = parseInt(hora.split(":")[0], 10);
        agg[hora] = {
          hora,
          hora_fim: slot.hora_fim || `${String(h + 1).padStart(2, "0")}:00`,
          disponiveis: 0,
          reservadasPagas: 0,
          reservadasPendentes: 0,
          bloqueadas: 0,
          total: quadrasGrupo.length,
          reservas: [],
          bloqueios: [],
          preco_hora: slot.preco_hora || 100,
        };
      }
      const s = (slot.status || "").toUpperCase();
      if (s === "DISPONIVEL" || s === "LIVRE") {
        agg[hora].disponiveis++;
      } else if (s === "RESERVADO" || s === "RESERVADA") {
        if (slot.reserva?.pago_via_pix === true) agg[hora].reservadasPagas++;
        else agg[hora].reservadasPendentes++;
        if (slot.reserva) agg[hora].reservas.push(slot.reserva);
      } else if (s === "BLOQUEADO" || s === "BLOQUEADA") {
        agg[hora].bloqueadas++;
        if (slot.bloqueio) agg[hora].bloqueios.push(slot.bloqueio);
      }
    });
  });
  return Object.values(agg).sort((a, b) => a.hora.localeCompare(b.hora));
}

export function corrigirHora(valor) {
  if (!valor) return valor;
  const [hora, minuto] = valor.split(":");
  return minuto && minuto !== "00" ? `${hora}:00` : valor;
}


export function parsePrecoBRL(valor) {
  return Number(String(valor).replace(",", ".").trim());
}

/**
 * Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX.
 * @param {string} value
 * @returns {string}
 */
export function formatarCNPJ(value) {
  const cnpj = value.replace(/\D/g, "");
  return cnpj
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/**
 * Formata CEP para o padrão XXXXX-XXX.
 * @param {string} value
 * @returns {string}
 */
export function formatarCEP(value) {
  const cep = value.replace(/\D/g, "");
  return cep.replace(/^(\d{5})(\d)/, "$1-$2");
}
/**
 * Formata string de dígitos brutos como valor BRL com 2 casas decimais.
 * Ex: "12345" → "123,45" | "1000000" → "10.000,00"
 * @param {string} valor - string com qualquer caractere (apenas dígitos são usados)
 * @returns {string}
 */
export function formatarValorMascarado(valor) {
  const apenasNumeros = String(valor).replace(/\D/g, "");
  if (!apenasNumeros) return "";
  const valorNumerico = Number(apenasNumeros) / 100;
  return valorNumerico.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Extrai valor numérico de string BRL mascarada (com pontos de milhar e vírgula decimal).
 * Ex: "1.234,56" → 1234.56 | "R$ 100,00" → 100
 * @param {string} valorFormatado
 * @returns {number}
 */
export function extrairValorNumerico(valorFormatado) {
  if (!valorFormatado) return 0;
  const apenasNumeros = String(valorFormatado).replace(/\D/g, "");
  return Number(apenasNumeros) / 100;
}

export function formatarDataISO(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}


export function calcularDatasParaPeriodo(p) {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  switch (p) {
    case "hoje": {
      const s = formatarDataISO(h.getFullYear(), h.getMonth(), h.getDate());
      return { inicio: s, fim: s };
    }
    case "semana": {
      const inicioSemana = new Date(h);
      inicioSemana.setDate(h.getDate() - h.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      return {
        inicio: formatarDataISO(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate()),
        fim: formatarDataISO(fimSemana.getFullYear(), fimSemana.getMonth(), fimSemana.getDate()),
      };
    }
    case "mes": {
      const inicioMes = new Date(h.getFullYear(), h.getMonth(), 1);
      const fimMes = new Date(h.getFullYear(), h.getMonth() + 1, 0);
      return {
        inicio: formatarDataISO(inicioMes.getFullYear(), inicioMes.getMonth(), inicioMes.getDate()),
        fim: formatarDataISO(fimMes.getFullYear(), fimMes.getMonth(), fimMes.getDate()),
      };
    }
    default:
      return null;
  }
}
