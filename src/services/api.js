const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'ironpeak.token';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá que el backend esté corriendo.', 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(data?.error || `Error ${res.status}`, res.status);
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  delete: (path) => request('DELETE', path),
};
