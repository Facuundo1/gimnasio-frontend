const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM pedidocarrito');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM pedidocarrito WHERE id_pedido = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO pedidocarrito (fecha_pedido, total, id_usuarios) VALUES (?, ?, ?)',
    [d.fecha_pedido, d.total, d.id_usuarios]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE pedidocarrito SET fecha_pedido = ?, total = ?, id_usuarios = ? WHERE id_pedido = ?',
    [d.fecha_pedido, d.total, d.id_usuarios, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM pedidocarrito WHERE id_pedido = ?', [id]);
  return r.affectedRows;
};
