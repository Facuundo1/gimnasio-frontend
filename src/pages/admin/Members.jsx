import { useCallback } from 'react';
import useAuth from '../../features/auth/useAuth';
import CrudPage from '../../components/crud/CrudPage';
import { Avatar, Badge } from '../../components/ui';
import { crearUsuarioCompleto, membresiasApi, usuariosApi } from '../../services';
import { PLANES, asignarPlan, membresiaVigente, planPorNombre, ultimaMembresia } from '../../features/memberships/planes';
import { miembrosDe } from '../../lib/scope';
import { fechaCorta, moneda } from '../../lib/format';
import { ROLES } from '../../lib/roles';

const getRows = (filas) => filas;

export default function Members() {
  const { usuario } = useAuth();
  const idGimnasio = usuario.id_gimnasio;

  // Devuelve filas listas para mostrar: miembros del gimnasio + su plan.
  const loader = useCallback(async () => {
    const [usuarios, membresias] = await Promise.all([usuariosApi.listar(), membresiasApi.listar()]);
    return miembrosDe(usuarios, idGimnasio).map((u) => ({
      ...u,
      plan: membresiaVigente(membresias, u.id_usuarios),
      ultima: ultimaMembresia(membresias, u.id_usuarios),
    }));
  }, [idGimnasio]);

  const columns = [
    {
      key: 'miembro',
      header: 'Miembro',
      render: (u) => (
        <div className="cell-person">
          <Avatar nombre={u.nombre_usuarios} apellido={u.apellido_usuarios} size="sm" />
          <div>
            <p className="cell-person__name">{`${u.nombre_usuarios} ${u.apellido_usuarios}`}</p>
            <p className="cell-person__sub">{u.correo_usuarios}</p>
          </div>
        </div>
      ),
    },
    { key: 'telefono', header: 'Teléfono', render: (u) => u.telefono || '—' },
    {
      key: 'plan',
      header: 'Plan',
      render: (u) => (u.plan ? <Badge tone="accent">{u.plan.tipo_membresia}</Badge> : <Badge>Sin plan</Badge>),
    },
    { key: 'vence', header: 'Vence', render: (u) => (u.plan ? fechaCorta(u.plan.fecha_vencimiento) : '—') },
    {
      key: 'estado',
      header: 'Estado',
      render: (u) => (u.plan ? <Badge tone="success">Activo</Badge> : <Badge tone="warning">Sin membresía</Badge>),
    },
  ];

  const fields = () => [
    { name: 'nombre', label: 'Nombre', required: true },
    { name: 'apellido', label: 'Apellido', required: true },
    { name: 'correo', label: 'Correo electrónico', type: 'email', required: true },
    { name: 'telefono', label: 'Teléfono', type: 'tel' },
    { name: 'password', label: 'Contraseña inicial', type: 'password', required: true, minLength: 6, soloAlCrear: true, hint: 'Mínimo 6 caracteres' },
    {
      name: 'plan',
      label: 'Plan',
      type: 'select',
      placeholder: 'Sin plan',
      options: PLANES.map((p) => ({ value: p.id, label: `${p.id} · ${p.precio ? moneda(p.precio) : 'Gratis'}` })),
    },
  ];

  const initialValues = (u) => ({
    nombre: u?.nombre_usuarios ?? '',
    apellido: u?.apellido_usuarios ?? '',
    correo: u?.correo_usuarios ?? '',
    telefono: u?.telefono ?? '',
    password: '',
    plan: u?.plan ? (planPorNombre(u.plan.tipo_membresia)?.id ?? '') : '',
  });

  async function onSubmit(v, u) {
    const plan = v.plan ? planPorNombre(v.plan) : null;
    if (u) {
      // TODO(backend): PUT /usuarios exige reenviar la contraseña; se reenvía la actual sin tocarla.
      await usuariosApi.actualizar(u.id_usuarios, {
        ...u,
        nombre_usuarios: v.nombre,
        apellido_usuarios: v.apellido,
        correo_usuarios: v.correo,
        telefono: v.telefono || null,
      });
      if (plan && plan.id !== u.plan?.tipo_membresia) {
        await asignarPlan({ idUsuario: u.id_usuarios, plan, existente: u.ultima });
      }
    } else {
      const id = await crearUsuarioCompleto({
        nombre: v.nombre,
        apellido: v.apellido,
        correo: v.correo,
        password: v.password,
        telefono: v.telefono,
        rol: ROLES.USER,
        id_gimnasio: idGimnasio,
      });
      if (plan) await asignarPlan({ idUsuario: id, plan, existente: null });
    }
  }

  return (
    <CrudPage
      title="Miembros"
      subtitle="Personas inscriptas en tu gimnasio"
      labels={{ nuevo: 'Nuevo miembro', editar: 'Editar miembro', eliminar: 'Eliminar miembro' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_usuarios"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(u) => usuariosApi.eliminar(u.id_usuarios)}
      searchText={(u) => `${u.nombre_usuarios} ${u.apellido_usuarios} ${u.correo_usuarios}`}
      searchPlaceholder="Buscar por nombre o correo…"
      emptyText="Todavía no hay miembros en tu gimnasio."
      deleteMessage={(u) => `Vas a eliminar a ${u.nombre_usuarios} ${u.apellido_usuarios}. Esta acción no se puede deshacer.`}
    />
  );
}
