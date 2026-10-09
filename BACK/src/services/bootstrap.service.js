import { getCorosParaUsuario, getParticipantesParaUsuario } from '../repositories/bootstrap.repo.js';

// Contrato con la PWA: coros (con su sede) y estudiantes (con sus coros asignados).
// usuarioId queda null hasta que exista auth (RF-03): devuelve todo el padrón.
export async function getBootstrap(usuarioId = null) {
  const coros = await getCorosParaUsuario(usuarioId);
  const filas = await getParticipantesParaUsuario(usuarioId);

  const estudiantes = new Map();
  for (const fila of filas) {
    const { coroId, rol, ...participante } = fila;
    if (!estudiantes.has(participante.id)) {
      estudiantes.set(participante.id, { ...participante, coroIds: [] });
    }
    estudiantes.get(participante.id).coroIds.push(coroId);
  }

  return { coros, students: [...estudiantes.values()] };
}
