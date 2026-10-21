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
  'id', 'nombre', 'apellido', 'dni', 'fechaNacimiento', 'responsableNombre',
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

const TIPOS_TEXTO = {
  [TIPOS.crearAlumno]: 'Crear alumno',
  [TIPOS.editarAlumno]: 'Editar alumno',
  [TIPOS.crearCoro]: 'Crear coro',
  [TIPOS.editarCoro]: 'Editar coro',
  [TIPOS.syncAsistencia]: 'Asistencia',
};

// Descripción legible de la operación para el panel de errores.
export function describirOp(op, choirs = []) {
  const base = TIPOS_TEXTO[op.tipo] || op.tipo;
  const p = op.payload || {};
  switch (op.tipo) {
    case TIPOS.crearAlumno:
    case TIPOS.editarAlumno: {
      const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ') || p.id;
      return `${base}: ${nombre}`;
    }
    case TIPOS.crearCoro:
    case TIPOS.editarCoro:
      return `${base}: ${p.nombre || p.id}`;
    case TIPOS.syncAsistencia: {
      const clase = p.lote?.clase;
      const coro = choirs.find((c) => c.id === clase?.coroId);
      return `${base}${clase?.fecha ? ` del ${clase.fecha}` : ''}${coro ? ` · ${coro.nombre}` : ''}`;
    }
    default:
      return base;
  }
}

// Los errores guardados antes de este cambio son strings planos; se normalizan
// a { mensaje } para que el panel los muestre igual que los nuevos.
function normalizarError(op) {
  return {
    ...op,
    error: typeof op.error === 'string' ? { mensaje: op.error } : op.error,
  };
}

export function useSync({ setChoirs, setStudents, setAttendances }) {
  const [pendientes, setPendientes] = useState(0);
  const [errores, setErrores] = useState(0);
  const [erroresDetalle, setErroresDetalle] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const enProgreso = useRef(false);

  useEffect(() => {
    const actualizar = (cola) => {
      setPendientes(cola.filter((op) => !op.error).length);
      setErrores(cola.filter((op) => op.error).length);
      setErroresDetalle(cola.filter((op) => op.error).map(normalizarError));
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
      // Incluye coros inactivos: la baja es lógica (activo=false) y deben
      // poder verse/reactivarse desde la UI, igual que los participantes.
      const servidor = (data.coros || []).filter(
        (c) =>
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
            markError(op.id, {
              mensaje: err.message,
              status: err.status,
              detalles: err.detalles ?? null,
            });
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

  return {
    pendientes,
    errores,
    erroresDetalle,
    sincronizando,
    sincronizar,
    descartarError: removeOp,
  };
}
