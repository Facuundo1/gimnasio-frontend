import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toast-context';

export default function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const contador = useRef(0);

  const mostrar = useCallback((tono, mensaje) => {
    contador.current += 1;
    const id = contador.current;
    setAvisos((prev) => [...prev, { id, tono, mensaje }]);
    setTimeout(() => setAvisos((prev) => prev.filter((a) => a.id !== id)), 4500);
  }, []);

  const value = useMemo(
    () => ({
      exito: (mensaje) => mostrar('success', mensaje),
      error: (mensaje) => mostrar('danger', mensaje),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast--${a.tono}`} role="status">
            {a.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
