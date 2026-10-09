import { z } from 'zod';
import { toIsoString, toYmd } from './helpers.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const membresiaSchema = z.object({
  id: z.string().uuid(),
  participanteId: z.string().uuid(),
  coroId: z.string().uuid(),
  fechaAlta: z.string().regex(FECHA),
  fechaBaja: z.string().regex(FECHA).nullable(),
  rol: z.enum(['integrante', 'jefe_cuerda']).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export function membresiaFromDb(row) {
  return {
    id: row.id,
    participanteId: row.participante_id,
    coroId: row.coro_id,
    fechaAlta: toYmd(row.fecha_alta),
    fechaBaja: toYmd(row.fecha_baja),
    rol: row.rol,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function membresiaToDb(membresia) {
  return {
    id: membresia.id,
    participante_id: membresia.participanteId,
    coro_id: membresia.coroId,
    fecha_alta: membresia.fechaAlta,
    fecha_baja: membresia.fechaBaja ?? null,
    rol: membresia.rol ?? null,
    created_at: membresia.createdAt,
    updated_at: membresia.updatedAt,
  };
}
