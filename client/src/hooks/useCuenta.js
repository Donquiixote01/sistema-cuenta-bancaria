import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

/**
 * Estado de la cuenta seleccionada: datos, historial, carga y errores.
 * Se recarga automáticamente (useEffect) al cambiar de cuenta.
 */
export function useCuenta(numeroCuenta) {
  const [cuenta, setCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!numeroCuenta) return;
    setCargando(true);
    setError(null);
    try {
      const [c, h] = await Promise.all([api.obtenerCuenta(numeroCuenta), api.historial(numeroCuenta)]);
      setCuenta(c);
      setHistorial(h);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [numeroCuenta]);

  useEffect(() => {
    let cancelado = false;
    if (!numeroCuenta) {
      setCuenta(null);
      setHistorial([]);
      return;
    }
    setCargando(true);
    setError(null);
    Promise.all([api.obtenerCuenta(numeroCuenta), api.historial(numeroCuenta)])
      .then(([c, h]) => {
        if (cancelado) return;
        setCuenta(c);
        setHistorial(h);
      })
      .catch((e) => !cancelado && setError(e.message))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [numeroCuenta]);

  /** Aplica el resultado de una operación: saldo inmediato + nuevo movimiento al inicio. */
  const aplicarOperacion = useCallback(({ cuenta: actualizada, transaccion }) => {
    setCuenta(actualizada);
    setHistorial((prev) => [transaccion, ...prev.filter((t) => t.id !== transaccion.id)].slice(0, 20));
  }, []);

  return { cuenta, historial, cargando, error, recargar, aplicarOperacion };
}
