import { useCallback } from 'react';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { clasesApi, gimnasiosApi, membresiasApi, reservasApi, usuariosApi } from '../../services';
import { PLANES, membresiaVigente } from '../../features/memberships/planes';
import { esActiva, esDeHoy } from '../../features/reservations/reservas';
import { delGimnasio, miembrosDe } from '../../lib/scope';
import {
  fechaConDia, fechaCorta, hoy, hora, mismoId, mismoMes, moneda, normalizar, parseFecha,
} from '../../lib/format';
import { Async, Avatar, Card, PageHeader, StatCard } from '../../components/ui';

function semanaActual() {
  const inicio = hoy();
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7)); // lunes
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 7);
  return [inicio, fin];
}

function Resumen({ usuarios, clases, reservas, membresias, idGimnasio }) {
  const miembros = miembrosDe(usuarios, idGimnasio);
  const idsMiembros = new Set(miembros.map((m) => Number(m.id_usuarios)));
  const deMiembros = membresias.filter((m) => idsMiembros.has(Number(m.id_usuarios)));
  const vigentes = miembros.map((u) => membresiaVigente(deMiembros, u.id_usuarios)).filter(Boolean);
  const ingresosMes = deMiembros
    .filter((m) => mismoMes(m.fecha_inscripcion))
    .reduce((suma, m) => suma + Number(m.precio_membresia || 0), 0);

  const clasesGim = delGimnasio(clases, idGimnasio);
  const idsClases = new Set(clasesGim.map((c) => Number(c.id_clase)));
  const reservasGim = reservas.filter((r) => idsClases.has(Number(r.id_clase)));

  const clasesHoy = clasesGim.filter(esDeHoy);
  const reservasHoy = reservasGim.filter(
    (r) => esActiva(r) && clasesHoy.some((c) => mismoId(c.id_clase, r.id_clase)),
  ).length;

  const [desde, hasta] = semanaActual();
  const clasesSemana = clasesGim.filter((c) => {
    const f = parseFecha(c.fecha_clase);
    return f && f >= desde && f < hasta;
  });
  const cupos = clasesSemana.reduce((s, c) => s + Number(c.capacidad || 0), 0);
  const ocupados = reservasGim.filter(
    (r) => esActiva(r) && clasesSemana.some((c) => mismoId(c.id_clase, r.id_clase)),
  ).length;
  const ocupacion = cupos ? Math.round((ocupados / cupos) * 100) : 0;

  const ultimas = [...reservasGim].sort((a, b) => b.id_reserva - a.id_reserva).slice(0, 5).map((r) => ({
    ...r,
    usuario: usuarios.find((u) => mismoId(u.id_usuarios, r.id_usuarios)),
    clase: clasesGim.find((c) => mismoId(c.id_clase, r.id_clase)),
  }));

  const distribucion = PLANES.map((p) => ({
    ...p,
    n: vigentes.filter((m) => normalizar(m.tipo_membresia) === normalizar(p.id)).length,
  }));
  const maximo = Math.max(1, ...distribucion.map((d) => d.n));

  return (
    <>
      <div className="grid-stats">
        <StatCard label="Miembros activos" value={vigentes.length} tone="accent" hint={`de ${miembros.length}`} />
        <StatCard label="Ingresos del mes" value={moneda(ingresosMes)} tone="success" hint="por membresías" />
        <StatCard label="Clases hoy" value={clasesHoy.length} tone="accent" hint={`${reservasHoy} reservas`} />
        <StatCard label="Ocupación media" value={`${ocupacion}%`} tone="warning" hint="esta semana" />
      </div>

      <div className="grid-2">
        <Card>
          <h2 className="card-title">Últimas reservas</h2>
          {ultimas.length ? (
            <ul className="stack">
              {ultimas.map((r) => (
                <li key={r.id_reserva} className="activity">
                  <Avatar nombre={r.usuario?.nombre_usuarios} apellido={r.usuario?.apellido_usuarios} size="sm" />
                  <p className="activity__text">
                    <span>{r.usuario ? `${r.usuario.nombre_usuarios} ${r.usuario.apellido_usuarios.charAt(0)}.` : 'Usuario'}</span>
                    <span className="muted"> → {r.clase?.nombre_clase ?? 'Clase eliminada'}</span>
                  </p>
                  <span className="faint activity__when">
                    {esActiva(r) && r.clase ? `${fechaCorta(r.clase.fecha_clase)} · ${hora(r.clase.hora_clase)}` : 'Cancelada'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Todavía no hay reservas.</p>
          )}
        </Card>

        <Card>
          <h2 className="card-title">Distribución de planes</h2>
          <ul className="stack">
            {distribucion.map((d) => (
              <li key={d.id}>
                <div className="split">
                  <span>{d.id}</span>
                  <span className="muted">{d.n} {d.n === 1 ? 'miembro' : 'miembros'}</span>
                </div>
                <div className="bar" aria-hidden="true">
                  <div className="bar__fill" style={{ width: `${(d.n / maximo) * 100}%`, '--bar-color': d.color }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const idGimnasio = usuario.id_gimnasio;
  const cargar = useCallback(
    () =>
      Promise.all([
        usuariosApi.listar(), clasesApi.listar(), reservasApi.listar(), membresiasApi.listar(),
        idGimnasio ? gimnasiosApi.obtener(idGimnasio) : Promise.resolve(null),
      ]),
    [idGimnasio],
  );
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader
        title="Panel de control"
        subtitle={`${state.data?.[4]?.nombre_gimnasio ?? 'Tu gimnasio'} · ${fechaConDia()}`}
      />
      <Async state={state}>
        {([usuarios, clases, reservas, membresias]) => (
          <Resumen
            usuarios={usuarios}
            clases={clases}
            reservas={reservas}
            membresias={membresias}
            idGimnasio={idGimnasio}
          />
        )}
      </Async>
    </>
  );
}
