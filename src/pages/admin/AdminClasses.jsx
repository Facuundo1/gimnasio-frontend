import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import CrudPage from '../../components/crud/CrudPage';
import { Badge } from '../../components/ui';
import { clasesApi, profesoresApi, reservasApi } from '../../services';
import { esActiva, inicioClase, nombreProfesor } from '../../features/reservations/reservas';
import { delGimnasio } from '../../lib/scope';
import { fechaCorta, hora, mismoId, paraInputFecha } from '../../lib/format';

const getRows = (d) => d.filas;

export default function AdminClasses() {
  const { usuario } = useAuth();
  const idGimnasio = usuario.id_gimnasio;

  const loader = useCallback(async () => {
    const [clases, profesores, reservas] = await Promise.all([
      clasesApi.listar(), profesoresApi.listar(), reservasApi.listar(),
    ]);
    const profesoresGim = delGimnasio(profesores, idGimnasio);
    const filas = delGimnasio(clases, idGimnasio)
      .map((c) => ({
        ...c,
        profesor: nombreProfesor(profesores, c.profesor_id),
        ocupados: reservas.filter((r) => esActiva(r) && mismoId(r.id_clase, c.id_clase)).length,
      }))
      .sort((a, b) => (inicioClase(b) ?? 0) - (inicioClase(a) ?? 0));
    return { filas, profesores: profesoresGim };
  }, [idGimnasio]);

  const columns = [
    { key: 'nombre_clase', header: 'Clase', render: (c) => <span className="cell-person__name">{c.nombre_clase}</span> },
    { key: 'fecha', header: 'Fecha', render: (c) => fechaCorta(c.fecha_clase) },
    { key: 'hora', header: 'Hora', render: (c) => hora(c.hora_clase) },
    { key: 'profesor', header: 'Profesor', render: (c) => c.profesor ?? '—' },
    {
      key: 'cupos',
      header: 'Cupos',
      render: (c) => (
        <Badge tone={c.ocupados >= c.capacidad ? 'danger' : 'neutral'}>{`${c.ocupados}/${c.capacidad}`}</Badge>
      ),
    },
  ];

  const fields = (d) => [
    { name: 'nombre', label: 'Nombre de la clase', required: true, full: true },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'hora', label: 'Hora', type: 'time', required: true },
    { name: 'capacidad', label: 'Capacidad', type: 'number', min: 1, step: 1, required: true },
    {
      name: 'profesor',
      label: 'Profesor',
      type: 'select',
      required: true,
      placeholder: d.profesores.length ? 'Elegí un profesor' : 'Primero cargá un profesor',
      options: d.profesores.map((p) => ({ value: p.id_profesor, label: `${p.nombre_profesor} ${p.apellido_profesor}` })),
    },
  ];

  const initialValues = (c) => ({
    nombre: c?.nombre_clase ?? '',
    fecha: c ? paraInputFecha(c.fecha_clase) : '',
    hora: c ? hora(c.hora_clase) : '',
    capacidad: c ? String(c.capacidad) : '',
    profesor: c?.profesor_id != null ? String(c.profesor_id) : '',
  });

  async function onSubmit(v, c) {
    const datos = {
      nombre_clase: v.nombre,
      capacidad: Number(v.capacidad),
      fecha_clase: v.fecha,
      hora_clase: v.hora,
      id_gimnasio: idGimnasio,
      profesor_id: Number(v.profesor),
    };
    if (c) await clasesApi.actualizar(c.id_clase, datos);
    else await clasesApi.crear(datos);
  }

  return (
    <CrudPage
      title="Clases"
      subtitle="Programá la agenda de tu gimnasio"
      labels={{ nuevo: 'Nueva clase', editar: 'Editar clase', eliminar: 'Eliminar clase' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_clase"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(c) => clasesApi.eliminar(c.id_clase)}
      searchText={(c) => `${c.nombre_clase} ${c.profesor ?? ''}`}
      searchPlaceholder="Buscar clase o profesor…"
      emptyText="Todavía no hay clases programadas."
      deleteMessage={(c) => `Vas a eliminar la clase ${c.nombre_clase}. Solo se puede eliminar si no tiene reservas.`}
      extraActions={<Link className="btn btn--ghost" to="/admin/profesores">Profesores</Link>}
    />
  );
}
