import { ApiError } from '../utils/errors.js';

// Express 4 no reenvía promesas rechazadas al error handler: este wrapper lo hace.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const ERRORES_PG = {
  '23505': { status: 409, mensaje: 'Registro duplicado' },
  '23503': { status: 409, mensaje: 'Referencia a un registro inexistente' },
  '23514': { status: 422, mensaje: 'El valor viola una restricción de la base de datos' },
};

// Express detecta el error handler por sus 4 parámetros (next no se usa pero debe estar).
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, detalles: err.detalles });
  }
  if (ERRORES_PG[err.code]) {
    const { status, mensaje } = ERRORES_PG[err.code];
    return res.status(status).json({ error: mensaje });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('Error no controlado:', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
