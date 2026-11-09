/**
 * Script seed: reinicia la BD y crea cuentas de prueba con movimientos
 * iniciales coherentes con sus saldos.
 *   npm run seed
 */
import mongoose from 'mongoose';
import Cuenta from './models/Cuenta.js';
import Transaccion from './models/Transaccion.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/banco_db';

const cuentas = [
  { numeroCuenta: '1001', titular: 'Ana Torres Rojas', email: 'ana.torres@demo.pe', saldoInicial: 2500 },
  { numeroCuenta: '1002', titular: 'Luis Ramos Huamán', email: 'luis.ramos@demo.pe', saldoInicial: 1200.5 },
  { numeroCuenta: '1003', titular: 'María Quispe Soto', email: 'maria.quispe@demo.pe', saldoInicial: 800 },
  { numeroCuenta: '1004', titular: 'Carlos Paredes Lima', email: 'carlos.paredes@demo.pe', saldoInicial: 50 },
  { numeroCuenta: '1005', titular: 'Rosa Mendoza Ccori', email: 'rosa.mendoza@demo.pe', saldoInicial: 0 },
];

// Movimientos de ejemplo aplicados después del depósito de apertura
const movimientos = [
  { tipo: 'DEPOSITO', destino: '1001', monto: 500, descripcion: 'Pago de haberes' },
  { tipo: 'RETIRO', origen: '1001', monto: 150, descripcion: 'Retiro en cajero' },
  { tipo: 'TRANSFERENCIA', origen: '1001', destino: '1002', monto: 300, descripcion: 'Pago de alquiler' },
  { tipo: 'TRANSFERENCIA', origen: '1002', destino: '1003', monto: 120.75, descripcion: 'Cuota de viaje' },
  { tipo: 'DEPOSITO', destino: '1003', monto: 45.9, descripcion: 'Venta de libros' },
  { tipo: 'TRANSFERENCIA', origen: '1003', destino: '1001', monto: 60, descripcion: 'Devolución de préstamo' },
];

const c = (soles) => Math.round(soles * 100);

async function seed() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log(`🌱 Conectado a ${MONGODB_URI}`);

  await Promise.all([Cuenta.deleteMany({}), Transaccion.deleteMany({})]);
  await Promise.all([Cuenta.syncIndexes(), Transaccion.syncIndexes()]);

  const saldos = Object.fromEntries(cuentas.map((x) => [x.numeroCuenta, c(x.saldoInicial)]));
  const txs = [];
  let fecha = Date.now() - 1000 * 60 * 60 * 24 * 7; // hace 7 días
  const siguiente = () => new Date((fecha += 1000 * 60 * 60 * 6)); // +6 h

  for (const cta of cuentas) {
    if (cta.saldoInicial > 0) {
      txs.push({ tipo: 'DEPOSITO', montoCentimos: c(cta.saldoInicial), cuentaDestino: cta.numeroCuenta, descripcion: 'Depósito de apertura', fecha: siguiente() });
    }
  }

  for (const m of movimientos) {
    const monto = c(m.monto);
    if (m.origen) {
      if (saldos[m.origen] < monto) throw new Error(`Seed inválido: saldo insuficiente en ${m.origen}`);
      saldos[m.origen] -= monto;
    }
    if (m.destino) saldos[m.destino] += monto;
    txs.push({ tipo: m.tipo, montoCentimos: monto, cuentaOrigen: m.origen ?? null, cuentaDestino: m.destino ?? null, descripcion: m.descripcion, fecha: siguiente() });
  }

  await Cuenta.insertMany(
    cuentas.map(({ saldoInicial, ...resto }) => ({ ...resto, saldoCentimos: saldos[resto.numeroCuenta] }))
  );
  await Transaccion.insertMany(txs);

  console.log('\n✅ Base de datos inicializada. Cuentas de prueba:');
  console.table(
    cuentas.map((x) => ({ cuenta: x.numeroCuenta, titular: x.titular, saldo: `S/ ${(saldos[x.numeroCuenta] / 100).toFixed(2)}` }))
  );
  console.log(`📄 ${txs.length} transacciones registradas.`);
}

seed()
  .catch((err) => {
    console.error('❌ Error en seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
