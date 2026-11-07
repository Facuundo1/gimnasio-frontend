import { Link } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import { HOME_POR_ROL } from '../../lib/roles';

export default function NotFound() {
  const { usuario } = useAuth();
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="page-title">No encontramos esa página</h1>
      <Link className="btn btn--primary" to={usuario ? HOME_POR_ROL[usuario.rol] : '/login'}>
        {usuario ? 'Volver al inicio' : 'Ir al login'}
      </Link>
    </div>
  );
}
