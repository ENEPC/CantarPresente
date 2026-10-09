import { unprocessable } from './errors.js';

function parseCon(schema, datos) {
  const resultado = schema.safeParse(datos);
  if (!resultado.success) {
    throw unprocessable(
      resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }))
    );
  }
  return resultado.data;
}

export function parseBody(schema, body) {
  return parseCon(schema, body);
}

export function parseQuery(schema, query) {
  return parseCon(schema, query);
}

export function parseParams(schema, params) {
  return parseCon(schema, params);
}
