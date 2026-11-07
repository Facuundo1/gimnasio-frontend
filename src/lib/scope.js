import { mismoId } from './format';
import { normalizarRol, ROLES } from './roles';

// Si no hay gimnasio asignado se devuelve todo (p. ej. superadmin).
export const delGimnasio = (filas, idGimnasio) =>
  idGimnasio == null ? filas : filas.filter((f) => mismoId(f.id_gimnasio, idGimnasio));

export const soloRol = (usuarios, rol) =>
  usuarios.filter((u) => normalizarRol(u.rol) === rol);

export const miembrosDe = (usuarios, idGimnasio) =>
  delGimnasio(soloRol(usuarios, ROLES.USER), idGimnasio);
