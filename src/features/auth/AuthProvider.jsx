import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { authApi, usuariosApi } from '../../services';
import { setUnauthorizedHandler, tokenStore } from '../../services/api';
import { normalizarRol } from '../../lib/roles';

const USER_KEY = 'ironpeak.user';

function tokenVencido(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return exp ? exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
}

function leerSesion() {
  const token = tokenStore.get();
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw || tokenVencido(token)) {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  const cerrarSesion = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  // Si el backend responde 401 con un token guardado, la sesión terminó.
  useEffect(() => {
    setUnauthorizedHandler(cerrarSesion);
  }, [cerrarSesion]);

  const abrirSesion = useCallback(async ({ token, usuario: u }) => {
    tokenStore.set(token);
    // El login no devuelve gimnasio ni teléfono: se completan con GET /usuarios/:id
    let completo = {};
    try {
      completo = await usuariosApi.obtener(u.id);
    } catch {
      /* se sigue con los datos básicos */
    }
    const sesion = {
      ...u,
      rol: normalizarRol(u.rol),
      telefono: completo.telefono ?? null,
      id_gimnasio: completo.id_gimnasio ?? null,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(sesion));
    setUsuario(sesion);
    return sesion;
  }, []);

  const login = useCallback(
    async (correo, password) => abrirSesion(await authApi.login(correo, password)),
    [abrirSesion],
  );

  const value = useMemo(
    () => ({ usuario, login, cerrarSesion }),
    [usuario, login, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
