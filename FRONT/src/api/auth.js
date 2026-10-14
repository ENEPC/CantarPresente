import { request } from './client.js';

export function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function me() {
  return request('/api/auth/me');
}
