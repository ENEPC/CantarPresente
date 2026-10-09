import { z } from 'zod';
import { toIsoString } from './helpers.js';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const coroCampos = {
  nombre: z.string().min(1).max(120),
  sedeId: z.string().uuid(),
  activo: z.boolean(),
  // diaSemana/horario: agregados al DDL en v0.2 (PUT /api/choirs/:id los menciona).
  diaSemana: z.enum(DIAS_SEMANA).nullable().optional(),
  horario: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .optional(),
};

export const coroSchema = z.object({
  id: z.string().uuid(),
  ...coroCampos,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
});

export const coroCreateSchema = z
  .object({
    id: z.string().uuid().optional(),
    ...coroCampos,
  })
  .strict();

export const coroUpdateSchema = z.object({ ...coroCampos }).partial().strict();

export function coroFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    sedeId: row.sede_id,
    activo: row.activo,
    diaSemana: row.dia_semana ?? null,
    horario: row.horario ? String(row.horario).slice(0, 5) : null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: toIsoString(row.deleted_at),
  };
}

export function coroToDb(coro) {
  return {
    id: coro.id,
    nombre: coro.nombre,
    sede_id: coro.sedeId,
    activo: coro.activo,
    dia_semana: coro.diaSemana ?? null,
    horario: coro.horario ?? null,
    created_at: coro.createdAt,
    updated_at: coro.updatedAt,
    deleted_at: coro.deletedAt ?? null,
  };
}
