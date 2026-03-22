import { parsePrecoBRL } from "./formatters";

/**
 * Valida formato de email.
 * @param {string} email
 * @returns {boolean}
 */
export function validarEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida formato de CPF (apenas dígitos, com ou sem máscara).
 * @param {string} cpf
 * @returns {boolean}
 */
export function validarCPF(cpf) {
  if (!cpf) return false;
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(digits[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(digits[10]);
}

/**
 * Valida formato de telefone brasileiro (10 ou 11 dígitos).
 * @param {string} telefone
 * @returns {boolean}
 */
export function validarTelefone(telefone) {
  if (!telefone) return false;
  const digits = telefone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Valida se string não está vazia (após trim).
 * @param {string} valor
 * @returns {boolean}
 */
export function campoObrigatorio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

/**
 * Valida força de senha.
 * Regra: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número.
 * Retorna mensagem de erro descritiva, ou string vazia se válida.
 * @param {string} senha
 * @returns {string}
 */
export function validarSenha(senha) {
  const s = String(senha || "")
  if (s.length < 8) return "A senha deve ter pelo menos 8 caracteres."
  if (!/[A-Z]/.test(s)) return "A senha deve ter pelo menos 1 letra maiúscula."
  if (!/[a-z]/.test(s)) return "A senha deve ter pelo menos 1 letra minúscula."
  if (!/[0-9]/.test(s)) return "A senha deve ter pelo menos 1 número."
  return ""
}

/**
 * Valida formato de CNPJ (apenas dígitos, com ou sem máscara).
 * @param {string} cnpj
 * @returns {boolean}
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(digits[i]) * pesos1[i];
  let resto = soma % 11;
  const d1 = resto < 2 ? 0 : 11 - resto;
  if (parseInt(digits[12]) !== d1) return false;

  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(digits[i]) * pesos2[i];
  resto = soma % 11;
  const d2 = resto < 2 ? 0 : 11 - resto;
  return parseInt(digits[13]) === d2;
}

/**
 * Valida dados de uma regra de horário.
 * @returns {string} mensagem de erro ou "" se válido
 */
export function validarRegraHorario({ horaInicio, horaFim, precoHora }) {
  if (!horaInicio || !horaFim) {
    return "Preencha os horários inicial e final.";
  }

  const horaInicioMatch = horaInicio.match(/^(\d{2}):(\d{2})$/);
  const horaFimMatch = horaFim.match(/^(\d{2}):(\d{2})$/);
  if (!horaInicioMatch || !horaFimMatch) {
    return "Formato de horário inválido. Use o formato HH:MM (ex: 08:00).";
  }

  const horaInicioNum = parseInt(horaInicio.split(":")[0]);
  const horaFimNum = parseInt(horaFim.split(":")[0]);
  const minutoInicio = parseInt(horaInicio.split(":")[1]);
  const minutoFim = parseInt(horaFim.split(":")[1]);

  if (minutoInicio !== 0 || minutoFim !== 0) {
    return "Os horários devem ser de hora em hora (ex: 08:00, 09:00).";
  }
  if (horaInicioNum >= horaFimNum) {
    return "A hora final deve ser maior que a hora inicial.";
  }
  if (horaInicioNum < 0 || horaInicioNum > 23 || horaFimNum < 0 || horaFimNum > 23) {
    return "Os horários devem estar entre 00:00 e 23:00.";
  }
  if (!precoHora || String(precoHora).trim() === "") {
    return "O preço por hora é obrigatório.";
  }

  const preco = parsePrecoBRL(precoHora);
  if (isNaN(preco) || preco <= 0) {
    return "Preço por hora inválido. Informe um valor maior que zero (ex: 100 ou 100.50).";
  }

  return "";
}

/**
 * Verifica se uma reserva pode ser cancelada (status e janela de 24h).
 * @param {object} reserva
 * @returns {boolean}
 */
export function podeCancelar(reserva) {
  if (reserva.status !== "pending" && reserva.status !== "paid") return false;
  if (!reserva.created_at) return false;
  const horasDesdeCriacao = (new Date() - new Date(reserva.created_at)) / (1000 * 60 * 60);
  return horasDesdeCriacao <= 24;
}

/**
 * Valida os dados do formulário de criação/edição de quadra.
 * @param {object} formData
 * @returns {string} mensagem de erro ou "" se válido
 */
export function validarFormQuadra(formData) {
  if (!formData.estrutura || !formData.material || !formData.modalidades?.length || !formData.quantidadeQuadras) {
    return "Estrutura, Material, Modalidade e Quantidade são obrigatórios.";
  }
  const quantidade = parseInt(formData.quantidadeQuadras);
  if (isNaN(quantidade) || quantidade <= 0) {
    return "A quantidade de quadras deve ser um número maior que zero.";
  }
  return "";
}
