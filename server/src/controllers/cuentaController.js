import Cuenta from '../models/Cuenta.js';
import * as servicio from '../services/cuentaService.js';
import AppError from '../utils/AppError.js';
import { serializarCuenta, serializarTransaccion } from '../utils/serializar.js';
import { validarMonto, validarNumeroCuenta, validarDescripcion } from '../utils/validaciones.js';

const body = (req) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new AppError('El cuerpo de la petición debe ser JSON', 400);
  }
  return req.body;
};

// GET /api/cuentas  (auxiliar: listado para el selector de cuenta del frontend)
export async function listarCuentas(_req, res) {
  const cuentas = await Cuenta.find().sort({ numeroCuenta: 1 }).lean();
  res.json({ ok: true, data: cuentas.map(serializarCuenta) });
}

// GET /api/cuenta/:id
export async function obtenerCuenta(req, res) {
  const numero = validarNumeroCuenta(req.params.id, 'id');
  const cuenta = await servicio.obtenerCuenta(numero);
  res.json({ ok: true, data: serializarCuenta(cuenta) });
}

// POST /api/cuenta/deposito   { numeroCuenta, monto, descripcion? }
export async function depositar(req, res) {
  const b = body(req);
  const numeroCuenta = validarNumeroCuenta(b.numeroCuenta);
  const centimos = validarMonto(b.monto);
  const descripcion = validarDescripcion(b.descripcion);

  const { cuenta, transaccion } = await servicio.depositar({ numeroCuenta, centimos, descripcion });
  res.status(201).json({
    ok: true,
    mensaje: 'Depósito realizado con éxito',
    data: { cuenta: serializarCuenta(cuenta), transaccion: serializarTransaccion(transaccion) },
  });
}

// POST /api/cuenta/retiro   { numeroCuenta, monto, descripcion? }
export async function retirar(req, res) {
  const b = body(req);
  const numeroCuenta = validarNumeroCuenta(b.numeroCuenta);
  const centimos = validarMonto(b.monto);
  const descripcion = validarDescripcion(b.descripcion);

  const { cuenta, transaccion } = await servicio.retirar({ numeroCuenta, centimos, descripcion });
  res.status(201).json({
    ok: true,
    mensaje: 'Retiro realizado con éxito',
    data: { cuenta: serializarCuenta(cuenta), transaccion: serializarTransaccion(transaccion) },
  });
}

// POST /api/cuenta/transferencia   { cuentaOrigen, cuentaDestino, monto, descripcion? }
export async function transferir(req, res) {
  const b = body(req);
  const origen = validarNumeroCuenta(b.cuentaOrigen, 'cuentaOrigen');
  const destino = validarNumeroCuenta(b.cuentaDestino, 'cuentaDestino');
  const centimos = validarMonto(b.monto);
  const descripcion = validarDescripcion(b.descripcion);

  const { cuenta, transaccion } = await servicio.transferir({ origen, destino, centimos, descripcion });
  res.status(201).json({
    ok: true,
    mensaje: `Transferencia a la cuenta ${destino} realizada con éxito`,
    data: { cuenta: serializarCuenta(cuenta), transaccion: serializarTransaccion(transaccion) },
  });
}

// GET /api/cuenta/:id/historial?limite=20
export async function historial(req, res) {
  const numero = validarNumeroCuenta(req.params.id, 'id');
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 100);
  const movimientos = await servicio.historial(numero, limite);
  res.json({ ok: true, data: movimientos.map(serializarTransaccion) });
}
