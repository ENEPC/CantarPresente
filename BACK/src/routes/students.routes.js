import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { createStudent, updateStudent } from '../services/students.service.js';
import { parseParams } from '../utils/validate.js';

const router = Router();

const paramsSchema = z.object({ id: z.string().uuid() }).strict();

router.post(
  '/students',
  asyncHandler(async (req, res) => {
    res.status(201).json(await createStudent(req.body));
  })
);

router.put(
  '/students/:id',
  asyncHandler(async (req, res) => {
    const { id } = parseParams(paramsSchema, req.params);
    res.json(await updateStudent(id, req.body));
  })
);

export default router;
