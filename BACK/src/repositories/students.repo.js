import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { participanteFromDb, participanteToDb } from '../models/participante.model.js';
import { membresiaFromDb, membresiaToDb } from '../models/membresia.model.js';

const CAMPOS_DB = {
  nombre: 'nombre',
  apellido: 'apellido',
  fechaNacimiento: 'fecha_nacimiento',
  responsableNombre: 'responsable_nombre',
  responsableTelefono: 'responsable_telefono',
  observaciones: 'observaciones',
  activo: 'activo',
};

export async function getParticipanteById(id, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM participantes WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ? participanteFromDb(rows[0]) : null;
}

export async function insertParticipante(participante, db = pool) {
  const now = new Date().toISOString();
  const p = participanteToDb({
    ...participante,
    id: participante.id ?? randomUUID(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });
  const { rows } = await db.query(
    `INSERT INTO participantes
       (id, nombre, apellido, fecha_nacimiento, responsable_nombre, responsable_telefono, observaciones, activo, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      p.id,
      p.nombre,
      p.apellido,
      p.fecha_nacimiento,
      p.responsable_nombre,
      p.responsable_telefono,
      p.observaciones,
      p.activo,
      p.created_at,
      p.updated_at,
    ]
  );
  return participanteFromDb(rows[0]);
}

export async function updateParticipante(id, cambios, db = pool) {
  const entradas = Object.entries(cambios).filter(([k]) => k in CAMPOS_DB);
  if (entradas.length === 0) return null;

  const sets = entradas.map(([k], i) => `${CAMPOS_DB[k]} = $${i + 2}`);
  const valores = entradas.map(([, v]) => v);
  const { rows } = await db.query(
    `UPDATE participantes SET ${sets.join(', ')}, updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, ...valores]
  );
  return rows[0] ? participanteFromDb(rows[0]) : null;
}

export async function listMembresiasActivas(participanteId, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM participantes_coros
     WHERE participante_id = $1 AND fecha_baja IS NULL`,
    [participanteId]
  );
  return rows.map(membresiaFromDb);
}

// Reabre una membresía cerrada si el participante vuelve a asignarse al coro.
export async function upsertMembresiaActiva(membresia, db = pool) {
  const now = new Date().toISOString();
  const m = membresiaToDb({
    ...membresia,
    id: membresia.id ?? randomUUID(),
    fechaAlta: membresia.fechaAlta ?? null,
    fechaBaja: null,
    rol: membresia.rol ?? null,
    createdAt: now,
    updatedAt: now,
  });
  const { rows } = await db.query(
    `INSERT INTO participantes_coros (id, participante_id, coro_id, fecha_alta, fecha_baja, rol, created_at, updated_at)
     VALUES ($1, $2, $3, coalesce($4, CURRENT_DATE), NULL, $5, $6, $6)
     ON CONFLICT (participante_id, coro_id)
     DO UPDATE SET fecha_baja = NULL, rol = EXCLUDED.rol, updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [m.id, m.participante_id, m.coro_id, m.fecha_alta, m.rol, m.created_at]
  );
  return membresiaFromDb(rows[0]);
}

export async function cerrarMembresia(participanteId, coroId, db = pool) {
  const { rows } = await db.query(
    `UPDATE participantes_coros
     SET fecha_baja = CURRENT_DATE, updated_at = now()
     WHERE participante_id = $1 AND coro_id = $2 AND fecha_baja IS NULL
     RETURNING *`,
    [participanteId, coroId]
  );
  return rows[0] ? membresiaFromDb(rows[0]) : null;
}
