// src/services/apiEmpresas.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.vaiterplay.com.br";


function getAuthHeaders() {
  const token = localStorage.getItem("token"); // ajuste o nome se precisar
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// Lista todas as empresas (ADMIN)
export async function listarEmpresasAdmin() {
  const resp = await fetch(`${API_BASE_URL}/admin/empresas`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao buscar empresas (admin).");
  }

  return resp.json();
}

// Cria nova empresa (ADMIN)
export async function criarEmpresaAdmin(payload) {
  const resp = await fetch(`${API_BASE_URL}/admin/empresas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao criar empresa.");
  }

  return resp.json();
}

// Atualiza empresa (ADMIN)
export async function atualizarEmpresaAdmin(id, payload) {
  const resp = await fetch(`${API_BASE_URL}/admin/empresas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao atualizar empresa.");
  }

  return resp.json();
}

// (Opcional) Lista gestores para preencher o select do form
export async function listarGestoresAdmin() {
  const resp = await fetch(`${API_BASE_URL}/admin/gestores`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || "Erro ao buscar gestores.");
  }

  return resp.json();
}
