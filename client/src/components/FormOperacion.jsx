import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { formatoMoneda, validarMontoCliente } from '../utils/formato.js';

const OPERACIONES = {
  deposito: { label: 'Depositar', icono: '⬇️', boton: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300' },
  retiro: { label: 'Retirar', icono: '⬆️', boton: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-300' },
  transferencia: { label: 'Transferir', icono: '🔁', boton: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300' },
};

const inicial = { monto: '', cuentaDestino: '', descripcion: '' };

export default function FormOperacion({ cuenta, cuentas, onExito, onError }) {
  const [tipo, setTipo] = useState('deposito');
  const [form, setForm] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Limpiar formulario al cambiar de cuenta u operación
  useEffect(() => {
    setForm(inicial);
    setErrores({});
  }, [tipo, cuenta?.numeroCuenta]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrores((er) => ({ ...er, [name]: undefined }));
  };

  const validar = () => {
    const er = {};
    const maximo = tipo === 'deposito' ? undefined : cuenta.saldo;
    const eMonto = validarMontoCliente(form.monto, maximo);
    if (eMonto) er.monto = eMonto;
    if (tipo === 'transferencia') {
      const destino = form.cuentaDestino.trim();
      if (!destino) er.cuentaDestino = 'Indica la cuenta destino';
      else if (!/^\d{4,12}$/.test(destino)) er.cuentaDestino = 'Debe tener entre 4 y 12 dígitos';
      else if (destino === cuenta.numeroCuenta) er.cuentaDestino = 'No puedes transferir a tu misma cuenta';
    }
    setErrores(er);
    return Object.keys(er).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!cuenta || enviando || !validar()) return;

    setEnviando(true);
    try {
      const base = { monto: Number(form.monto), descripcion: form.descripcion.trim() };
      let res;
      if (tipo === 'deposito') res = await api.deposito({ ...base, numeroCuenta: cuenta.numeroCuenta });
      if (tipo === 'retiro') res = await api.retiro({ ...base, numeroCuenta: cuenta.numeroCuenta });
      if (tipo === 'transferencia') {
        res = await api.transferencia({
          ...base,
          cuentaOrigen: cuenta.numeroCuenta,
          cuentaDestino: form.cuentaDestino.trim(),
        });
      }
      setForm(inicial);
      onExito(res);
    } catch (err) {
      onError(err.message);
      if (err.status === 404 && tipo === 'transferencia') setErrores({ cuentaDestino: err.message });
    } finally {
      setEnviando(false);
    }
  };

  const op = OPERACIONES[tipo];
  const destinos = cuentas.filter((c) => c.numeroCuenta !== cuenta?.numeroCuenta);
  const inputBase =
    'w-full rounded-lg border bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:ring-2 disabled:bg-slate-100';
  const inputClase = (campo) =>
    `${inputBase} ${errores[campo] ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'}`;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Nueva operación</h2>

      <div role="tablist" className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {Object.entries(OPERACIONES).map(([clave, o]) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={tipo === clave}
            onClick={() => setTipo(clave)}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition ${
              tipo === clave ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="mr-1">{o.icono}</span>
            {o.label}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
        {tipo === 'transferencia' && (
          <div>
            <label htmlFor="cuentaDestino" className="mb-1 block text-sm font-medium text-slate-700">
              Cuenta destino
            </label>
            <input
              id="cuentaDestino"
              name="cuentaDestino"
              list="lista-destinos"
              inputMode="numeric"
              placeholder="Ej. 1002"
              value={form.cuentaDestino}
              onChange={cambiar}
              disabled={enviando}
              className={inputClase('cuentaDestino')}
            />
            <datalist id="lista-destinos">
              {destinos.map((c) => (
                <option key={c.numeroCuenta} value={c.numeroCuenta}>
                  {c.titular}
                </option>
              ))}
            </datalist>
            {errores.cuentaDestino && <p className="mt-1 text-xs text-rose-600">{errores.cuentaDestino}</p>}
          </div>
        )}

        <div>
          <label htmlFor="monto" className="mb-1 block text-sm font-medium text-slate-700">
            Monto (S/)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">S/</span>
            <input
              id="monto"
              name="monto"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.monto}
              onChange={cambiar}
              disabled={enviando}
              className={`${inputClase('monto')} pl-9`}
            />
          </div>
          {errores.monto ? (
            <p className="mt-1 text-xs text-rose-600">{errores.monto}</p>
          ) : (
            tipo !== 'deposito' &&
            cuenta && <p className="mt-1 text-xs text-slate-500">Disponible: {formatoMoneda(cuenta.saldo)}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
            Descripción <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="descripcion"
            name="descripcion"
            maxLength={120}
            placeholder="Ej. Pago de alquiler"
            value={form.descripcion}
            onChange={cambiar}
            disabled={enviando}
            className={inputClase('descripcion')}
          />
        </div>

        <button
          type="submit"
          disabled={!cuenta || enviando}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${op.boton}`}
        >
          {enviando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {enviando ? 'Procesando…' : `${op.label}${form.monto ? ` ${formatoMoneda(Number(form.monto) || 0)}` : ''}`}
        </button>
      </form>
    </section>
  );
}
