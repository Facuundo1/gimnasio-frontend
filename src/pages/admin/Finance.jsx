import { useCallback, useState } from 'react';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { membresiasApi, pedidosApi, usuariosApi } from '../../services';
import { membresiaVigente } from '../../features/memberships/planes';
import { miembrosDe } from '../../lib/scope';
import { fechaCorta, hoy, mismoId, mismoMes, moneda, nombreCompleto, parseFecha } from '../../lib/format';
import { Async, Badge, PageHeader, StatCard, Table, Tabs } from '../../components/ui';

function Detalle({ usuarios, membresias, pedidos, idGimnasio }) {
  const [filtro, setFiltro] = useState('todos');

  const miembros = miembrosDe(usuarios, idGimnasio);
  const ids = new Set(miembros.map((m) => Number(m.id_usuarios)));
  const nombre = (id) => nombreCompleto(miembros.find((m) => mismoId(m.id_usuarios, id)));

  const deMembresias = membresias
    .filter((m) => ids.has(Number(m.id_usuarios)))
    .map((m) => ({
      id: `m${m.id_membresia}`,
      tipo: 'membresias',
      fecha: m.fecha_inscripcion,
      concepto: `Membresía ${m.tipo_membresia}`,
      miembro: nombre(m.id_usuarios),
      monto: Number(m.precio_membresia || 0),
    }));
  const deTienda = pedidos
    .filter((p) => ids.has(Number(p.id_usuarios)))
    .map((p) => ({
      id: `p${p.id_pedido}`,
      tipo: 'tienda',
      fecha: p.fecha_pedido,
      concepto: 'Pedido en tienda',
      miembro: nombre(p.id_usuarios),
      monto: Number(p.total || 0),
    }));

  const todos = [...deMembresias, ...deTienda].sort((a, b) => (parseFecha(b.fecha) ?? 0) - (parseFecha(a.fecha) ?? 0));
  const delMes = todos.filter((x) => mismoMes(x.fecha));
  const suma = (lista) => lista.reduce((s, x) => s + x.monto, 0);

  const limite = hoy();
  limite.setDate(limite.getDate() + 7);
  const porVencer = miembros
    .map((u) => membresiaVigente(membresias, u.id_usuarios))
    .filter((m) => m && parseFecha(m.fecha_vencimiento) <= limite).length;

  const visibles = filtro === 'todos' ? todos : todos.filter((x) => x.tipo === filtro);
  const tabs = [
    { value: 'todos', label: 'Todos', count: todos.length },
    { value: 'membresias', label: 'Membresías', count: deMembresias.length },
    { value: 'tienda', label: 'Tienda', count: deTienda.length },
  ];

  const columns = [
    { key: 'fecha', header: 'Fecha', render: (x) => fechaCorta(x.fecha) },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (x) => (
        <>
          {x.concepto} <Badge tone={x.tipo === 'tienda' ? 'warning' : 'accent'}>{x.tipo === 'tienda' ? 'Tienda' : 'Membresía'}</Badge>
        </>
      ),
    },
    { key: 'miembro', header: 'Miembro', render: (x) => x.miembro || '—' },
    { key: 'monto', header: 'Monto', align: 'right', render: (x) => <strong>{moneda(x.monto)}</strong> },
  ];

  return (
    <>
      <div className="grid-stats">
        <StatCard label="Ingresos del mes" value={moneda(suma(delMes))} tone="success" />
        <StatCard label="Membresías" value={moneda(suma(delMes.filter((x) => x.tipo === 'membresias')))} tone="accent" hint="este mes" />
        <StatCard label="Tienda" value={moneda(suma(delMes.filter((x) => x.tipo === 'tienda')))} tone="warning" hint="este mes" />
        <StatCard label="Vencen en 7 días" value={porVencer} hint="membresías por renovar" />
      </div>

      <h2 className="page-section-title">Movimientos</h2>
      <Tabs items={tabs} value={filtro} onChange={setFiltro} label="Tipo de movimiento" />
      <div className="section-gap">
        <Table columns={columns} rows={visibles} rowKey="id" empty="Todavía no hay movimientos." />
      </div>
    </>
  );
}

export default function Finance() {
  const { usuario } = useAuth();
  const idGimnasio = usuario.id_gimnasio;
  const cargar = useCallback(
    () => Promise.all([usuariosApi.listar(), membresiasApi.listar(), pedidosApi.listar()]),
    [],
  );
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader title="Finanzas" subtitle="Ingresos por membresías y ventas de la tienda" />
      <Async state={state}>
        {([usuarios, membresias, pedidos]) => (
          <Detalle usuarios={usuarios} membresias={membresias} pedidos={pedidos} idGimnasio={idGimnasio} />
        )}
      </Async>
    </>
  );
}
