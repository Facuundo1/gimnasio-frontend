import useFetch from '../../hooks/useFetch';
import {
  clasesApi, gimnasiosApi, membresiasApi, pedidosApi, productosApi, profesoresApi, reservasApi, sistemaApi, usuariosApi,
} from '../../services';
import { Async, Badge, PageHeader, StatCard, Table } from '../../components/ui';

async function cargar() {
  const inicio = performance.now();
  const salud = await sistemaApi.health();
  const latencia = Math.round(performance.now() - inicio);

  const recursos = [
    ['Gimnasios', gimnasiosApi], ['Usuarios', usuariosApi], ['Profesores', profesoresApi],
    ['Clases', clasesApi], ['Reservas', reservasApi], ['Membresías', membresiasApi],
    ['Productos', productosApi], ['Pedidos', pedidosApi],
  ];
  const listas = await Promise.all(recursos.map(([, api]) => api.listar()));
  const conteos = recursos.map(([nombre], i) => ({ nombre, total: listas[i].length }));
  return { ok: salud?.ok === true, latencia, conteos };
}

const columns = [
  { key: 'nombre', header: 'Recurso' },
  { key: 'total', header: 'Registros', align: 'right' },
];

export default function System() {
  const state = useFetch(cargar);
  return (
    <>
      <PageHeader title="Sistema" subtitle="Estado de la API y volumen de datos" />
      <Async state={state}>
        {({ ok, latencia, conteos }) => (
          <>
            <div className="grid-stats">
              <StatCard label="API" value={ok ? 'En línea' : 'Con problemas'} tone={ok ? 'success' : 'warning'} hint={import.meta.env.VITE_API_URL || '/api'} />
              <StatCard label="Latencia" value={latencia} unit="ms" hint="GET /health" />
              <StatCard label="Registros totales" value={conteos.reduce((s, c) => s + c.total, 0)} tone="accent" />
              <StatCard label="Entorno" value={import.meta.env.MODE} hint={import.meta.env.DEV ? 'desarrollo' : 'producción'} />
            </div>
            <h2 className="page-section-title">Datos por recurso</h2>
            <Table columns={columns} rows={conteos} rowKey="nombre" />
            <p className="muted section-gap">
              <Badge tone={ok ? 'success' : 'danger'}>{ok ? 'Operativo' : 'Revisar'}</Badge>
            </p>
          </>
        )}
      </Async>
    </>
  );
}
