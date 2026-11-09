import { aSoles } from './validaciones.js';

export const serializarCuenta = (c) => ({
  id: c._id,
  numeroCuenta: c.numeroCuenta,
  titular: c.titular,
  email: c.email ?? null,
  moneda: c.moneda,
  saldo: aSoles(c.saldoCentimos),
  actualizadoEn: c.updatedAt,
});

export const serializarTransaccion = (t) => ({
  id: t._id,
  tipo: t.tipo,
  monto: aSoles(t.montoCentimos),
  cuentaOrigen: t.cuentaOrigen,
  cuentaDestino: t.cuentaDestino,
  descripcion: t.descripcion,
  fecha: t.fecha,
});
