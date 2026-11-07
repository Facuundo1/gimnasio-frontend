import { Link } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { clasesApi, membresiasApi, reservasApi } from '../../services';
import { membresiaVigente } from '../../features/memberships/planes';
import { esActiva, estadoVisual, inicioClase, unirReservas } from '../../features/reservations/reservas';
import ReservaItem from '../../features/reservations/ReservaItem';
import useCancelarReserva from '../../features/reservations/useCancelarReserva';
import { fechaConDia, fechaLarga, hoy, mismoId, mismoMes, parseFecha } from '../../lib/format';
import { Async, Card, EmptyState, PageHeader, StatCard } from '../../components/ui';

const cargar = () => Promise.all([reservasApi.listar(), clasesApi.listar(), membresiasApi.listar()]);

function Contenido({ reservas, clases, membresias, usuario, recargar }) {
  const { pedirCancelar, dialogo } = useCancelarReserva(recargar);

  const mias = unirReservas(
    reservas.filter((r) => mismoId(r.id_usuarios, usuario.id)),
    clases,
  );
  const proximas = mias
    .filter((r) => estadoVisual(r) === 'activa')
    .sort((a, b) => inicioClase(a.clase) - inicioClase(b.clase));
  const clasesDelMes = mias.filter((r) => esActiva(r) && r.clase && mismoMes(r.clase.fecha_clase)).length;

  const membresia = membresiaVigente(membresias, usuario.id);
  const vence = membresia ? parseFecha(membresia.fecha_vencimiento) : null;
  const diasRestantes = vence ? Math.max(0, Math.ceil((vence - hoy()) / 86_400_000)) : null;

  return (
    <>
      <div className="grid-stats">
        <StatCard label="Clases este mes" value={clasesDelMes} />
        <StatCard label="Reservas activas" value={proximas.length} unit="confirmadas" />
        <StatCard label="Plan actual" value={membresia?.tipo_membresia ?? 'Sin plan'} tone="accent" />
        <StatCard
          label="Vence en"
          value={diasRestantes ?? '—'}
          unit={diasRestantes != null ? 'días' : undefined}
          tone={diasRestantes != null && diasRestantes <= 7 ? 'warning' : 'default'}
        />
      </div>

      <Card className="plan-banner">
        <div>
          <p className="stat__label">{membresia ? 'Membresía activa' : 'Sin membresía activa'}</p>
          <p className="plan-banner__name">{membresia ? `Plan ${membresia.tipo_membresia}` : 'Elegí tu plan'}</p>
          <p className="muted">
            {vence ? `Vence el ${fechaLarga(vence)}` : 'Contratá un plan para empezar a reservar clases.'}
          </p>
        </div>
        <Link className="btn btn--outline" to="/membresia">Ver planes</Link>
      </Card>

      <h2 className="page-section-title">Próximas clases</h2>
      {proximas.length ? (
        <ul className="stack">
          {proximas.slice(0, 5).map((r) => (
            <ReservaItem key={r.id_reserva} reserva={r} onCancelar={pedirCancelar} />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No tenés clases reservadas"
          text="Mirá la agenda y reservá tu lugar."
          action={<Link className="btn btn--primary" to="/clases">Ver clases</Link>}
        />
      )}
      {dialogo}
    </>
  );
}

export default function UserHome() {
  const { usuario } = useAuth();
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader title={`¡Hola, ${usuario.nombre}!`} subtitle={fechaConDia()} />
      <Async state={state}>
        {([reservas, clases, membresias]) => (
          <Contenido
            reservas={reservas}
            clases={clases}
            membresias={membresias}
            usuario={usuario}
            recargar={state.reload}
          />
        )}
      </Async>
    </>
  );
}
