import CrudPage from '../../components/crud/CrudPage';
import { Avatar, Badge } from '../../components/ui';
import { crearUsuarioCompleto, gimnasiosApi, usuariosApi } from '../../services';
import { soloRol } from '../../lib/scope';
import { mismoId } from '../../lib/format';
import { ROLES } from '../../lib/roles';

async function loader() {
  const [usuarios, gimnasios] = await Promise.all([usuariosApi.listar(), gimnasiosApi.listar()]);
  return {
    gimnasios,
    filas: soloRol(usuarios, ROLES.ADMIN).map((a) => ({
      ...a,
      gimnasio: gimnasios.find((g) => mismoId(g.id_gimnasio, a.id_gimnasio))?.nombre_gimnasio ?? null,
    })),
  };
}

const getRows = (d) => d.filas;

const columns = [
  {
    key: 'admin',
    header: 'Administrador',
    render: (a) => (
      <div className="cell-person">
        <Avatar nombre={a.nombre_usuarios} apellido={a.apellido_usuarios} tone="warning" size="sm" />
        <div>
          <p className="cell-person__name">{`${a.nombre_usuarios} ${a.apellido_usuarios}`}</p>
          <p className="cell-person__sub">{a.correo_usuarios}</p>
        </div>
      </div>
    ),
  },
  { key: 'gimnasio', header: 'Gimnasio', render: (a) => a.gimnasio ?? <Badge tone="warning">Sin gimnasio</Badge> },
  { key: 'telefono', header: 'Teléfono', render: (a) => a.telefono || '—' },
];

const fields = (d) => [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'apellido', label: 'Apellido', required: true },
  { name: 'correo', label: 'Correo electrónico', type: 'email', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'password', label: 'Contraseña inicial', type: 'password', required: true, minLength: 6, soloAlCrear: true, hint: 'Mínimo 6 caracteres' },
  {
    name: 'gimnasio', label: 'Gimnasio', type: 'select', required: true,
    options: d.gimnasios.map((g) => ({ value: g.id_gimnasio, label: g.nombre_gimnasio })),
  },
];

const initialValues = (a) => ({
  nombre: a?.nombre_usuarios ?? '',
  apellido: a?.apellido_usuarios ?? '',
  correo: a?.correo_usuarios ?? '',
  telefono: a?.telefono ?? '',
  password: '',
  gimnasio: a?.id_gimnasio != null ? String(a.id_gimnasio) : '',
});

async function onSubmit(v, a) {
  if (a) {
    // TODO(backend): PUT /usuarios exige reenviar la contraseña; se reenvía la actual sin tocarla.
    await usuariosApi.actualizar(a.id_usuarios, {
      ...a,
      nombre_usuarios: v.nombre,
      apellido_usuarios: v.apellido,
      correo_usuarios: v.correo,
      telefono: v.telefono || null,
      id_gimnasio: Number(v.gimnasio),
    });
  } else {
    await crearUsuarioCompleto({
      nombre: v.nombre,
      apellido: v.apellido,
      correo: v.correo,
      password: v.password,
      telefono: v.telefono,
      rol: ROLES.ADMIN,
      id_gimnasio: Number(v.gimnasio),
    });
  }
}

export default function Admins() {
  return (
    <CrudPage
      title="Admins"
      subtitle="Propietarios y administradores de cada gimnasio"
      labels={{ nuevo: 'Nuevo admin', editar: 'Editar admin', eliminar: 'Eliminar admin' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_usuarios"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(a) => usuariosApi.eliminar(a.id_usuarios)}
      searchText={(a) => `${a.nombre_usuarios} ${a.apellido_usuarios} ${a.correo_usuarios} ${a.gimnasio ?? ''}`}
      searchPlaceholder="Buscar por nombre, correo o gimnasio…"
      emptyText="Todavía no hay administradores."
      deleteMessage={(a) => `Vas a eliminar a ${a.nombre_usuarios} ${a.apellido_usuarios}. El gimnasio quedará sin administrador.`}
    />
  );
}
