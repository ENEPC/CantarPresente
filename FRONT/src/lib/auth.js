import { KEYS, leerJson, guardarJson } from './storage.js';

export function leerSesion() {
  return leerJson(KEYS.sesion, null);
}

export function guardarSesion(sesion) {
  guardarJson(KEYS.sesion, sesion);
}

export function borrarSesion() {
  localStorage.removeItem(KEYS.sesion);
}
