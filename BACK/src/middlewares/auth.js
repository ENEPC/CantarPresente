import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { unauthorized, forbidden } from '../utils/errors.js';
import { asyncHandler } from './errorHandler.js';

// 30 días: el coordinador en sede debe seguir operando offline mientras el token viva.
const JWT_EXPIRACION = '30d';

// Ids fijados por el seed db/seeds/001_roles.sql.
export const ROLES = { VOLUNTARIO: 1, ADMIN: 2 };

export function signToken(usuario) {
  return jwt.sign({ rol: usuario.rolId }, process.env.JWT_SECRET, {
    subject: usuario.id,
    expiresIn: JWT_EXPIRACION,
  });
}

// Consulta por PK en cada request: desactivar o dar de baja un usuario revoca su
// acceso de inmediato (el JWT por sí solo seguiría válido hasta expirar).
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw unauthorized('Token requerido');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw unauthorized('Token inválido o vencido');
  }

  const { rows } = await pool.query(
    `SELECT id, nombre, apellido, email, rol_id
     FROM usuarios
     WHERE id = $1 AND activo AND deleted_at IS NULL`,
    [payload.sub]
  );
  if (rows.length === 0) throw unauthorized('Usuario no encontrado o desactivado');

  const row = rows[0];
  req.usuario = {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    rolId: row.rol_id,
  };
  next();
});

// Se usa después de requireAuth: restringe el acceso a los roles indicados.
export function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rolId)) next(forbidden());
    else next();
  };
}
