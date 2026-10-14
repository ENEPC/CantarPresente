import { pool } from '../config/db.js';
import { usuarioFromDb } from '../models/usuario.model.js';

export async function listUsuarios(db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM usuarios WHERE deleted_at IS NULL ORDER BY apellido, nombre`
  );
  return rows.map(usuarioFromDb);
}

export async function insertUsuario({ nombre, apellido, email, passwordHash, rolId }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nombre, apellido, email, passwordHash, rolId]
  );
  return usuarioFromDb(rows[0]);
}

export async function setActivo(id, activo, db = pool) {
  const { rows } = await db.query(
    `UPDATE usuarios SET activo = $2, updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, activo]
  );
  return rows[0] ? usuarioFromDb(rows[0]) : null;
}
