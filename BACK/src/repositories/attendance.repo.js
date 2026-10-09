import { pool } from '../config/db.js';
import { claseFromDb, claseToDb } from '../models/clase.model.js';
import { asistenciaFromDb, asistenciaToDb } from '../models/asistencia.model.js';
import { toYmd } from '../models/helpers.js';

export async function upsertClase(clase, db = pool) {
  const c = claseToDb(clase);
  const { rows } = await db.query(
    `INSERT INTO clases (id, coro_id, fecha, hora, usuario_id, observaciones, created_at, updated_at, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (coro_id, fecha)
     DO UPDATE SET hora = EXCLUDED.hora,
                   usuario_id = EXCLUDED.usuario_id,
                   observaciones = EXCLUDED.observaciones,
                   updated_at = EXCLUDED.updated_at,
                   deleted_at = EXCLUDED.deleted_at
     WHERE EXCLUDED.updated_at > clases.updated_at
     RETURNING *`,
    [c.id, c.coro_id, c.fecha, c.hora, c.usuario_id, c.observaciones, c.created_at, c.updated_at, c.deleted_at]
  );
  if (rows[0]) return claseFromDb(rows[0]);

  // El registro local perdió el conflicto: devolvemos la versión vigente para que las
  // asistencias del lote se cuelguen de la clase ganadora. Se busca por (coro_id, fecha)
  // porque otro dispositivo pudo crear la misma sesión con un UUID distinto.
  const { rows: vigente } = await db.query(
    `SELECT * FROM clases WHERE coro_id = $1 AND fecha = $2`,
    [c.coro_id, c.fecha]
  );
  return vigente[0] ? claseFromDb(vigente[0]) : null;
}

export async function upsertAsistencia(asistencia, db = pool) {
  const a = asistenciaToDb(asistencia);
  await db.query(
    `INSERT INTO asistencias (clase_id, participante_id, estado, registrado_por, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (clase_id, participante_id)
     DO UPDATE SET estado = EXCLUDED.estado,
                   registrado_por = EXCLUDED.registrado_por,
                   updated_at = EXCLUDED.updated_at
     WHERE EXCLUDED.updated_at > asistencias.updated_at`,
    [a.clase_id, a.participante_id, a.estado, a.registrado_por, a.created_at, a.updated_at]
  );
}

export async function insertSincronizacion(log, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO sincronizaciones (dispositivo_id, usuario_id, registros_ok, registros_err, estado, detalle)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [log.dispositivoId, log.usuarioId ?? null, log.registrosOk, log.registrosErr, log.estado, log.detalle ?? null]
  );
  return rows[0];
}

export async function listAsistencias(
  { coroId = null, participanteId = null, desde = null, hasta = null } = {},
  db = pool
) {
  const { rows } = await db.query(
    `SELECT a.*, c.coro_id, c.fecha,
            p.nombre AS participante_nombre, p.apellido AS participante_apellido
     FROM asistencias a
     JOIN clases c ON c.id = a.clase_id AND c.deleted_at IS NULL
     JOIN participantes p ON p.id = a.participante_id
     WHERE ($1::uuid IS NULL OR c.coro_id = $1)
       AND ($2::uuid IS NULL OR a.participante_id = $2)
       AND ($3::date IS NULL OR c.fecha >= $3)
       AND ($4::date IS NULL OR c.fecha <= $4)
     ORDER BY c.fecha DESC, p.apellido, p.nombre
     LIMIT 500`,
    [coroId, participanteId, desde, hasta]
  );
  return rows.map((r) => ({
    ...asistenciaFromDb(r),
    coroId: r.coro_id,
    fecha: toYmd(r.fecha),
    participante: { nombre: r.participante_nombre, apellido: r.participante_apellido },
  }));
}
