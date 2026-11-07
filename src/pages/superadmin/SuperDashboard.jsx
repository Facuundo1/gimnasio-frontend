import useFetch from '../../hooks/useFetch';
import { clasesApi, gimnasiosApi, membresiasApi, usuariosApi } from '../../services';
import { delGimnasio, miembrosDe, soloRol } from '../../lib/scope';
import { fechaConDia, mismoId, mismoMes, moneda, nombreCompleto } from '../../lib/format';
import { ROLES } from '../../lib/roles';
import { Async, Badge, Card, EmptyState, PageHeader, StatCard } from '../../components/ui';

const cargar = () =>
  Promise.all([gimnasiosApi.listar(), usuariosApi.listar(), clasesApi.listar(), membresiasApi.listar()]);

const ingresosDelMes = (membresias) =>
  membresias.filter((m) => mismoMes(m.fecha_inscripcion)).reduce((s, m) => s + Number(m.precio_membresia || 0), 0);

function Resumen({ gimnasios, usuarios, clases, membresias }) {
  const admins = soloRol(usuarios, ROLES.ADMIN);
  const miembros = soloRol(usuarios, ROLES.USER);

  const red = gimnasios.map((g) => {
    const suyos = miembrosDe(usuarios, g.id_gimnasio);
    const ids = new Set(suyos.map((u) => Number(u.id_usuarios)));
    return {
      ...g,
      miembros: suyos.length,
      clases: delGimnasio(clases, g.id_gimnasio).length,
      ingresos: ingresosDelMes(membresias.filter((m) => ids.has(Number(m.id_usuarios)))),
      admins: admins.filter((a) => mismoId(a.id_gimnasio, g.id_gimnasio)),
    };
  });

  return (
    <>
      <div className="grid-stats">
        <StatCard label="Gimnasios" value={gimnasios.length} tone="accent" hint="en la red" />
        <StatCard label="Total miembros" value={miembros.length} tone="success" hint="en toda la red" />
        <StatCard label="Facturación del mes" value={moneda(ingresosDelMes(membresias))} tone="success" hint="por membresías" />
        <StatCard label="Admins" value={admins.length} tone="warning" hint="propietarios" />
      </div>

      <h2 className="page-section-title">Red de gimnasios</h2>
      {red.length ? (
        <div className="grid-2">
          {red.map((g) => (
            <Card key={g.id_gimnasio} as="article">
              <div className="split">
                <div>
                  <h3 className="gym__name">{g.nombre_gimnasio}</h3>
                  <p className="muted">{g.direccion_gimnasio}</p>
                </div>
                <Badge tone={g.admins.length ? 'success' : 'warning'}>{g.admins.length ? 'Con admin' : 'Sin admin'}</Badge>
              </div>
              <dl className="mini-stats">
                <div><dt>Miembros</dt><dd>{g.miembros}</dd></div>
                <div><dt>Clases</dt><dd>{g.clases}</dd></div>
                <div><dt>Ingresos</dt><dd>{moneda(g.ingresos)}</dd></div>
              </dl>
              <p className="muted">
                Admin: {g.admins.length ? g.admins.map(nombreCompleto).join(', ') : 'sin asignar'}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Todavía no hay gimnasios registrados" />
      )}
    </>
  );
}

export default function SuperDashboard() {
  const state = useFetch(cargar);
  return (
    <>
      <PageHeader title="Vista global del sistema" subtitle={`Panel maestro · ${fechaConDia()}`} />
      <Async state={state}>
        {([gimnasios, usuarios, clases, membresias]) => (
          <Resumen gimnasios={gimnasios} usuarios={usuarios} clases={clases} membresias={membresias} />
        )}
      </Async>
    </>
  );
}
