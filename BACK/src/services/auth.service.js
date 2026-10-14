import bcrypt from 'bcryptjs';
import { getUsuarioPorEmail } from '../repositories/auth.repo.js';
import { signToken } from '../middlewares/auth.js';
import { usuarioPublicSchema } from '../models/usuario.model.js';
import { unauthorized } from '../utils/errors.js';

export async function login(email, password) {
  const usuario = await getUsuarioPorEmail(email);
  // Mismo mensaje para email inexistente, inactivo o password incorrecto:
  // no se revela cuál de las tres condiciones falló.
  if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw unauthorized('Credenciales inválidas');
  }

  return {
    token: signToken(usuario),
    usuario: usuarioPublicSchema.parse(usuario),
  };
}
