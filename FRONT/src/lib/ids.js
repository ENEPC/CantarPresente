export function newUuid() {
  return crypto.randomUUID();
}

const DISPOSITIVO_KEY = 'cp_dispositivo_id';

export function getDispositivoId() {
  let id = localStorage.getItem(DISPOSITIVO_KEY);
  if (!id) {
    id = newUuid();
    localStorage.setItem(DISPOSITIVO_KEY, id);
  }
  return id;
}
