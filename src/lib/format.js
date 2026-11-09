const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const mayuscula = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');

/**
 * Convierte lo que devuelve MySQL (Date serializado como ISO, o 'YYYY-MM-DD')
 * en un Date local, sin correr el día por la zona horaria.
 */
export function parseFecha(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const aISODate = (d) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Valor para <input type="date">
export const paraInputFecha = (valor) => {
  const d = parseFecha(valor);
  return d ? aISODate(d) : '';
};

export const hora = (valor) => (valor ? String(valor).slice(0, 5) : '');

// "Lun 29 Sep"
export function fechaCorta(valor) {
  const d = parseFecha(valor);
  return d ? `${DIAS_CORTO[d.getDay()]} ${d.getDate()} ${MESES_CORTO[d.getMonth()]}` : '';
}

// "29 de septiembre de 2026"
export function fechaLarga(valor) {
  const d = parseFecha(valor);
  return d ? `${d.getDate()} de ${MESES_LARGO[d.getMonth()]} de ${d.getFullYear()}` : '';
}

// "Lunes, 29 de septiembre 2026"
export function fechaConDia(valor = new Date()) {
  const d = parseFecha(valor);
  return d ? `${mayuscula(DIAS_LARGO[d.getDay()])}, ${d.getDate()} de ${MESES_LARGO[d.getMonth()]} ${d.getFullYear()}` : '';
}

export const moneda = (n) =>
  '$' + Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });

export const iniciales = (nombre = '', apellido = '') =>
  `${nombre.trim().charAt(0)}${apellido.trim().charAt(0)}`.toUpperCase() || '?';

export const nombreCompleto = (u) =>
  u ? `${u.nombre_usuarios ?? ''} ${u.apellido_usuarios ?? ''}`.trim() : '';

export const normalizar = (t) =>
  String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const hoy = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const mismoMes = (fecha, ref = new Date()) => {
  const d = parseFecha(fecha);
  return !!d && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export const sumarMeses = (fecha, meses) => {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d;
};

// Mismo número aunque llegue como string o número
export const mismoId = (a, b) => a != null && b != null && Number(a) === Number(b);
