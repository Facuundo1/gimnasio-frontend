import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import CrudPage from '../../components/crud/CrudPage';
import { profesoresApi } from '../../services';
import { delGimnasio } from '../../lib/scope';

const getRows = (filas) => filas;

export default function Profesores() {
  const { usuario } = useAuth();
  const idGimnasio = usuario.id_gimnasio;

  const loader = useCallback(async () => delGimnasio(await profesoresApi.listar(), idGimnasio), [idGimnasio]);

  const columns = [
    { key: 'nombre', header: 'Profesor', render: (p) => <span className="cell-person__name">{`${p.nombre_profesor} ${p.apellido_profesor}`}</span> },
    { key: 'especialidad', header: 'Especialidad', render: (p) => p.especialidad || '—' },
    { key: 'telefono', header: 'Teléfono', render: (p) => p.telefono_profesor || '—' },
    { key: 'correo', header: 'Correo', render: (p) => p.correo_profesor || '—' },
  ];

  const fields = () => [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'especialidad', label: 'Especialidad', full: true, placeholder: 'CrossFit, yoga, spinning…' },
    { name: 'telefono', label: 'Teléfono', type: 'tel' },
    { name: 'correo', label: 'Correo', type: 'email' },
  ];

  const initialValues = (p) => ({
    nombre: p?.nombre_profesor ?? '',
    apellido: p?.apellido_profesor ?? '',
    especialidad: p?.especialidad ?? '',
    telefono: p?.telefono_profesor ?? '',
    correo: p?.correo_profesor ?? '',
  });

  async function onSubmit(v, p) {
    const datos = {
      nombre_profesor: v.nombre,
      apellido_profesor: v.apellido,
      especialidad: v.especialidad || null,
      telefono_profesor: v.telefono || null,
      correo_profesor: v.correo || null,
      id_gimnasio: idGimnasio,
    };
    if (p) await profesoresApi.actualizar(p.id_profesor, datos);
    else await profesoresApi.crear(datos);
  }

  return (
    <CrudPage
      title="Profesores"
      subtitle="Equipo que dicta las clases"
      labels={{ nuevo: 'Nuevo profesor', editar: 'Editar profesor', eliminar: 'Eliminar profesor' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_profesor"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(p) => profesoresApi.eliminar(p.id_profesor)}
      searchText={(p) => `${p.nombre_profesor} ${p.apellido_profesor} ${p.especialidad ?? ''}`}
      emptyText="Todavía no cargaste profesores."
      extraActions={<Link className="btn btn--ghost" to="/admin/clases">Volver a clases</Link>}
    />
  );
}
