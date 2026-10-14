import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { login } from '../services/auth.service.js';
import { parseBody } from '../utils/validate.js';

const router = Router();

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1).max(200),
  })
  .strict();

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = parseBody(loginSchema, req.body);
    res.json(await login(email, password));
  })
);

router.get('/auth/me', requireAuth, (req, res) => {
  res.json(req.usuario);
});

export default router;
