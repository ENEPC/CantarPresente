import { request } from './client.js';

export function createChoir(coro) {
  return request('/api/choirs', { method: 'POST', body: coro });
}

export function updateChoir(id, cambios) {
  return request(`/api/choirs/${id}`, { method: 'PUT', body: cambios });
}
