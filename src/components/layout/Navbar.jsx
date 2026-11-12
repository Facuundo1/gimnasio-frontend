//La barra lee quién inició sesión y arma el menú, los datos de la persona y el botón Salir.

import { useCallback , useEffect} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { gimnasiosApi, membresiasApi } from '../../services';
import { membresiaVigente } from '../../features/memberships/planes';
import { NAV_POR_ROL, ROLES } from '../../lib/roles';
import { Avatar, Badge } from '../ui';

const listarMembresias = () => membresiasApi.listar(); // Función definida afuera del componente para que tenga siempre la misma referencia (requisito de useFetch).
 
//Subcomponente que muestra el plan vigente del socio: pide las membresías y usa membresiaVigente. El ?.
//evita un error si no hay plan, y ?? 'Sin plan' da un valor por defecto.
function PlanActual({ idUsuario }) {
  const { data, reload } = useFetch(listarMembresias);

  // Cuando el usuario cambia de plan, se vuelve a pedir la membresía
  useEffect(() => {
    window.addEventListener('membresia-cambiada', reload);
    return () => window.removeEventListener('membresia-cambiada', reload);
  }, [reload]);

  if (!data) return null;
  return membresiaVigente(data, idUsuario)?.tipo_membresia ?? 'Sin plan';
}

//Subcomponente que muestra el nombre del gimnasio del admin. useCallback mantiene estable la función de
// carga mientras no cambie el id.
function GimnasioActual({ id }) {
  const cargar = useCallback(() => (id ? gimnasiosApi.obtener(id) : Promise.resolve(null)), [id]);
  const { data } = useFetch(cargar);
  if (data === undefined) return null;
  return data?.nombre_gimnasio ?? 'Sin gimnasio';
}

//Componente principal. useAuth() entrega el usuario y
//cerrarSesion; useNavigate() permite cambiar de
//pantalla desde el código; items es el menú de ese rol:
//|NAV_POR_ROL[usuario.rol].
export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const items = NAV_POR_ROL[usuario.rol];

  //salir cierra la sesión (borra token y usuario) y navega al login con replace: true, para que el botón "Atrás" no vuelva a una pantalla protegida.
  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  //Empieza la barra. El enlace "Saltar al contenido" ayuda a quienes navegan con teclado o lector de pantalla.

  //Marca "IRON PEAK" y, según el rol, una etiqueta (&&: se dibuja solo si la condición es verdadera): SUPERADMIN o ADMIN
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
          {items.map((item) => ( //El menú: items.map dibuja un NavLink por opción. NavLink es un enlace que sabe si está activo; className recibe una función con isActive para agregar la clase de resaltado
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
