// Reglas de validación reutilizables.
// Cada regla recibe (valor, todosLosValores) y devuelve un mensaje de error, o '' si está bien.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE = /^\p{L}[\p{L}\s'’.-]*$/u;
const TELEFONO = /^\+?[\d\s()-]+$/;

const texto = (v) => String(v ?? '');

// ---- Reglas básicas ----
export const requerido = (mensaje) => (v) => (texto(v).trim() ? '' : mensaje);
export const minimo = (n, mensaje) => (v) => (texto(v).length >= n ? '' : mensaje);
export const maximo = (n, mensaje) => (v) => (texto(v).length <= n ? '' : mensaje);
export const minimoTexto = (n, mensaje) => (v) => (texto(v).trim().length >= n ? '' : mensaje);

// Devuelve el primer error de una lista de reglas ('' si pasa todas).
export function primerError(reglas, valor, todos) {
  for (const regla of reglas) {
    const mensaje = regla(valor, todos);
    if (mensaje) return mensaje;
  }
  return '';
}

// ---- Reglas por campo ----
export const reglasCorreo = [
  requerido('Ingresá tu correo electrónico'),
  (v) => (EMAIL.test(texto(v).trim()) ? '' : 'El correo no es válido (ejemplo: nombre@correo.com)'),
  maximo(120, 'El correo es demasiado largo'),
];

// Login: el backend exige 6 caracteres como mínimo al crear la cuenta.
export const reglasPasswordLogin = [
  requerido('Ingresá tu contraseña'),
  minimo(6, 'La contraseña debe tener al menos 6 caracteres'),
];

// Registro: mínimo 6, máximo 72 (límite de bcrypt) y combinar letras y números.
export const reglasPasswordNueva = [
  requerido('Elegí una contraseña'),
  minimo(6, 'La contraseña debe tener al menos 6 caracteres'),
  maximo(72, 'La contraseña no puede superar los 72 caracteres'),
  (v) => (/\p{L}/u.test(texto(v)) && /\d/.test(texto(v)) ? '' : 'Combiná al menos una letra y un número'),
];

export const reglasConfirmar = [
  requerido('Repetí la contraseña'),
  (v, todos) => (v === todos.password ? '' : 'Las contraseñas no coinciden'),
];

// campo: 'nombre' | 'apellido' (en masculino, para que los mensajes concuerden)
export const reglasNombre = (campo) => [
  requerido(`El ${campo} es obligatorio`),
  minimoTexto(2, `El ${campo} debe tener al menos 2 letras`),
  maximo(60, `El ${campo} es demasiado largo`),
  (v) => (NOMBRE.test(texto(v).trim()) ? '' : `El ${campo} solo puede tener letras, espacios y guiones`),
];

// Los nombres de gimnasio pueden llevar números (ej.: "Gym 24").
export const reglasNombreGimnasio = [
  requerido('El nombre del gimnasio es obligatorio'),
  minimoTexto(2, 'El nombre del gimnasio debe tener al menos 2 caracteres'),
  maximo(80, 'El nombre del gimnasio es demasiado largo'),
];

export const reglasDireccion = [
  requerido('La dirección es obligatoria'),
  minimoTexto(5, 'La dirección debe tener al menos 5 caracteres'),
  maximo(150, 'La dirección es demasiado larga'),
];

// Opcional: si se completa, tiene que parecer un teléfono.
export const reglasTelefonoOpcional = [
  (v) => {
    const t = texto(v).trim();
    if (!t) return '';
    const digitos = t.replace(/\D/g, '').length;
    return TELEFONO.test(t) && digitos >= 6 && digitos <= 15 ? '' : 'El teléfono no es válido (entre 6 y 15 números)';
  },
];
