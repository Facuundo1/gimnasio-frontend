import { useState } from 'react';
import { primerError } from '../lib/validators';

/**
 * Maneja los valores de un formulario y sus errores de validación.
 *
 *   const f = useFormulario({ correo: '' }, { correo: reglasCorreo });
 *   <Input label="Correo" {...f.campo('correo')} />
 *   const { valido, primero } = f.validar();   // al enviar
 *
 * El error aparece al salir del campo (blur) o al enviar, y se actualiza
 * mientras se escribe si el campo ya tenía un error.
 * El orden de las claves de `reglas` define a qué campo va el foco primero.
 */
export default function useFormulario(inicial, reglas) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});

  const mensaje = (nombre, actuales) => primerError(reglas[nombre] ?? [], actuales[nombre], actuales);

  const campo = (nombre) => ({
    name: nombre,
    value: valores[nombre],
    error: errores[nombre],
    onChange: (e) => {
      const actuales = { ...valores, [nombre]: e.target.value };
      setValores(actuales);
      if (errores[nombre]) setErrores((prev) => ({ ...prev, [nombre]: mensaje(nombre, actuales) }));
    },
    onBlur: () => setErrores((prev) => ({ ...prev, [nombre]: mensaje(nombre, valores) })),
  });

  const validar = () => {
    const nuevos = {};
    for (const nombre of Object.keys(reglas)) nuevos[nombre] = mensaje(nombre, valores);
    setErrores(nuevos);
    const primero = Object.keys(nuevos).find((n) => nuevos[n]);
    return { valido: !primero, primero };
  };

  const establecer = (nombre, valor) => {
    setValores((v) => ({ ...v, [nombre]: valor }));
    setErrores((prev) => ({ ...prev, [nombre]: '' }));
  };

  const marcarError = (nombre, texto) => setErrores((prev) => ({ ...prev, [nombre]: texto }));

  return { valores, errores, campo, validar, establecer, marcarError };
}
