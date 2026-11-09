import CrudPage from '../../components/crud/CrudPage';
import { Badge } from '../../components/ui';
import { gimnasiosApi, usuariosApi } from '../../services';
import { miembrosDe, soloRol } from '../../lib/scope';
import { mismoId, nombreCompleto } from '../../lib/format';
import { ROLES } from '../../lib/roles';

async function loader() {
  const [gimnasios, usuarios] = await Promise.all([gimnasiosApi.listar(), usuariosApi.listar()]);
  const admins = soloRol(usuarios, ROLES.ADMIN);
  return gimnasios.map((g) => ({
    ...g,
    miembros: miembrosDe(usuarios, g.id_gimnasio).length,
    admins: admins.filter((a) => mismoId(a.id_gimnasio, g.id_gimnasio)).map(nombreCompleto),
  }));
}

const getRows = (filas) => filas;

const columns = [
  {
    key: 'nombre',
    header: 'Gimnasio',
    render: (g) => (
      <>
        <p className="cell-person__name">{g.nombre_gimnasio}</p>
        <p className="cell-person__sub">{g.direccion_gimnasio}</p>
      </>
    ),
  },
  { key: 'telefono', header: 'Teléfono', render: (g) => g.telefono_gimnasio || '—' },
  { key: 'miembros', header: 'Miembros', render: (g) => g.miembros },
  {
    key: 'admin',
    header: 'Admin',
    render: (g) => (g.admins.length ? g.admins.join(', ') : <Badge tone="warning">Sin asignar</Badge>),
  },
];

const fields = () => [
  { name: 'nombre', label: 'Nombre del gimnasio', required: true, full: true },
  { name: 'direccion', label: 'Dirección', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
];

const initialValues = (g) => ({
  nombre: g?.nombre_gimnasio ?? '',
  direccion: g?.direccion_gimnasio ?? '',
  telefono: g?.telefono_gimnasio ?? '',
});

async function onSubmit(v, g) {
  const datos = {
    nombre_gimnasio: v.nombre,
    direccion_gimnasio: v.direccion,
    telefono_gimnasio: v.telefono || null,
  };
  if (g) await gimnasiosApi.actualizar(g.id_gimnasio, datos);
  else await gimnasiosApi.crear(datos);
}

export default function Gyms() {
  return (
    <CrudPage
      title="Gimnasios"
      subtitle="Todos los gimnasios de la red"
      labels={{ nuevo: 'Nuevo gimnasio', editar: 'Editar gimnasio', eliminar: 'Eliminar gimnasio' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_gimnasio"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(g) => gimnasiosApi.eliminar(g.id_gimnasio)}
      searchText={(g) => `${g.nombre_gimnasio} ${g.direccion_gimnasio}`}
      searchPlaceholder="Buscar gimnasio…"
      emptyText="Todavía no hay gimnasios registrados."
      deleteMessage={(g) => `Vas a eliminar ${g.nombre_gimnasio}. Revisá que no tenga miembros ni clases asociadas.`}
    />
  );
}
