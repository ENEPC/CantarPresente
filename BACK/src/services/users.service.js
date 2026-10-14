import bcrypt from 'bcryptjs';
import {
  listUsuarios as listUsuariosRepo,
  insertUsuario,
  setActivo,
} from '../repositories/users.repo.js';
import { usuarioPublicSchema } from '../models/usuario.model.js';
import { notFound } from '../utils/errors.js';

const aPublico = (usuario) => usuarioPublicSchema.parse(usuario);

export async function listUsuarios() {
  return (await listUsuariosRepo()).map(aPublico);
}

export async function createUsuario({ nombre, apellido, email, password, rolId }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await insertUsuario({ nombre, apellido, email, passwordHash, rolId });
  return aPublico(usuario);
}

export async function setUsuarioActivo(id, activo) {
  const usuario = await setActivo(id, activo);
  if (!usuario) throw notFound('Usuario no encontrado');
  return aPublico(usuario);
}
