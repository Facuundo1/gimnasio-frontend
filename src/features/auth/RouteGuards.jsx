import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from './useAuth';
import { HOME_POR_ROL } from '../../lib/roles';

// Solo deja pasar a quienes tengan alguno de los roles indicados.
export function RequireRole({ roles }) {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(usuario.rol)) return <Navigate to={HOME_POR_ROL[usuario.rol]} replace />;
  return <Outlet />;
}

// Login y registro: si ya hay sesión, va al inicio de su rol.
export function PublicOnly() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to={HOME_POR_ROL[usuario.rol]} replace />;
  return <Outlet />;
}
