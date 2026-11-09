import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import SaldoCard from './components/SaldoCard.jsx';
import FormOperacion from './components/FormOperacion.jsx';
import HistorialTransacciones from './components/HistorialTransacciones.jsx';
import Alerta from './components/Alerta.jsx';
import { useCuenta } from './hooks/useCuenta.js';
import { api } from './services/api.js';

const CLAVE = 'banco:cuentaSeleccionada';
const leerGuardada = () => {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

export default function App() {
  const [cuentas, setCuentas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(leerGuardada);
  const [errorInicial, setErrorInicial] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const { cuenta, historial, cargando, error, recargar, aplicarOperacion } = useCuenta(seleccionada);

  const cargarCuentas = useCallback(async () => {
    try {
      const lista = await api.listarCuentas();
      setCuentas(lista);
      setErrorInicial(null);
      setSeleccionada((actual) =>
        lista.some((c) => c.numeroCuenta === actual) ? actual : lista[0]?.numeroCuenta ?? null
      );
    } catch (e) {
      setErrorInicial(e.message);
    }
  }, []);

  useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  useEffect(() => {
    try {
      if (seleccionada) localStorage.setItem(CLAVE, seleccionada);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [seleccionada]);

  const cerrarAlerta = useCallback(() => setAlerta(null), []);

  const onExito = (res) => {
    aplicarOperacion(res.data); // saldo + historial al instante, sin recargar
    setAlerta({ tipo: 'exito', mensaje: res.mensaje });
    cargarCuentas(); // sincroniza saldos del selector (incluye cuenta destino)
  };

  const refrescar = () => {
    cargarCuentas();
    recargar();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar
        cuentas={cuentas}
        seleccionada={seleccionada}
        onSeleccionar={setSeleccionada}
        onRefrescar={refrescar}
        cargando={cargando}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {(errorInicial || error) && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">⚠️ {errorInicial || error}</p>
            <button
              type="button"
              onClick={refrescar}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!errorInicial && cuentas.length === 0 ? (
          <p className="py-20 text-center text-slate-500">Cargando cuentas… (si persiste, ejecuta <code>npm run seed</code>)</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <SaldoCard cuenta={cuenta} cargando={cargando} />
              <FormOperacion
                cuenta={cuenta}
                cuentas={cuentas}
                onExito={onExito}
                onError={(m) => setAlerta({ tipo: 'error', mensaje: m })}
              />
            </div>
            <div className="lg:col-span-3">
              <HistorialTransacciones historial={historial} cuentaActual={seleccionada} cargando={cargando} />
            </div>
          </div>
        )}
      </main>

      <Alerta alerta={alerta} onCerrar={cerrarAlerta} />
    </div>
  );
}
