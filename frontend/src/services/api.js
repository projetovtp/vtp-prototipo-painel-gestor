/**
 * Re-exporta o cliente HTTP centralizado para manter compatibilidade
 * com os imports existentes (import api from "../../services/api").
 *
 * Novos arquivos devem importar de "../api/client" diretamente.
 */
import apiClient from "../api/client";

export default apiClient;
