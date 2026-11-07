import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { clasesApi, reservasApi } from '../../services';
import { estadoVisual, inicioClase, unirReservas } from '../../features/reservations/reservas';
import ReservaItem from '../../features/reservations/ReservaItem';
import useCancelarReserva from '../../features/reservations/useCancelarReserva';
import { mismoId } from '../../lib/format';
import { Async, EmptyState, PageHeader, Tabs } from '../../components/ui';

const cargar = () => Promise.all([reservasApi.listar(), clasesApi.listar()]);

const VACIOS = {
  activa: 'No tenés reservas activas.',
  completada: 'Todavía no completaste ninguna clase.',
  cancelada: 'No cancelaste ninguna reserva.',
};

function Listado({ reservas, clases, usuario, recargar }) {
  const [filtro, setFiltro] = useState('activa');
  const { pedirCancelar, dialogo } = useCancelarReserva(recargar);

  const mias = unirReservas(
    reservas.filter((r) => mismoId(r.id_usuarios, usuario.id)),
    clases,
  ).sort((a, b) => (inicioClase(b.clase) ?? 0) - (inicioClase(a.clase) ?? 0));

  const cuenta = (estado) => mias.filter((r) => estadoVisual(r) === estado).length;
  const tabs = [
    { value: 'activa', label: 'Activas', count: cuenta('activa') },
    { value: 'completada', label: 'Completadas', count: cuenta('completada') },
    { value: 'cancelada', label: 'Canceladas', count: cuenta('cancelada') },
  ];
  const visibles = mias.filter((r) => estadoVisual(r) === filtro);

  return (
    <>
      <Tabs items={tabs} value={filtro} onChange={setFiltro} label="Estado de la reserva" />
      <div className="section-gap">
        {visibles.length ? (
          <ul className="stack">
            {visibles.map((r) => (
              <ReservaItem key={r.id_reserva} reserva={r} onCancelar={pedirCancelar} grande />
            ))}
          </ul>
        ) : (
          <EmptyState
            title={VACIOS[filtro]}
            action={
              filtro === 'activa' ? <Link className="btn btn--primary" to="/clases">Ver clases</Link> : null
            }
          />
        )}
      </div>
      {dialogo}
    </>
  );
}

export default function UserReservations() {
  const { usuario } = useAuth();
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader title="Mis reservas" />
      <Async state={state}>
        {([reservas, clases]) => (
          <Listado reservas={reservas} clases={clases} usuario={usuario} recargar={state.reload} />
        )}
      </Async>
    </>
  );
}
