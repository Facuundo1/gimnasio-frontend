import { useState } from 'react';
import { Button, EmptyState, Modal, useToast } from '../../components/ui';
import useAuth from '../auth/useAuth';
import { useCart } from './cart-context';
import { detallePedidoApi, pedidosApi, productosApi } from '../../services';
import { aISODate, moneda } from '../../lib/format';

export default function CartModal({ open, onClose, onPedidoCreado }) {
  const { usuario } = useAuth();
  const { items, total, cambiarCantidad, vaciar } = useCart();
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    try {
      const pedido = await pedidosApi.crear({
        fecha_pedido: aISODate(new Date()),
        total,
        id_usuarios: usuario.id,
      });
      for (const { producto, cantidad } of items) {
        await detallePedidoApi.crear({
          cantidad,
          subtotal: Number(producto.precio_producto) * cantidad,
          id_pedido: pedido.id,
          id_producto: producto.id_producto,
        });
        // TODO(backend): el descuento de stock debería hacerlo el servidor al crear el detalle.
        if (producto.stock != null) {
          await productosApi.actualizar(producto.id_producto, {
            ...producto,
            stock: Math.max(0, Number(producto.stock) - cantidad),
          });
        }
      }
      vaciar();
      toast.exito('Pedido realizado');
      onPedidoCreado?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open={open} title="Tu carrito" onClose={onClose}>
      {items.length === 0 ? (
        <EmptyState title="El carrito está vacío" text="Agregá productos desde la tienda." />
      ) : (
        <>
          <ul className="cart-list">
            {items.map(({ producto, cantidad }) => (
              <li key={producto.id_producto} className="cart-item">
                <div className="cart-item__info">
                  <p className="cart-item__name">{producto.nombre_producto}</p>
                  <p className="muted">{moneda(producto.precio_producto)} c/u</p>
                </div>
                <div className="stepper" role="group" aria-label={`Cantidad de ${producto.nombre_producto}`}>
                  <button type="button" onClick={() => cambiarCantidad(producto.id_producto, cantidad - 1)} aria-label="Quitar uno">−</button>
                  <span>{cantidad}</span>
                  <button type="button" onClick={() => cambiarCantidad(producto.id_producto, cantidad + 1)} aria-label="Agregar uno">+</button>
                </div>
                <p className="cart-item__subtotal">{moneda(Number(producto.precio_producto) * cantidad)}</p>
              </li>
            ))}
          </ul>
          <p className="cart-total">
            <span>Total</span>
            <strong>{moneda(total)}</strong>
          </p>
          <div className="modal__actions">
            <Button variant="ghost" onClick={vaciar} disabled={enviando}>Vaciar</Button>
            <Button onClick={confirmar} loading={enviando}>Confirmar pedido</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
