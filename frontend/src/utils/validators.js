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
