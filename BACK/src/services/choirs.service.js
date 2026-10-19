import { z } from 'zod';
import { coroCampos } from '../models/coro.model.js';
import { ensureSede, insertCoro, updateCoro } from '../repositories/choirs.repo.js';
import { parseBody } from '../utils/validate.js';
import { badRequest, notFound } from '../utils/errors.js';

// Mapeo coro/sede (opción A): el coro llega con su sede; ensureSede la crea si no existe.
// id opcional: el cliente puede mandar el objeto sede completo (con id); ensureSede lo ignora.
const sedeApiSchema = z
  .object({
    id: z.string().uuid().optional(),
    nombre: z.string().min(1).max(120),
    localidad: z.string().max(120).nullable().optional(),
  })
  .strict();

const createApiSchema = z
  .object({
    id: z.string().uuid().optional(),
    nombre: coroCampos.nombre,
    sede: sedeApiSchema,
    activo: z.boolean().default(true),
    diaSemana: coroCampos.diaSemana,
    horario: coroCampos.horario,
  })
  .strict();

const updateApiSchema = z
  .object({
    nombre: coroCampos.nombre.optional(),
    sede: sedeApiSchema.optional(),
    activo: coroCampos.activo.optional(),
    diaSemana: coroCampos.diaSemana,
    horario: coroCampos.horario,
  })
  .strict();

export async function createChoir(body) {
  const datos = parseBody(createApiSchema, body);
  const sede = await ensureSede(datos.sede);
  return insertCoro({
    id: datos.id,
    nombre: datos.nombre,
    sedeId: sede.id,
    activo: datos.activo,
    diaSemana: datos.diaSemana,
    horario: datos.horario,
  });
}

export async function updateChoir(id, body) {
  const datos = parseBody(updateApiSchema, body);
  if (Object.keys(datos).length === 0) throw badRequest('Sin campos para actualizar');

  if (datos.sede) {
    const sede = await ensureSede(datos.sede);
    datos.sedeId = sede.id;
    delete datos.sede;
  }

  const actualizado = await updateCoro(id, datos);
  if (!actualizado) throw notFound('Coro no encontrado');
  return actualizado;
}
