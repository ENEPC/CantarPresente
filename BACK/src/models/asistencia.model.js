import { z } from 'zod';
import { toIsoString } from './helpers.js';

export const ESTADOS_ASISTENCIA = ['presente', 'ausente', 'justificado'];

export const asistenciaSchema = z.object({
  claseId: z.string().uuid(),
  participanteId: z.string().uuid(),
  estado: z.enum(ESTADOS_ASISTENCIA),
  registradoPor: z.string().uuid().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

// No hay deletedAt: la PK compuesta (clase_id, participante_id) se pisa con upsert en el sync.

export function asistenciaFromDb(row) {
  return {
    claseId: row.clase_id,
    participanteId: row.participante_id,
    estado: row.estado,
    registradoPor: row.registrado_por,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export function asistenciaToDb(asistencia) {
  return {
    clase_id: asistencia.claseId,
    participante_id: asistencia.participanteId,
    estado: asistencia.estado,
    registrado_por: asistencia.registradoPor ?? null,
    created_at: asistencia.createdAt,
    updated_at: asistencia.updatedAt,
  };
}
