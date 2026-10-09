import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { createChoir, updateChoir } from '../services/choirs.service.js';
import { parseParams } from '../utils/validate.js';

const router = Router();

const paramsSchema = z.object({ id: z.string().uuid() }).strict();

router.post(
  '/choirs',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createChoir(req.body));
  })
);

router.put(
  '/choirs/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseParams(paramsSchema, req.params);
    res.json(await updateChoir(id, req.body));
  })
);

export default router;
