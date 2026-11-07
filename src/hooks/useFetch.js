import { useCallback, useEffect, useState } from 'react';

/**
 * Carga datos con una función `loader` (debe tener referencia estable:
 * definirla fuera del componente o con useCallback).
 * Devuelve { data, error, loading, reload }.
 */
export default function useFetch(loader) {
  const [estado, setEstado] = useState({ data: undefined, error: null });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    loader()
      .then((data) => vigente && setEstado({ data, error: null }))
      .catch((error) => vigente && setEstado((prev) => ({ data: prev.data, error })));
    return () => {
      vigente = false;
    };
  }, [loader, intento]);

  const reload = useCallback(() => setIntento((n) => n + 1), []);
  const loading = estado.data === undefined && !estado.error;
  return { data: estado.data, error: estado.error, loading, reload };
}
