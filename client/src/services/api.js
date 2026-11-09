const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que la API esté en ejecución.');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const error = new Error(json?.error || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return json;
}

export const api = {
  listarCuentas: () => request('/cuentas').then((r) => r.data),
  obtenerCuenta: (id) => request(`/cuenta/${id}`).then((r) => r.data),
  historial: (id, limite = 20) => request(`/cuenta/${id}/historial?limite=${limite}`).then((r) => r.data),
  deposito: (payload) => request('/cuenta/deposito', { method: 'POST', body: JSON.stringify(payload) }),
  retiro: (payload) => request('/cuenta/retiro', { method: 'POST', body: JSON.stringify(payload) }),
  transferencia: (payload) => request('/cuenta/transferencia', { method: 'POST', body: JSON.stringify(payload) }),
};
