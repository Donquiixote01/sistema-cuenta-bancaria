import mongoose from 'mongoose';
import Cuenta from '../models/Cuenta.js';
import Transaccion from '../models/Transaccion.js';
import AppError from '../utils/AppError.js';
import { transaccionesDisponibles } from '../config/db.js';

/**
 * Ejecuta `trabajo(session)` dentro de una transacción de MongoDB si el
 * servidor la soporta (replica set). En un MongoDB standalone se ejecuta con
 * session = null y cada operación usa actualizaciones atómicas condicionales
 * más compensación (rollback manual) ante fallos parciales.
 */
async function ejecutarAtomico(trabajo) {
  if (!transaccionesDisponibles()) return trabajo(null);

  const session = await mongoose.startSession();
  try {
    let resultado;
    await session.withTransaction(async () => {
      resultado = await trabajo(session);
    });
    return resultado;
  } finally {
    await session.endSession();
  }
}

const opts = (session) => ({ new: true, runValidators: true, ...(session ? { session } : {}) });

export async function obtenerCuenta(numeroCuenta) {
  const cuenta = await Cuenta.findOne({ numeroCuenta }).lean();
  if (!cuenta) throw new AppError(`La cuenta ${numeroCuenta} no existe`, 404);
  return cuenta;
}

export async function depositar({ numeroCuenta, centimos, descripcion }) {
  return ejecutarAtomico(async (session) => {
    const cuenta = await Cuenta.findOneAndUpdate(
      { numeroCuenta },
      { $inc: { saldoCentimos: centimos } },
      opts(session)
    );
    if (!cuenta) throw new AppError(`La cuenta ${numeroCuenta} no existe`, 404);

    try {
      const [tx] = await Transaccion.create(
        [{ tipo: 'DEPOSITO', montoCentimos: centimos, cuentaDestino: numeroCuenta, descripcion }],
        session ? { session } : {}
      );
      return { cuenta, transaccion: tx };
    } catch (err) {
      if (!session) {
        await Cuenta.updateOne({ numeroCuenta }, { $inc: { saldoCentimos: -centimos } });
      }
      throw err;
    }
  });
}

export async function retirar({ numeroCuenta, centimos, descripcion }) {
  return ejecutarAtomico(async (session) => {
    // Condición atómica: solo descuenta si el saldo alcanza (nunca negativo)
    const cuenta = await Cuenta.findOneAndUpdate(
      { numeroCuenta, saldoCentimos: { $gte: centimos } },
      { $inc: { saldoCentimos: -centimos } },
      opts(session)
    );

    if (!cuenta) {
      const existe = await Cuenta.exists({ numeroCuenta }).session(session ?? null);
      if (!existe) throw new AppError(`La cuenta ${numeroCuenta} no existe`, 404);
      throw new AppError('Saldo insuficiente para realizar el retiro', 400);
    }

    try {
      const [tx] = await Transaccion.create(
        [{ tipo: 'RETIRO', montoCentimos: centimos, cuentaOrigen: numeroCuenta, descripcion }],
        session ? { session } : {}
      );
      return { cuenta, transaccion: tx };
    } catch (err) {
      if (!session) {
        await Cuenta.updateOne({ numeroCuenta }, { $inc: { saldoCentimos: centimos } });
      }
      throw err;
    }
  });
}

export async function transferir({ origen, destino, centimos, descripcion }) {
  if (origen === destino) {
    throw new AppError('La cuenta destino debe ser distinta a la cuenta origen', 400);
  }

  return ejecutarAtomico(async (session) => {
    const [cOrigen, cDestino] = await Promise.all([
      Cuenta.exists({ numeroCuenta: origen }).session(session ?? null),
      Cuenta.exists({ numeroCuenta: destino }).session(session ?? null),
    ]);
    if (!cOrigen) throw new AppError(`La cuenta origen ${origen} no existe`, 404);
    if (!cDestino) throw new AppError(`La cuenta destino ${destino} no existe`, 404);

    // 1) Débito condicional (atómico): evita saldos negativos y condiciones de carrera
    const cuentaOrigen = await Cuenta.findOneAndUpdate(
      { numeroCuenta: origen, saldoCentimos: { $gte: centimos } },
      { $inc: { saldoCentimos: -centimos } },
      opts(session)
    );
    if (!cuentaOrigen) throw new AppError('Saldo insuficiente para realizar la transferencia', 400);

    let cuentaDestino = null;
    try {
      // 2) Crédito en destino
      cuentaDestino = await Cuenta.findOneAndUpdate(
        { numeroCuenta: destino },
        { $inc: { saldoCentimos: centimos } },
        opts(session)
      );
      if (!cuentaDestino) throw new AppError(`La cuenta destino ${destino} no existe`, 404);

      // 3) Registro del movimiento
      const [tx] = await Transaccion.create(
        [{ tipo: 'TRANSFERENCIA', montoCentimos: centimos, cuentaOrigen: origen, cuentaDestino: destino, descripcion }],
        session ? { session } : {}
      );
      return { cuenta: cuentaOrigen, cuentaDestino, transaccion: tx };
    } catch (err) {
      // Compensación (solo modo standalone; con transacción Mongo hace rollback)
      if (!session) {
        await Cuenta.updateOne({ numeroCuenta: origen }, { $inc: { saldoCentimos: centimos } });
        if (cuentaDestino) {
          await Cuenta.updateOne({ numeroCuenta: destino }, { $inc: { saldoCentimos: -centimos } });
        }
      }
      throw err;
    }
  });
}

export async function historial(numeroCuenta, limite = 20) {
  await obtenerCuenta(numeroCuenta);
  return Transaccion.find({ $or: [{ cuentaOrigen: numeroCuenta }, { cuentaDestino: numeroCuenta }] })
    .sort({ fecha: -1, _id: -1 })
    .limit(limite)
    .lean();
}
