import { request } from './client.js';

export function getBootstrap() {
  return request('/api/bootstrap');
}
