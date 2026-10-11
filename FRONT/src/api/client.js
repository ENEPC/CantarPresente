// En dev el proxy de Vite resuelve /api → localhost:3001; en prod, VITE_API_URL
// apunta al dominio del backend (ej. la URL de Vercel).
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(mensaje, status, detalles = null) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(
        data?.error || `Error ${res.status}`,
        res.status,
        data?.detalles ?? null
      );
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const mensaje =
      err.name === 'AbortError'
        ? 'El servidor tardó demasiado en responder'
        : 'Sin conexión con el servidor';
    throw new ApiError(mensaje, 0);
  } finally {
    clearTimeout(timeout);
  }
}
