import { useState } from 'react';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { productosApi } from '../../services';
import { useCart } from '../../features/store/cart-context';
import CartModal from '../../features/store/CartModal';
import { delGimnasio } from '../../lib/scope';
import { moneda, normalizar } from '../../lib/format';
import { Async, Badge, Button, Card, EmptyState, PageHeader } from '../../components/ui';

const cargar = () => productosApi.listar();

function Catalogo({ productos, usuario }) {
  const { agregar, items, cantidad } = useCart();
  const [busqueda, setBusqueda] = useState('');

  const lista = delGimnasio(productos, usuario.id_gimnasio);
  const q = normalizar(busqueda);
  const visibles = q ? lista.filter((p) => normalizar(p.nombre_producto).includes(q)) : lista;
  const enCarrito = (id) => items.find((i) => i.producto.id_producto === id)?.cantidad ?? 0;

  return (
    <>
      <input
        type="search"
        className="input input--search"
        placeholder="Buscar producto…"
        aria-label="Buscar producto"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {visibles.length ? (
        <div className="product-grid">
          {visibles.map((p) => {
            const sinStock = p.stock != null && Number(p.stock) <= enCarrito(p.id_producto);
            return (
              <Card key={p.id_producto} as="article" flush className="product">
                <div className="product__img" aria-hidden="true">{p.nombre_producto.charAt(0)}</div>
                <div className="product__body">
                  <h2 className="product__name">{p.nombre_producto}</h2>
                  {p.stock != null && Number(p.stock) <= 5 && (
                    <Badge tone={Number(p.stock) === 0 ? 'danger' : 'warning'}>
                      {Number(p.stock) === 0 ? 'Sin stock' : `Quedan ${p.stock}`}
                    </Badge>
                  )}
                  <div className="product__footer">
                    <span className="product__price">{moneda(p.precio_producto)}</span>
                    <Button size="sm" disabled={sinStock} onClick={() => agregar(p)}>
                      Agregar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No hay productos para mostrar" text={busqueda ? 'Probá con otra búsqueda.' : undefined} />
      )}
      <span className="sr-only" aria-live="polite">{cantidad} productos en el carrito</span>
    </>
  );
}

export default function UserStore() {
  const { usuario } = useAuth();
  const { cantidad } = useCart();
  const state = useFetch(cargar);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  return (
    <>
      <PageHeader
        title="Tienda"
        subtitle={state.data ? `${delGimnasio(state.data, usuario.id_gimnasio).length} productos` : undefined}
        actions={
          <Button onClick={() => setCarritoAbierto(true)}>
            Carrito{cantidad > 0 ? ` (${cantidad})` : ''}
          </Button>
        }
      />
      <Async state={state}>{(productos) => <Catalogo productos={productos} usuario={usuario} />}</Async>
      <CartModal open={carritoAbierto} onClose={() => setCarritoAbierto(false)} onPedidoCreado={state.reload} />
    </>
  );
}
