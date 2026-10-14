import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { requireRol, ROLES } from '../middlewares/auth.js';
import { listUsuarios, createUsuario, setUsuarioActivo } from '../services/users.service.js';
import { parseBody, parseParams } from '../utils/validate.js';

const router = Router();

// Gestión de usuarios: exclusiva de admin.
router.use(requireRol(ROLES.ADMIN));

const createSchema = z
  .object({
    nombre: z.string().min(1).max(120),
    apellido: z.string().min(1).max(120),
    email: z.string().email().max(200),
    password: z.string().min(6).max(200),
    rolId: z.number().int().positive(),
  })
  .strict();

const activoSchema = z.object({ activo: z.boolean() }).strict();
const paramsSchema = z.object({ id: z.string().uuid() }).strict();

router.get(
  '/usuarios',
  asyncHandler(async (req, res) => {
    res.json(await listUsuarios());
  })
);

router.post(
  '/usuarios',
  asyncHandler(async (req, res) => {
    const datos = parseBody(createSchema, req.body);
    res.status(201).json(await createUsuario(datos));
  })
);

router.patch(
  '/usuarios/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseParams(paramsSchema, req.params);
    const { activo } = parseBody(activoSchema, req.body);
    res.json(await setUsuarioActivo(id, activo));
  })
);

export default router;
