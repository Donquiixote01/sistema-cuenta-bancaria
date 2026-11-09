import mongoose from 'mongoose';

let soportaTransacciones = false;

/**
 * Conecta a MongoDB local y detecta si el servidor admite transacciones
 * multi-documento (requiere replica set). Si no, las operaciones usan
 * actualizaciones atómicas condicionales con compensación.
 */
export async function conectarDB(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    const info = await mongoose.connection.db.admin().command({ hello: 1 });
    soportaTransacciones = Boolean(info.setName);
  } catch {
    soportaTransacciones = false;
  }

  console.log(`✅ MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
  console.log(
    soportaTransacciones
      ? '🔒 Modo atómico: transacciones multi-documento (replica set)'
      : '🔒 Modo atómico: actualizaciones condicionales + compensación (standalone)'
  );

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB desconectado'));
  mongoose.connection.on('reconnected', () => console.log('🔁 MongoDB reconectado'));
}

export const transaccionesDisponibles = () => soportaTransacciones;
