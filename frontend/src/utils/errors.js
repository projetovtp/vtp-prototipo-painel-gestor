/**
 * Retorna mensagem de erro amigável para operações de regra de horário.
 */
export function tratarErroRegra(err) {
    const status = err.response?.status;
    const msgServidor = err.response?.data?.error;
  
    if (status === 409) return "Já existe uma regra para este dia e horário. Use a opção 'Editar' para modificar ou remova a regra existente.";
    if (status === 400) return msgServidor || "Dados inválidos. Verifique os campos preenchidos.";
    if (status === 403) return "Você não tem permissão para esta operação.";
    if (status === 404) return "Recurso não encontrado.";
    return msgServidor || "Erro ao processar. Tente novamente.";
  }
  
  export function extrairErroApi(err, fallback) {
    return err.response?.data?.error || fallback;
  }