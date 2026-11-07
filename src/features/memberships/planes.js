import { membresiasApi } from '../../services';
import { aISODate, hoy, mismoId, normalizar, parseFecha, sumarMeses } from '../../lib/format';

export const PLANES = [
  {
    id: 'Free', lema: 'Para probar', precio: 0, color: 'var(--text-faint)',
    beneficios: ['Acceso básico', '2 clases/mes', 'Vestuarios'],
  },
  {
    id: 'Básico', lema: 'Para empezar', precio: 2990, color: 'var(--warning)',
    beneficios: ['Acceso ilimitado', '8 clases/mes', 'Vestuarios', 'App móvil'],
  },
  {
    id: 'Pro', lema: 'Para los serios', precio: 5990, color: 'var(--success)', popular: true,
    beneficios: ['Acceso ilimitado', 'Clases ilimitadas', 'Personal trainer 1x/sem', 'Nutricionista', 'Acceso 24/7'],
  },
  {
    id: 'Elite', lema: 'Sin límites', precio: 9990, color: 'var(--accent)',
    beneficios: ['Todo en Pro', 'Personal trainer ilimitado', 'Sauna + spa', 'Congelación de plan', 'Invitados 4x/mes'],
  },
];

export const planPorNombre = (nombre) =>
  PLANES.find((p) => normalizar(p.id) === normalizar(nombre)) ?? null;

// TODO(backend): confirmar los valores reales de estado_membresia.
const ESTADOS_INACTIVOS = ['vencida', 'cancelada', 'inactiva', 'suspendida'];

export function membresiaVigente(membresias, idUsuario) {
  const limite = hoy();
  const propias = membresias
    .filter((m) => mismoId(m.id_usuarios, idUsuario))
    .filter((m) => !ESTADOS_INACTIVOS.includes(normalizar(m.estado_membresia)))
    .filter((m) => {
      const vence = parseFecha(m.fecha_vencimiento);
      return !vence || vence >= limite;
    });
  propias.sort((a, b) => (parseFecha(b.fecha_vencimiento) ?? 0) - (parseFecha(a.fecha_vencimiento) ?? 0));
  return propias[0] ?? null;
}

// Última membresía del usuario (vigente o no), para actualizarla en lugar de duplicarla.
export function ultimaMembresia(membresias, idUsuario) {
  const propias = membresias.filter((m) => mismoId(m.id_usuarios, idUsuario));
  propias.sort((a, b) => Number(b.id_membresia) - Number(a.id_membresia));
  return propias[0] ?? null;
}

// Crea la membresía del usuario o actualiza la que ya tenía.
export async function asignarPlan({ idUsuario, plan, existente }) {
  const inicio = new Date();
  const datos = {
    tipo_membresia: plan.id,
    fecha_inscripcion: aISODate(inicio),
    precio_membresia: plan.precio,
    fecha_vencimiento: aISODate(sumarMeses(inicio, 1)),
    estado_membresia: 'Activa',
    id_usuarios: idUsuario,
  };
  if (existente) return membresiasApi.actualizar(existente.id_membresia, datos);
  return membresiasApi.crear(datos);
}
