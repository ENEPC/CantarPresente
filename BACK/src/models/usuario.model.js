import { z } from 'zod';
import { toIsoString } from './helpers.js';

export const usuarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).max(120),
  apellido: z.string().min(1).max(120),
  email: z.string().email().max(200),
  passwordHash: z.string(),
  rolId: z.number().int().positive(),
  activo: z.boolean(),
  ultimaSincronizacion: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
});

// El hash nunca sale de la BD hacia el cliente.
export const usuarioPublicSchema = usuarioSchema.omit({ passwordHash: true });

export function usuarioFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    passwordHash: row.password_hash,
    rolId: row.rol_id,
    activo: row.activo,
    ultimaSincronizacion: toIsoString(row.ultima_sincronizacion),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: toIsoString(row.deleted_at),
  };
}

export function usuarioToDb(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    password_hash: usuario.passwordHash,
    rol_id: usuario.rolId,
    activo: usuario.activo,
    ultima_sincronizacion: usuario.ultimaSincronizacion ?? null,
    created_at: usuario.createdAt,
    updated_at: usuario.updatedAt,
    deleted_at: usuario.deletedAt ?? null,
  };
}
