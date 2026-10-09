import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { coroFromDb, coroToDb } from '../models/coro.model.js';
import { sedeFromDb } from '../models/sede.model.js';

const CAMPOS_DB = {
  nombre: 'nombre',
  sedeId: 'sede_id',
  activo: 'activo',
  diaSemana: 'dia_semana',
  horario: 'horario',
};

// Mapeo coro/sede (opción A): el coro llega con datos de sede; si no existe, se crea.
export async function ensureSede({ nombre, localidad }, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM sedes
     WHERE deleted_at IS NULL AND lower(nombre) = lower($1)
       AND coalesce(localidad, '') = coalesce($2, '')
     LIMIT 1`,
    [nombre, localidad ?? null]
  );
  if (rows[0]) return sedeFromDb(rows[0]);

  const now = new Date().toISOString();
  const { rows: creada } = await db.query(
    `INSERT INTO sedes (id, nombre, localidad, activa, created_at, updated_at)
     VALUES ($1, $2, $3, TRUE, $4, $4)
     RETURNING *`,
    [randomUUID(), nombre, localidad ?? null, now]
  );
  return sedeFromDb(creada[0]);
}

export async function getCoroById(id, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM coros WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ? coroFromDb(rows[0]) : null;
}

export async function insertCoro(coro, db = pool) {
  const now = new Date().toISOString();
  const c = coroToDb({ ...coro, id: coro.id ?? randomUUID(), createdAt: now, updatedAt: now, deletedAt: null });
  const { rows } = await db.query(
    `INSERT INTO coros (id, nombre, sede_id, activo, dia_semana, horario, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [c.id, c.nombre, c.sede_id, c.activo, c.dia_semana, c.horario, c.created_at, c.updated_at]
  );
  return coroFromDb(rows[0]);
}

export async function updateCoro(id, cambios, db = pool) {
  const entradas = Object.entries(cambios).filter(([k]) => k in CAMPOS_DB);
  if (entradas.length === 0) return null;

  const sets = entradas.map(([k], i) => `${CAMPOS_DB[k]} = $${i + 2}`);
  const valores = entradas.map(([, v]) => v);
  const { rows } = await db.query(
    `UPDATE coros SET ${sets.join(', ')}, updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, ...valores]
  );
  return rows[0] ? coroFromDb(rows[0]) : null;
}
