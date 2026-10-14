// En dev el proxy de Vite resuelve /api → localhost:3001; en prod, VITE_API_URL
// apunta al dominio del backend (ej. la URL de Vercel).
import { leerSesion, borrarSesion } from '../lib/auth.js';

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
  const sesion = leerSesion();
  try {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (sesion?.token) headers.Authorization = `Bearer ${sesion.token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // 401 con token adjunto = token vencido o usuario desactivado: se cierra la
    // sesión local y App muestra el login. Sin token (ej. el propio /auth/login
    // con credenciales malas) es un error normal de la petición.
    if (res.status === 401 && sesion?.token) {
      borrarSesion();
      window.dispatchEvent(new Event('cp:auth-expirada'));
    }

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
