import { z } from 'zod';
import { claseSchema } from '../models/clase.model.js';
import { asistenciaSchema } from '../models/asistencia.model.js';
import { pool } from '../config/db.js';
import {
  insertSincronizacion,
  listAsistencias as listAsistenciasRepo,
  upsertAsistencia,
  upsertClase,
} from '../repositories/attendance.repo.js';
import { parseBody } from '../utils/validate.js';

const syncPayloadSchema = z
  .object({
    dispositivoId: z.string().min(1).max(100),
    lotes: z
      .array(
        z
          .object({
            clase: claseSchema,
            asistencias: z.array(asistenciaSchema),
          })
          .strict()
      )
      .max(100),
  })
  .strict();

export async function processSync(body, usuarioId = null) {
  const payload = parseBody(syncPayloadSchema, body);
  const client = await pool.connect();

  let registrosOk = 0;
  let registrosErr = 0;
  const errores = [];

  try {
    await client.query('BEGIN');
    for (const [i, lote] of payload.lotes.entries()) {
      // Savepoints: un lote que falla no arruina el resto de la tanda (RNF-18).
      try {
        await client.query(`SAVEPOINT lote_${i}`);
        const clase = await upsertClase(lote.clase, client);
        if (!clase) throw new Error('No se pudo resolver la clase del lote');
        for (const asistencia of lote.asistencias) {
          await upsertAsistencia({ ...asistencia, claseId: clase.id }, client);
          registrosOk += 1;
        }
        registrosOk += 1;
        await client.query(`RELEASE SAVEPOINT lote_${i}`);
      } catch (error) {
        await client.query(`ROLLBACK TO SAVEPOINT lote_${i}`);
        await client.query(`RELEASE SAVEPOINT lote_${i}`);
        registrosErr += lote.asistencias.length + 1;
        errores.push({ claseId: lote.clase.id, mensaje: error.message });
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const estado = registrosErr === 0 ? 'ok' : registrosOk === 0 ? 'error' : 'parcial';
  await insertSincronizacion({
    dispositivoId: payload.dispositivoId,
    usuarioId,
    registrosOk,
    registrosErr,
    estado,
    detalle: errores.length > 0 ? errores : null,
  });

  return { registrosOk, registrosErr, estado };
}

export async function listAttendances(filtros) {
  return listAsistenciasRepo(filtros);
}
