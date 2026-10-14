import { pool } from '../config/db.js';
import { usuarioFromDb } from '../models/usuario.model.js';

export async function getUsuarioPorEmail(email, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM usuarios WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return rows[0] ? usuarioFromDb(rows[0]) : null;
}
