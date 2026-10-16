import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;
const app = createApp();

// Si no está corriendo en Vercel (entorno local), levantamos el puerto normalmente
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Exportamos la app para que Vercel pueda invocarla como función serverless
export default app;