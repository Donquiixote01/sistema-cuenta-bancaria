const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

export const formatoMoneda = (n) => soles.format(n ?? 0);
export const formatoFecha = (f) => fecha.format(new Date(f));

/** Valida el monto en el cliente (el backend valida de nuevo). Devuelve mensaje de error o null. */
export function validarMontoCliente(valor, maximo) {
  if (valor === '') return 'Ingresa un monto';
  const n = Number(valor);
  if (!Number.isFinite(n)) return 'Monto inválido';
  if (n <= 0) return 'El monto debe ser mayor a 0';
  if (!/^\d+(\.\d{1,2})?$/.test(String(valor).trim())) return 'Máximo 2 decimales';
  if (maximo !== undefined && n > maximo) return 'Saldo insuficiente';
  return null;
}
