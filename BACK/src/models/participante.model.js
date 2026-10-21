import { z } from 'zod';
import { toIsoString, toYmd } from './helpers.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const participanteCampos = {
  nombre: z.string().min(1).max(120),
  apellido: z.string().min(1).max(120),
  dni: z.string().regex(/^\d{7,8}$/),
  fechaNacimiento: z.string().regex(FECHA).nullable(),
  responsableNombre: z.string().max(120).nullable(),
  responsableTelefono: z.string().max(60).nullable(),
  observaciones: z.string().max(500).nullable(),
  activo: z.boolean(),
};

export const participanteSchema = z.object({
  id: z.string().uuid(),
  ...participanteCampos,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
});

export const participanteCreateSchema = z
  .object({
    id: z.string().uuid().optional(),
    ...participanteCampos,
  })
  .strict();

export const participanteUpdateSchema = z.object({ ...participanteCampos }).partial().strict();

export function participanteFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    dni: row.dni,
    fechaNacimiento: toYmd(row.fecha_nacimiento),
    responsableNombre: row.responsable_nombre,
    responsableTelefono: row.responsable_telefono,
    observaciones: row.observaciones,
    activo: row.activo,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    deletedAt: toIsoString(row.deleted_at),
  };
}

export function participanteToDb(participante) {
  return {
    id: participante.id,
    nombre: participante.nombre,
    apellido: participante.apellido,
    dni: participante.dni,
    fecha_nacimiento: participante.fechaNacimiento ?? null,
    responsable_nombre: participante.responsableNombre ?? null,
    responsable_telefono: participante.responsableTelefono ?? null,
    observaciones: participante.observaciones ?? null,
    activo: participante.activo,
    created_at: participante.createdAt,
    updated_at: participante.updatedAt,
    deleted_at: participante.deletedAt ?? null,
  };
}
