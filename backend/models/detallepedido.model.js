const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM detallepedido');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM detallepedido WHERE id_detalle_pedido = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO detallepedido (cantidad, subtotal, id_pedido, id_producto) VALUES (?, ?, ?, ?)',
    [d.cantidad, d.subtotal, d.id_pedido, d.id_producto]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE detallepedido SET cantidad = ?, subtotal = ?, id_pedido = ?, id_producto = ? WHERE id_detalle_pedido = ?',
    [d.cantidad, d.subtotal, d.id_pedido, d.id_producto, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM detallepedido WHERE id_detalle_pedido = ?', [id]);
  return r.affectedRows;
};
