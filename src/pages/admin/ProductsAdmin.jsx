import { useCallback } from 'react';
import useAuth from '../../features/auth/useAuth';
import CrudPage from '../../components/crud/CrudPage';
import { Badge } from '../../components/ui';
import { gimnasiosApi, productosApi } from '../../services';
import { delGimnasio } from '../../lib/scope';
import { mismoId, moneda } from '../../lib/format';
import { ROLES } from '../../lib/roles';

const getRows = (d) => d.filas;

// Lo usan admin (solo su gimnasio) y superadmin (todos, eligiendo gimnasio).
export default function ProductsAdmin() {
  const { usuario } = useAuth();
  const esSuper = usuario.rol === ROLES.SUPERADMIN;
  const idGimnasio = esSuper ? null : usuario.id_gimnasio;

  const loader = useCallback(async () => {
    const [productos, gimnasios] = await Promise.all([productosApi.listar(), gimnasiosApi.listar()]);
    const filas = delGimnasio(productos, idGimnasio).map((p) => ({
      ...p,
      gimnasio: gimnasios.find((g) => mismoId(g.id_gimnasio, p.id_gimnasio))?.nombre_gimnasio ?? '—',
    }));
    return { filas, gimnasios };
  }, [idGimnasio]);

  const columns = [
    { key: 'nombre', header: 'Producto', render: (p) => <span className="cell-person__name">{p.nombre_producto}</span> },
    ...(esSuper ? [{ key: 'gimnasio', header: 'Gimnasio', render: (p) => p.gimnasio }] : []),
    { key: 'precio', header: 'Precio', render: (p) => moneda(p.precio_producto) },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => {
        const n = Number(p.stock ?? 0);
        if (n === 0) return <Badge tone="danger">Sin stock</Badge>;
        if (n <= 5) return <Badge tone="warning">{n} unidades</Badge>;
        return <Badge>{n} unidades</Badge>;
      },
    },
  ];

  const fields = (d) => [
    { name: 'nombre', label: 'Nombre del producto', required: true, full: true },
    { name: 'precio', label: 'Precio', type: 'number', min: 0, step: '0.01', required: true },
    { name: 'stock', label: 'Stock', type: 'number', min: 0, step: 1, required: true },
    ...(esSuper
      ? [{
          name: 'gimnasio', label: 'Gimnasio', type: 'select', required: true, full: true,
          options: d.gimnasios.map((g) => ({ value: g.id_gimnasio, label: g.nombre_gimnasio })),
        }]
      : []),
  ];

  const initialValues = (p) => ({
    nombre: p?.nombre_producto ?? '',
    precio: p ? String(p.precio_producto) : '',
    stock: p ? String(p.stock ?? 0) : '',
    gimnasio: p?.id_gimnasio != null ? String(p.id_gimnasio) : '',
  });

  async function onSubmit(v, p) {
    const datos = {
      nombre_producto: v.nombre,
      precio_producto: Number(v.precio),
      stock: Number(v.stock),
      id_gimnasio: esSuper ? Number(v.gimnasio) : idGimnasio,
    };
    if (p) await productosApi.actualizar(p.id_producto, datos);
    else await productosApi.crear(datos);
  }

  return (
    <CrudPage
      title="Tienda"
      subtitle="Productos a la venta y su stock"
      labels={{ nuevo: 'Nuevo producto', editar: 'Editar producto', eliminar: 'Eliminar producto' }}
      loader={loader}
      getRows={getRows}
      rowKey="id_producto"
      columns={columns}
      fields={fields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onDelete={(p) => productosApi.eliminar(p.id_producto)}
      searchText={(p) => p.nombre_producto}
      searchPlaceholder="Buscar producto…"
      emptyText="Todavía no cargaste productos."
      deleteMessage={(p) => `Vas a eliminar ${p.nombre_producto} del catálogo.`}
    />
  );
}
