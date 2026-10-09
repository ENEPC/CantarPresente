import { z } from 'zod';
import { toIsoString } from './helpers.js';

const campos = {
  nombre: z.string().min(1).max(120),
  direccion: z.string().max(200).nullable(),
  localidad: z.string().max(120).nullable(),
  activa: z.boolean(),
};

export const sedeSchema = z.object({
  id: z.string().uuid(),
  ...campos,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
});

export function sedeFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    direccion: row.direccion,
    localidad: row.localidad,
    activa: row.activa,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: toIsoString(row.deleted_at),
  };
}

export function sedeToDb(sede) {
  return {
    id: sede.id,
    nombre: sede.nombre,
    direccion: sede.direccion ?? null,
    localidad: sede.localidad ?? null,
    activa: sede.activa,
    created_at: sede.createdAt,
    updated_at: sede.updatedAt,
    deleted_at: sede.deletedAt ?? null,
  };
}
