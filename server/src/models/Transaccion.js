import mongoose from 'mongoose';

export const TIPOS = ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'];

const transaccionSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: TIPOS, required: true },
    montoCentimos: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'Monto inválido' },
    },
    // DEPOSITO: solo cuentaDestino | RETIRO: solo cuentaOrigen | TRANSFERENCIA: ambas
    cuentaOrigen: { type: String, default: null, index: true },
    cuentaDestino: { type: String, default: null, index: true },
    descripcion: { type: String, trim: true, maxlength: 120, default: '' },
    fecha: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export default mongoose.model('Transaccion', transaccionSchema, 'transacciones');
