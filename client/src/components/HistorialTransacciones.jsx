import { formatoFecha, formatoMoneda } from '../utils/formato.js';

/** Interpreta cada movimiento desde la perspectiva de la cuenta actual. */
function describir(tx, cuentaActual) {
  if (tx.tipo === 'DEPOSITO') return { titulo: 'Depósito', signo: '+', icono: '⬇️', estilo: 'bg-emerald-100 text-emerald-700', monto: 'text-emerald-600' };
  if (tx.tipo === 'RETIRO') return { titulo: 'Retiro', signo: '−', icono: '⬆️', estilo: 'bg-rose-100 text-rose-700', monto: 'text-rose-600' };
  const enviada = tx.cuentaOrigen === cuentaActual;
  return enviada
    ? { titulo: 'Transferencia enviada', signo: '−', icono: '↗️', estilo: 'bg-amber-100 text-amber-700', monto: 'text-rose-600' }
    : { titulo: 'Transferencia recibida', signo: '+', icono: '↙️', estilo: 'bg-sky-100 text-sky-700', monto: 'text-emerald-600' };
}

export default function HistorialTransacciones({ historial, cuentaActual, cargando }) {
  return (
    <section className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Historial de movimientos</h2>
        <span className="text-xs text-slate-500">Últimos {historial.length}</span>
      </div>

      {cargando && historial.length === 0 ? (
        <ul className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex animate-pulse items-center gap-4 px-6 py-4">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            </li>
          ))}
        </ul>
      ) : historial.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">Aún no hay movimientos en esta cuenta.</p>
      ) : (
        <>
          {/* Vista móvil: tarjetas */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {historial.map((tx) => {
              const d = describir(tx, cuentaActual);
              return (
                <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${d.estilo}`}>{d.icono}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">{d.titulo}</p>
                    <p className="truncate text-xs text-slate-500">
                      {tx.cuentaOrigen ?? '—'} → {tx.cuentaDestino ?? '—'}
                      {tx.descripcion && ` · ${tx.descripcion}`}
                    </p>
                    <p className="text-xs text-slate-400">{formatoFecha(tx.fecha)}</p>
                  </div>
                  <span className={`whitespace-nowrap font-semibold ${d.monto}`}>
                    {d.signo} {formatoMoneda(tx.monto)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Vista escritorio: tabla */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Operación</th>
                  <th className="px-6 py-3 font-semibold">Origen</th>
                  <th className="px-6 py-3 font-semibold">Destino</th>
                  <th className="px-6 py-3 font-semibold">Fecha</th>
                  <th className="px-6 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historial.map((tx) => {
                  const d = describir(tx, cuentaActual);
                  return (
                    <tr key={tx.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-8 w-8 place-items-center rounded-full text-sm ${d.estilo}`}>{d.icono}</span>
                          <div>
                            <p className="font-medium text-slate-800">{d.titulo}</p>
                            {tx.descripcion && <p className="text-xs text-slate-500">{tx.descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600">{tx.cuentaOrigen ?? '—'}</td>
                      <td className="px-6 py-3 font-mono text-slate-600">{tx.cuentaDestino ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-3 text-slate-500">{formatoFecha(tx.fecha)}</td>
                      <td className={`whitespace-nowrap px-6 py-3 text-right font-semibold ${d.monto}`}>
                        {d.signo} {formatoMoneda(tx.monto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
