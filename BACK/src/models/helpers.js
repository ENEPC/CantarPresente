// pg devuelve DATE y TIMESTAMPTZ como objetos Date; normalizamos a strings ISO
// para que los timestamps viajen intactos en el sync (last-write-wins por updatedAt).
export function toIsoString(value) {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

// Para columnas DATE (fecha, fecha_nacimiento): usar getters locales evita corrimientos
// de día por zona horaria (toISOString() es UTC y puede restar un día).
export function toYmd(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}
