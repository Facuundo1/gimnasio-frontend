import { useCallback, useMemo, useState } from 'react';
import { CartContext } from './cart-context';

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ producto, cantidad }]

  const agregar = useCallback((producto) => {
    setItems((prev) => {
      const tope = producto.stock == null ? Infinity : Number(producto.stock);
      const actual = prev.find((i) => i.producto.id_producto === producto.id_producto);
      if (!actual) return tope > 0 ? [...prev, { producto, cantidad: 1 }] : prev;
      return prev.map((i) =>
        i === actual ? { ...i, cantidad: Math.min(i.cantidad + 1, tope) } : i,
      );
    });
  }, []);

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.producto.id_producto !== id) return i;
          const tope = i.producto.stock == null ? Infinity : Number(i.producto.stock);
          return { ...i, cantidad: Math.min(cantidad, tope) };
        })
        .filter((i) => i.cantidad > 0),
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const total = items.reduce((s, i) => s + Number(i.producto.precio_producto) * i.cantidad, 0);
    const cantidad = items.reduce((s, i) => s + i.cantidad, 0);
    return { items, total, cantidad, agregar, cambiarCantidad, vaciar };
  }, [items, agregar, cambiarCantidad, vaciar]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
