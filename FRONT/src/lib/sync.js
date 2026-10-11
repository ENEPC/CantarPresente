import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getBootstrap,
  createStudent,
  updateStudent,
  createChoir,
  updateChoir,
  syncAttendances,
  listAttendances,
} from '../api';
import { getOutbox, removeOp, markError, subscribe } from './outbox.js';
import { getDispositivoId } from './ids.js';

const TIPOS = {
  crearAlumno: 'crearAlumno',
  editarAlumno: 'editarAlumno',
  crearCoro: 'crearCoro',
  editarCoro: 'editarCoro',
  syncAsistencia: 'syncAsistencia',
};

const ES_PENDIENTE = new Set([
  TIPOS.crearAlumno,
  TIPOS.editarAlumno,
  TIPOS.crearCoro,
  TIPOS.editarCoro,
]);

function pick(obj, campos) {
  const out = {};
  for (const campo of campos) {
    if (obj[campo] !== undefined) out[campo] = obj[campo];
  }
  return out;
}

// Los schemas del backend son estrictos: se envían solo los campos del contrato.
const CAMPOS_ALUMNO = [
  'id', 'nombre', 'apellido', 'fechaNacimiento', 'responsableNombre',
  'responsableTelefono', 'observaciones', 'activo', 'coroIds',
];
const CAMPOS_CORO = ['id', 'nombre', 'activo', 'diaSemana', 'horario', 'sede'];

export function construirLote(clase) {
  const ahora = new Date().toISOString();
  return {
    clase: {
      id: clase.id,
      coroId: clase.coroId,
      fecha: clase.fecha,
      hora: clase.hora ?? null,
      usuarioId: null,
      observaciones: clase.observaciones ?? null,
      createdAt: clase.createdAt ?? ahora,
      updatedAt: clase.updatedAt ?? ahora,
      deletedAt: null,
    },
    asistencias: Object.entries(clase.asistencias).map(([participanteId, estado]) => ({
      claseId: clase.id,
      participanteId,
      estado,
      registradoPor: null,
      createdAt: ahora,
      updatedAt: ahora,
    })),
  };
}

export function useSync({ setChoirs, setStudents, setAttendances }) {
  const [pendientes, setPendientes] = useState(0);
  const [errores, setErrores] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const enProgreso = useRef(false);

  useEffect(() => {
    const actualizar = (cola) => {
      setPendientes(cola.filter((op) => !op.error).length);
      setErrores(cola.filter((op) => op.error).length);
    };
    actualizar(getOutbox());
    return subscribe(actualizar);
  }, []);

  const ejecutarOp = async (op) => {
    switch (op.tipo) {
      case TIPOS.crearAlumno:
        await createStudent(pick(op.payload, CAMPOS_ALUMNO));
        break;
      case TIPOS.editarAlumno:
        await updateStudent(op.payload.id, pick(op.payload, CAMPOS_ALUMNO.filter((c) => c !== 'id')));
        break;
      case TIPOS.crearCoro:
        await createChoir(pick(op.payload, CAMPOS_CORO));
        break;
      case TIPOS.editarCoro:
        await updateChoir(op.payload.id, pick(op.payload, CAMPOS_CORO.filter((c) => c !== 'id')));
        break;
      case TIPOS.syncAsistencia:
        await syncAttendances({
          dispositivoId: getDispositivoId(),
          lotes: [op.payload.lote],
        });
        setAttendances((actuales) =>
          actuales.map((c) => (c.id === op.payload.claseId ? { ...c, synced: true } : c))
        );
        break;
    }
  };

  // Local gana para todo registro con una operación pendiente; el resto se
  // reemplaza por lo que dice el servidor.
  const mergeBootstrap = (data) => {
    const pendientesIds = new Set();
    for (const op of getOutbox()) {
      if (ES_PENDIENTE.has(op.tipo)) pendientesIds.add(`${op.tipo}:${op.payload.id}`);
    }

    setChoirs((actuales) => {
      const locales = actuales.filter((c) =>
        pendientesIds.has(`${TIPOS.crearCoro}:${c.id}`) ||
        pendientesIds.has(`${TIPOS.editarCoro}:${c.id}`)
      );
      const servidor = (data.coros || []).filter(
        (c) =>
          c.activo &&
          !pendientesIds.has(`${TIPOS.crearCoro}:${c.id}`) &&
          !pendientesIds.has(`${TIPOS.editarCoro}:${c.id}`)
      );
      return [...locales, ...servidor];
    });

    setStudents((actuales) => {
      const locales = actuales.filter((s) =>
        pendientesIds.has(`${TIPOS.crearAlumno}:${s.id}`) ||
        pendientesIds.has(`${TIPOS.editarAlumno}:${s.id}`)
      );
      const servidor = (data.students || []).filter(
        (s) =>
          !pendientesIds.has(`${TIPOS.crearAlumno}:${s.id}`) &&
          !pendientesIds.has(`${TIPOS.editarAlumno}:${s.id}`)
      );
      return [...locales, ...servidor];
    });
  };

  // Las asistencias locales no sincronizadas conviven con las del servidor
  // (agrupadas por clase); si el servidor ya tiene la clase, gana su versión.
  const mergeAttendancesServidor = (filas) => {
    const porClase = new Map();
    for (const fila of filas) {
      if (!porClase.has(fila.claseId)) {
        porClase.set(fila.claseId, {
          id: fila.claseId,
          coroId: fila.coroId,
          fecha: fila.fecha,
          asistencias: {},
          synced: true,
        });
      }
      porClase.get(fila.claseId).asistencias[fila.participanteId] = fila.estado;
    }
    const servidor = [...porClase.values()];
    const idsServidor = new Set(servidor.map((c) => c.id));

    setAttendances((locales) => [
      ...locales.filter((c) => !idsServidor.has(c.id)),
      ...servidor,
    ]);
  };

  const sincronizar = useCallback(async () => {
    if (enProgreso.current) return;
    enProgreso.current = true;
    setSincronizando(true);
    try {
      for (const op of [...getOutbox()]) {
        if (op.error) continue; // errores 4xx: no reintentar hasta revisión manual
        try {
          await ejecutarOp(op);
          removeOp(op.id);
        } catch (err) {
          if (err.status >= 400 && err.status < 500) {
            markError(op.id, err.message);
            continue;
          }
          break; // red/5xx: reintentar en la próxima pasada
        }
      }
      const data = await getBootstrap();
      mergeBootstrap(data);
      mergeAttendancesServidor(await listAttendances());
    } catch {
      // sin conexión o servidor caído: los pendientes quedan para la próxima
    } finally {
      enProgreso.current = false;
      setSincronizando(false);
    }
  }, [setChoirs, setStudents, setAttendances]);

  return { pendientes, errores, sincronizando, sincronizar };
}
