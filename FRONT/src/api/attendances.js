import { request } from './client.js';

export function syncAttendances(payload) {
  return request('/api/attendances/sync', { method: 'POST', body: payload });
}

export function listAttendances(filtros = {}) {
  const params = new URLSearchParams(
    Object.entries(filtros).filter(([, v]) => v != null)
  );
  const qs = params.toString();
  return request(`/api/attendances${qs ? `?${qs}` : ''}`);
}
