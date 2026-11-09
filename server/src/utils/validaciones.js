import AppError from './AppError.js';

export const MONTO_MAXIMO = 50_000; // tope por operación (S/)

/** Convierte soles (número o string) a céntimos enteros validando reglas de negocio. */
export function validarMonto(valor) {
  if (valor === undefined || valor === null || valor === '') {
    throw new AppError('El monto es obligatorio', 400);
  }
  const monto = typeof valor === 'string' ? Number(valor.trim()) : valor;

  if (typeof monto !== 'number' || !Number.isFinite(monto)) {
    throw new AppError('El monto debe ser un número válido', 400);
  }
  if (monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0', 400);
  }
  if (monto > MONTO_MAXIMO) {
    throw new AppError(`El monto no puede superar S/ ${MONTO_MAXIMO.toLocaleString('es-PE')}`, 400);
  }
  const centimos = Math.round(monto * 100);
  if (Math.abs(monto * 100 - centimos) > 1e-6) {
    throw new AppError('El monto admite como máximo 2 decimales', 400);
  }
  return centimos;
}

export function validarNumeroCuenta(valor, campo = 'numeroCuenta') {
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw new AppError(`El campo "${campo}" es obligatorio`, 400);
  }
  const numero = String(valor).trim();
  if (!/^\d{4,12}$/.test(numero)) {
    throw new AppError(`El campo "${campo}" debe tener entre 4 y 12 dígitos`, 400);
  }
  return numero;
}

export function validarDescripcion(valor) {
  if (valor === undefined || valor === null) return '';
  if (typeof valor !== 'string') throw new AppError('La descripción debe ser texto', 400);
  const texto = valor.trim();
  if (texto.length > 120) throw new AppError('La descripción admite máximo 120 caracteres', 400);
  return texto;
}

export const aSoles = (centimos) => Math.round(centimos) / 100;
