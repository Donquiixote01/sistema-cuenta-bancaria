import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cuentaRoutes from './routes/cuentaRoutes.js';
import { noEncontrado, manejadorErrores } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

// Log simple de peticiones
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () =>
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`)
  );
  next();
});

app.get('/api/health', (_req, res) => {
  const conectado = mongoose.connection.readyState === 1;
  res.status(conectado ? 200 : 500).json({ ok: conectado, db: conectado ? 'conectada' : 'desconectada' });
});

app.use('/api', cuentaRoutes);

app.use(noEncontrado);
app.use(manejadorErrores);

export default app;
