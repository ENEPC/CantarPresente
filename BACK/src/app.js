import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { requireAuth } from './middlewares/auth.js';
import authRoutes from './routes/auth.routes.js';
import bootstrapRoutes from './routes/bootstrap.routes.js';
import attendancesRoutes from './routes/attendances.routes.js';
import studentsRoutes from './routes/students.routes.js';
import choirsRoutes from './routes/choirs.routes.js';
import usersRoutes from './routes/users.routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  // 1mb: los lotes de sync pueden ser grandes; Vercel permite hasta 4.5mb.
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor Cantar Presente en línea' });
  });

  // /auth/login es público; /auth/me pide token internamente.
  app.use('/api', authRoutes);
  app.use(
    '/api',
    requireAuth,
    bootstrapRoutes,
    attendancesRoutes,
    studentsRoutes,
    choirsRoutes,
    usersRoutes
  );

  app.use(errorHandler);

  return app;
}
