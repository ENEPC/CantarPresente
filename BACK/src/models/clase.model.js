import { z } from 'zod';
import { toIsoString, toYmd } from './helpers.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export const claseSchema = z.object({
  id: z.string().uuid(),
  coroId: z.string().uuid(),
  fecha: z.string().regex(FECHA),
  hora: z.string().regex(HORA).nullable(),
  usuarioId: z.string().uuid().nullable(),
  observaciones: z.string().max(500).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
});

export function claseFromDb(row) {
  return {
    id: row.id,
    coroId: row.coro_id,
    fecha: toYmd(row.fecha),
    hora: row.hora ? String(row.hora).slice(0, 5) : null,
    usuarioId: row.usuario_id,
    observaciones: row.observaciones,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: toIsoString(row.deleted_at),
  };
}

export function claseToDb(clase) {
  return {
    id: clase.id,
    coro_id: clase.coroId,
    fecha: clase.fecha,
    hora: clase.hora ?? null,
    usuario_id: clase.usuarioId ?? null,
    observaciones: clase.observaciones ?? null,
    created_at: clase.createdAt,
    updated_at: clase.updatedAt,
    deleted_at: clase.deletedAt ?? null,
  };
}
