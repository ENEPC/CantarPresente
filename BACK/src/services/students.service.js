import { z } from 'zod';
import { participanteCampos } from '../models/participante.model.js';
import {
  cerrarMembresia,
  insertParticipante,
  listMembresiasActivas,
  updateParticipante,
  upsertMembresiaActiva,
} from '../repositories/students.repo.js';
import { withTransaction } from '../config/db.js';
import { parseBody } from '../utils/validate.js';
import { badRequest, notFound } from '../utils/errors.js';

const createApiSchema = z
  .object({
    id: z.string().uuid().optional(),
    nombre: participanteCampos.nombre,
    apellido: participanteCampos.apellido,
    dni: participanteCampos.dni,
    fechaNacimiento: participanteCampos.fechaNacimiento.nullable().optional(),
    responsableNombre: participanteCampos.responsableNombre.nullable().optional(),
    responsableTelefono: participanteCampos.responsableTelefono.nullable().optional(),
    observaciones: participanteCampos.observaciones.nullable().optional(),
    activo: z.boolean().default(true),
    coroIds: z.array(z.string().uuid()).default([]),
  })
  .strict();

const updateApiSchema = z
  .object({
    nombre: participanteCampos.nombre.optional(),
    apellido: participanteCampos.apellido.optional(),
    dni: participanteCampos.dni.optional(),
    fechaNacimiento: participanteCampos.fechaNacimiento.nullable().optional(),
    responsableNombre: participanteCampos.responsableNombre.nullable().optional(),
    responsableTelefono: participanteCampos.responsableTelefono.nullable().optional(),
    observaciones: participanteCampos.observaciones.nullable().optional(),
    activo: participanteCampos.activo.optional(),
    coroIds: z.array(z.string().uuid()).optional(),
  })
  .strict();

export async function createStudent(body) {
  const datos = parseBody(createApiSchema, body);
  const { coroIds, ...datosParticipante } = datos;

  return withTransaction(async (db) => {
    const participante = await insertParticipante(datosParticipante, db);
    for (const coroId of coroIds) {
      await upsertMembresiaActiva({ participanteId: participante.id, coroId }, db);
    }
    return { ...participante, coroIds };
  });
}

export async function updateStudent(id, body) {
  const datos = parseBody(updateApiSchema, body);
  if (Object.keys(datos).length === 0) throw badRequest('Sin campos para actualizar');

  return withTransaction(async (db) => {
    const participante = await updateParticipante(id, datos, db);
    if (!participante) throw notFound('Participante no encontrado');

    if (datos.coroIds) {
      const actuales = await listMembresiasActivas(id, db);
      const vigentes = new Set(actuales.map((m) => m.coroId));
      const nuevos = new Set(datos.coroIds);

      for (const coroId of datos.coroIds) {
        if (!vigentes.has(coroId)) {
          await upsertMembresiaActiva({ participanteId: id, coroId }, db);
        }
      }
      for (const membresia of actuales) {
        if (!nuevos.has(membresia.coroId)) {
          await cerrarMembresia(id, membresia.coroId, db);
        }
      }
    }

    return participante;
  });
}
