import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function noEncontrado(req, _res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, _req, res, _next) {
  let status = 500;
  let mensaje = 'Error interno del servidor';

  if (err instanceof AppError) {
    status = err.status;
    mensaje = err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    mensaje = 'JSON mal formado en el cuerpo de la petición';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    mensaje = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    mensaje = `Valor inválido para "${err.path}"`;
  }

  if (status === 500) console.error('❌', err);

  res.status(status).json({ ok: false, error: mensaje });
}
