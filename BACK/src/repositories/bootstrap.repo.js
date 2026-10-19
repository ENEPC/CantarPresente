import { pool } from '../config/db.js';
import { coroFromDb } from '../models/coro.model.js';
import { participanteFromDb } from '../models/participante.model.js';

// usuarioId null = sin filtro (coordinación/admin); caso contrario solo los coros asignados (RF-03).
const FILTRO_USUARIO = `($1::uuid IS NULL OR EXISTS (
  SELECT 1 FROM usuarios_coros uc WHERE uc.usuario_id = $1 AND uc.coro_id = c.id
))`;

export async function getCorosParaUsuario(usuarioId = null, db = pool) {
  const { rows } = await db.query(
    `SELECT c.*, s.nombre AS sede_nombre, s.localidad AS sede_localidad
     FROM coros c
     JOIN sedes s ON s.id = c.sede_id
     WHERE c.deleted_at IS NULL AND ${FILTRO_USUARIO}
     ORDER BY c.nombre`,
    [usuarioId]
  );
  return rows.map((r) => ({
    ...coroFromDb(r),
    sede: { id: r.sede_id, nombre: r.sede_nombre, localidad: r.sede_localidad },
  }));
}

export async function getParticipantesParaUsuario(usuarioId = null, db = pool) {
  // LEFT JOIN: los participantes sin membresía activa (huérfanos) también viajan
  // al frontend, con coro_id null. Incluye inactivos (sin filtro p.activo): las
  // vistas filtran activo por su cuenta. Para usuarios no-admin, FILTRO_USUARIO
  // excluye a los huérfanos porque c.id es null y el EXISTS no matchea.
  const { rows } = await db.query(
    `SELECT p.*, pc.coro_id, pc.rol
     FROM participantes p
     LEFT JOIN participantes_coros pc ON pc.participante_id = p.id AND pc.fecha_baja IS NULL
     LEFT JOIN coros c ON c.id = pc.coro_id AND c.deleted_at IS NULL
     WHERE p.deleted_at IS NULL AND ${FILTRO_USUARIO}
     ORDER BY p.apellido, p.nombre`,
    [usuarioId]
  );
  return rows.map((r) => ({
    ...participanteFromDb(r),
    coroId: r.coro_id,
    rol: r.rol,
  }));
}

export async function getClasesConAsistencias(usuarioId = null, db = pool) {
  // 1. Obtener las clases de los coros habilitados para el usuario
  const { rows: clases } = await db.query(
    `SELECT c.id, c.coro_id, TO_CHAR(c.fecha::date, 'YYYY-MM-DD') AS fecha, c.created_at, c.updated_at
     FROM clases c
     JOIN coros co ON co.id = c.coro_id AND co.deleted_at IS NULL
     WHERE ($1::uuid IS NULL OR EXISTS (
       SELECT 1 FROM usuarios_coros uc WHERE uc.usuario_id = $1 AND uc.coro_id = c.coro_id
     ))
     ORDER BY c.fecha DESC`,
    [usuarioId]
  );

  if (clases.length === 0) return [];

  const claseIds = clases.map((c) => c.id);

  // 2. Traer el detalle de presentes y ausentes de esas clases
  const { rows: asistencias } = await db.query(
    `SELECT clase_id, participante_id, estado
     FROM asistencias
     WHERE clase_id = ANY($1::uuid[])`,
    [claseIds]
  );

  // 3. Mapear cada clase con su diccionario de asistencias { [participanteId]: 'presente' | 'ausente' }
  return clases.map((clase) => {
    const mapaAsistencias = {};
    asistencias
      .filter((a) => a.clase_id === clase.id)
      .forEach((a) => {
        const estadoStr = a.estado?.toString().toLowerCase();
        mapaAsistencias[a.participante_id] =
          estadoStr === 'presente' || a.estado === true ? 'presente' : 'ausente';
      });

    return {
      id: clase.id,
      coroId: clase.coro_id,
      fecha: clase.fecha,
      asistencias: mapaAsistencias,
      synced: true,
      createdAt: clase.created_at,
      updatedAt: clase.updated_at,
    };
  });
}