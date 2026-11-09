import mongoose from 'mongoose';

/**
 * Los montos se guardan en CÉNTIMOS (enteros) para evitar errores de
 * redondeo de punto flotante (0.1 + 0.2 !== 0.3).
 */
const cuentaSchema = new mongoose.Schema(
  {
    numeroCuenta: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{4,12}$/, 'El número de cuenta debe tener entre 4 y 12 dígitos'],
    },
    titular: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true },
    moneda: { type: String, default: 'PEN', enum: ['PEN', 'USD'] },
    saldoCentimos: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El saldo no puede ser negativo'],
      validate: { validator: Number.isInteger, message: 'El saldo debe ser entero (céntimos)' },
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Cuenta', cuentaSchema, 'cuentas');
