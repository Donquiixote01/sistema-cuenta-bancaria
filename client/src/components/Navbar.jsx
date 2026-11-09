export default function Navbar({ cuentas, seleccionada, onSeleccionar, onRefrescar, cargando }) {
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white shadow-lg">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-2xl">🏦</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Banco Andino</h1>
            <p className="text-xs text-indigo-100">Banca por internet</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cuenta" className="text-sm text-indigo-100 max-sm:sr-only">
            Cuenta:
          </label>
          <select
            id="cuenta"
            value={seleccionada ?? ''}
            onChange={(e) => onSeleccionar(e.target.value)}
            className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium outline-none transition focus:border-white focus:ring-2 focus:ring-white/40 sm:w-72 [&>option]:text-slate-800"
          >
            {cuentas.length === 0 && <option value="">Sin cuentas</option>}
            {cuentas.map((c) => (
              <option key={c.numeroCuenta} value={c.numeroCuenta}>
                {c.numeroCuenta} · {c.titular}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRefrescar}
            disabled={cargando}
            title="Actualizar"
            className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:opacity-50"
          >
            <svg className={`h-5 w-5 ${cargando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
