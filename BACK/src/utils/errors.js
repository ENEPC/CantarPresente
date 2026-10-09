export class ApiError extends Error {
  constructor(status, message, detalles = null) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

export function badRequest(mensaje = 'Datos inválidos') {
  return new ApiError(400, mensaje);
}

export function notFound(mensaje = 'Recurso no encontrado') {
  return new ApiError(404, mensaje);
}

export function unprocessable(detalles, mensaje = 'Validación fallida') {
  return new ApiError(422, mensaje, detalles);
}
