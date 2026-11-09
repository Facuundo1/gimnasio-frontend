import { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { gimnasiosApi, membresiasApi } from '../../services';
import { membresiaVigente } from '../../features/memberships/planes';
import { NAV_POR_ROL, ROLES } from '../../lib/roles';
import { Avatar, Badge } from '../ui';

const listarMembresias = () => membresiasApi.listar();

function PlanActual({ idUsuario }) {
  const { data } = useFetch(listarMembresias);
  if (!data) return null;
  return membresiaVigente(data, idUsuario)?.tipo_membresia ?? 'Sin plan';
}

function GimnasioActual({ id }) {
  const cargar = useCallback(() => (id ? gimnasiosApi.obtener(id) : Promise.resolve(null)), [id]);
  const { data } = useFetch(cargar);
  if (data === undefined) return null;
  return data?.nombre_gimnasio ?? 'Sin gimnasio';
}

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const items = NAV_POR_ROL[usuario.rol];

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="brand">IRON PEAK</span>
          {usuario.rol === ROLES.SUPERADMIN && <Badge tone="accent">SUPERADMIN</Badge>}
          {usuario.rol === ROLES.ADMIN && <Badge tone="warning">ADMIN</Badge>}
        </div>

        <nav className="nav" aria-label="Principal">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-chip">
          <div className="user-chip__text">
            <span className="user-chip__name">{`${usuario.nombre} ${usuario.apellido}`}</span>
            <span className="user-chip__sub">
              {usuario.rol === ROLES.USER && <PlanActual idUsuario={usuario.id} />}
              {usuario.rol === ROLES.ADMIN && <GimnasioActual id={usuario.id_gimnasio} />}
              {usuario.rol === ROLES.SUPERADMIN && 'Acceso total'}
            </span>
          </div>
          <Avatar
            nombre={usuario.nombre}
            apellido={usuario.apellido}
            tone={usuario.rol === ROLES.ADMIN ? 'warning' : 'accent'}
          />
          <button type="button" className="link-button" onClick={salir}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
