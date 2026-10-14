const VERSION = 2;

export const KEYS = {
  choirs: 'cp_choirs',
  students: 'cp_students',
  attendances: 'cp_attendances',
  outbox: 'cp_outbox',
  sesion: 'cp_sesion',
};

export function leerJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined') return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function guardarJson(key, valor) {
  localStorage.setItem(key, JSON.stringify(valor));
}

function esShapeViejo(datos, campoViejo) {
  return Array.isArray(datos) && datos.length > 0 && campoViejo in datos[0];
}

// Descarta los datos demo viejos (ids numéricos, campos en inglés) en vez de
// intentar convertirlos: el bootstrap del servidor es la fuente de verdad.
export function migrarStorage() {
  const version = localStorage.getItem('cp_version');
  if (version === String(VERSION)) return;

  const resets = [
    [KEYS.choirs, 'name'],
    [KEYS.students, 'lastname'],
    [KEYS.attendances, 'records'],
  ];
  for (const [key, campoViejo] of resets) {
    if (esShapeViejo(leerJson(key, []), campoViejo)) {
      localStorage.removeItem(key);
    }
  }
  localStorage.setItem('cp_version', String(VERSION));
}

export function pedirPersistencia() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
}
