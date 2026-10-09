import { Router } from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { getBootstrap } from '../services/bootstrap.service.js';

const router = Router();

router.get(
  '/bootstrap',
  asyncHandler(async (req, res) => {
    res.json(await getBootstrap());
  })
);

export default router;
