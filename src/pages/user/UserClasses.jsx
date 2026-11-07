import { useState } from 'react';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { clasesApi, profesoresApi, reservasApi } from '../../services';
import { esActiva, inicioClase, lugaresLibres, nombreProfesor } from '../../features/reservations/reservas';
import useCancelarReserva from '../../features/reservations/useCancelarReserva';
import { delGimnasio } from '../../lib/scope';
import { fechaCorta, hora, mismoId, parseFecha } from '../../lib/format';
import { Async, Badge, Button, EmptyState, PageHeader, Tabs, useToast } from '../../components/ui';

const cargar = () => Promise.all([clasesApi.listar(), reservasApi.listar(), profesoresApi.listar()]);

// Valor = Date.getDay() (0 = domingo)
const DIAS = [
  { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' }, { value: 0, label: 'Dom' },
];

function Agenda({ clases, reservas, profesores, usuario, recargar }) {
  const toast = useToast();
  const [dia, setDia] = useState(() => new Date().getDay());
  const [reservando, setReservando] = useState(null);
  const { pedirCancelar, dialogo } = useCancelarReserva(recargar);

  const ahora = new Date();
  const proximas = delGimnasio(clases, usuario.id_gimnasio)
    .filter((c) => {
      const inicio = inicioClase(c);
      return inicio && inicio >= ahora;
    })
    .sort((a, b) => inicioClase(a) - inicioClase(b));

  const delDia = (d) => proximas.filter((c) => parseFecha(c.fecha_clase).getDay() === d);
  const tabs = DIAS.map((d) => ({ ...d, count: delDia(d.value).length || undefined }));
  const visibles = delDia(dia);

  async function reservar(clase) {
    setReservando(clase.id_clase);
    try {
      await reservasApi.crear({ id_usuarios: usuario.id, id_clase: clase.id_clase });
      toast.exito(`Reservaste ${clase.nombre_clase}`);
      recargar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReservando(null);
    }
  }

  return (
    <>
      <Tabs items={tabs} value={dia} onChange={setDia} label="Día de la semana" />

      <div className="section-gap">
        {visibles.length ? (
          <ul className="stack">
            {visibles.map((c) => {
              const mia = reservas.find(
                (r) => esActiva(r) && mismoId(r.id_usuarios, usuario.id) && mismoId(r.id_clase, c.id_clase),
              );
              const libres = lugaresLibres(c, reservas);
              const profesor = nombreProfesor(profesores, c.profesor_id);
              return (
                <li key={c.id_clase} className={`row-item${mia ? ' row-item--mine' : ''}`}>
                  <div className="time-block">
                    <span className="time-block__hora">{hora(c.hora_clase)}</span>
                    <span className="time-block__sub">{fechaCorta(c.fecha_clase)}</span>
                  </div>
                  <div className="row-item__main">
                    <p className="row-item__title">{c.nombre_clase}</p>
                    <p className="row-item__sub">{profesor ? `con ${profesor}` : 'Profesor a confirmar'}</p>
                  </div>
                  <div className="row-item__side">
                    <span className="muted">
                      {libres === 0 ? 'Completa' : `${libres} ${libres === 1 ? 'lugar' : 'lugares'}`}
                    </span>
                    {mia ? (
                      <>
                        <Badge tone="success">✓ Inscripto</Badge>
                        <Button variant="ghost" size="sm" onClick={() => pedirCancelar({ ...mia, clase: c })}>
                          Darme de baja
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        disabled={libres === 0}
                        loading={reservando === c.id_clase}
                        onClick={() => reservar(c)}
                      >
                        Reservar
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No hay clases programadas este día"
            text="Probá con otro día de la semana."
          />
        )}
      </div>
      {dialogo}
    </>
  );
}

export default function UserClasses() {
  const { usuario } = useAuth();
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader title="Agenda de clases" />
      <Async state={state}>
        {([clases, reservas, profesores]) => (
          <Agenda
            clases={clases}
            reservas={reservas}
            profesores={profesores}
            usuario={usuario}
            recargar={state.reload}
          />
        )}
      </Async>
    </>
  );
}
