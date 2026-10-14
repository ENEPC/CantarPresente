import { request } from './client.js';

export function listUsuarios() {
  return request('/api/usuarios');
}

export function createUsuario(payload) {
  return request('/api/usuarios', { method: 'POST', body: payload });
}

export function setUsuarioActivo(id, activo) {
  return request(`/api/usuarios/${id}`, { method: 'PATCH', body: { activo } });
}
