const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM productos');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO productos (nombre_producto, precio_producto, stock, id_gimnasio) VALUES (?, ?, ?, ?)',
    [d.nombre_producto, d.precio_producto, d.stock, d.id_gimnasio]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE productos SET nombre_producto = ?, precio_producto = ?, stock = ?, id_gimnasio = ? WHERE id_producto = ?',
    [d.nombre_producto, d.precio_producto, d.stock, d.id_gimnasio, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
  return r.affectedRows;
};
