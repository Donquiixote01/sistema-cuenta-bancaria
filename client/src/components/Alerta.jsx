import { useEffect } from 'react';

const ESTILOS = {
  exito: { caja: 'border-emerald-200 bg-emerald-50 text-emerald-800', icono: '✅' },
  error: { caja: 'border-rose-200 bg-rose-50 text-rose-800', icono: '⚠️' },
};

/** Notificación flotante que se cierra sola a los 4 s. */
export default function Alerta({ alerta, onCerrar }) {
  useEffect(() => {
    if (!alerta) return;
    const t = setTimeout(onCerrar, 4000);
    return () => clearTimeout(t);
  }, [alerta, onCerrar]);

  if (!alerta) return null;
  const e = ESTILOS[alerta.tipo] ?? ESTILOS.exito;

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:w-96">
      <div className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${e.caja}`}>
        <span className="text-lg leading-none">{e.icono}</span>
        <p className="flex-1 text-sm font-medium">{alerta.mensaje}</p>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      </div>
    </div>
  );
}
