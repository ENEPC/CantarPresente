import { KEYS, leerJson, guardarJson } from './storage.js';
import { newUuid } from './ids.js';

let cola = leerJson(KEYS.outbox, []);
const listeners = new Set();

function persistir() {
  guardarJson(KEYS.outbox, cola);
}

function notificar() {
  listeners.forEach((fn) => fn(cola));
}

export function getOutbox() {
  return cola;
}

export function enqueue(tipo, payload) {
  const op = {
    id: newUuid(),
    tipo,
    payload,
    creadoEn: new Date().toISOString(),
    intentos: 0,
    error: null,
  };
  cola.push(op);
  persistir();
  notificar();
  return op;
}

export function removeOp(id) {
  cola = cola.filter((op) => op.id !== id);
  persistir();
  notificar();
}

export function markError(id, mensaje) {
  const op = cola.find((o) => o.id === id);
  if (op) {
    op.error = mensaje;
    op.intentos += 1;
    persistir();
    notificar();
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
