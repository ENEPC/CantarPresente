import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { listAttendances, processSync } from '../services/attendances.service.js';
import { parseQuery } from '../utils/validate.js';

const router = Router();

const querySchema = z
  .object({
    coroId: z.string().uuid().optional(),
    participanteId: z.string().uuid().optional(),
    desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();

router.post(
  '/attendances/sync',
  asyncHandler(async (req, res) => {
    res.json(await processSync(req.body));
  })
);

router.get(
  '/attendances',
  asyncHandler(async (req, res) => {
    const filtros = parseQuery(querySchema, req.query);
    res.json(await listAttendances(filtros));
  })
);

export default router;
