import { useEffect, useRef, useState } from 'react';
import { formatoMoneda, formatoFecha } from '../utils/formato.js';

export default function SaldoCard({ cuenta, cargando }) {
  // Resalta brevemente la tarjeta cuando cambia el saldo
  const [destello, setDestello] = useState(null);
  const anterior = useRef(cuenta?.saldo);

  useEffect(() => {
    const prev = anterior.current;
    anterior.current = cuenta?.saldo;
    if (prev === undefined || cuenta?.saldo === undefined || prev === cuenta.saldo) return;
    setDestello(cuenta.saldo > prev ? 'sube' : 'baja');
    const t = setTimeout(() => setDestello(null), 900);
    return () => clearTimeout(t);
  }, [cuenta?.saldo]);

  if (!cuenta) {
    return (
      <section className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-10 w-48 rounded bg-slate-200" />
        <div className="mt-6 h-3 w-40 rounded bg-slate-200" />
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 p-6 text-white shadow-lg ring-4 transition-all duration-500 ${
        destello === 'sube' ? 'ring-emerald-400' : destello === 'baja' ? 'ring-rose-400' : 'ring-transparent'
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 -right-4 h-48 w-48 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-indigo-200">Saldo disponible</p>
          <p className={`mt-1 text-4xl font-bold tracking-tight transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            {formatoMoneda(cuenta.saldo)}
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{cuenta.moneda}</span>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-indigo-300">Titular</p>
          <p className="font-medium">{cuenta.titular}</p>
        </div>
        <div>
          <p className="text-indigo-300">N.º de cuenta</p>
          <p className="font-mono font-medium tracking-widest">{cuenta.numeroCuenta}</p>
        </div>
      </div>
      <p className="relative mt-4 text-xs text-indigo-300">Actualizado: {formatoFecha(cuenta.actualizadoEn)}</p>
    </section>
  );
}
