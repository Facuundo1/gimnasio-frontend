import { hoy, mismoId, parseFecha } from '../../lib/format';

export const esActiva = (r) => r.estado_reserva === 'Activa';

export function inicioClase(clase) {
  const fecha = parseFecha(clase?.fecha_clase);
  if (!fecha) return null;
  const [h = 0, m = 0] = String(clase.hora_clase ?? '').split(':').map(Number);
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m);
}

// Une cada reserva con los datos de su clase.
export function unirReservas(reservas, clases) {
  const porId = new Map(clases.map((c) => [Number(c.id_clase), c]));
  return reservas.map((r) => ({ ...r, clase: porId.get(Number(r.id_clase)) ?? null }));
}

// 'activa' (futura) | 'completada' (activa que ya pasó) | 'cancelada'
export function estadoVisual(reserva) {
  if (!esActiva(reserva)) return 'cancelada';
  const inicio = inicioClase(reserva.clase);
  return inicio && inicio < new Date() ? 'completada' : 'activa';
}

export const lugaresLibres = (clase, reservas) =>
  Math.max(
    0,
    Number(clase.capacidad ?? 0) -
      reservas.filter((r) => esActiva(r) && mismoId(r.id_clase, clase.id_clase)).length,
  );

export const esDeHoy = (clase) => {
  const f = parseFecha(clase.fecha_clase);
  return !!f && f.getTime() === hoy().getTime();
};

export const nombreProfesor = (profesores, id) => {
  const p = profesores.find((x) => mismoId(x.id_profesor, id));
  return p ? `${p.nombre_profesor} ${p.apellido_profesor.charAt(0)}.` : null;
};
