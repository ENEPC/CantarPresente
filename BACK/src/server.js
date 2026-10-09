import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (Vite)
app.use(express.json()); // Permite recibir cuerpos JSON en POST y PUT

// Endpoint de prueba inicial
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor Cantar Presente en línea' });
});

// 1. GET /api/bootstrap
// Devuelve los datos iniciales necesarios para hidratar la PWA
app.get('/api/bootstrap', (req, res) => {
  res.status(200).json({
    choirs: [],
    students: [],
    attendances: []
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});