import { request } from './client.js';

export function createStudent(alumno) {
  return request('/api/students', { method: 'POST', body: alumno });
}

export function updateStudent(id, cambios) {
  return request(`/api/students/${id}`, { method: 'PUT', body: cambios });
}
