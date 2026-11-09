export const ROLES = { USER: 'user', ADMIN: 'admin', SUPERADMIN: 'superadmin' };

// Valor que se guarda en la columna `rol` de la tabla usuarios.
// TODO(backend): confirmar estos valores con el equipo.
export const ROL_EN_BD = {
  [ROLES.USER]: 'usuario',
  [ROLES.ADMIN]: 'admin',
  [ROLES.SUPERADMIN]: 'superadmin',
};

export function normalizarRol(valor) {
  const v = String(valor ?? '').toLowerCase().replace(/[\s_-]/g, '');
  if (v === 'superadmin' || v === 'superadministrador') return ROLES.SUPERADMIN;
  if (v === 'admin' || v === 'administrador') return ROLES.ADMIN;
  return ROLES.USER;
}

export const HOME_POR_ROL = {
  [ROLES.USER]: '/',
  [ROLES.ADMIN]: '/admin',
  [ROLES.SUPERADMIN]: '/superadmin',
};

export const NAV_POR_ROL = {
  [ROLES.USER]: [
    { to: '/', label: 'Inicio', end: true },
    { to: '/clases', label: 'Clases' },
    { to: '/membresia', label: 'Membresía' },
    { to: '/reservas', label: 'Mis reservas' },
    { to: '/tienda', label: 'Tienda' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Resumen', end: true },
    { to: '/admin/miembros', label: 'Miembros' },
    { to: '/admin/clases', label: 'Clases' },
    { to: '/admin/finanzas', label: 'Finanzas' },
    { to: '/admin/tienda', label: 'Tienda' },
  ],
  [ROLES.SUPERADMIN]: [
    { to: '/superadmin', label: 'Resumen', end: true },
    { to: '/superadmin/gimnasios', label: 'Gimnasios' },
    { to: '/superadmin/admins', label: 'Admins' },
    { to: '/superadmin/sistema', label: 'Sistema' },
    { to: '/superadmin/tienda', label: 'Tienda' },
  ],
};
