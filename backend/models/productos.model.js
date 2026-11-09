
const db = require('../db');

// Superadmin puede consultar todos los productos.
// Admin y usuario solamente los de su gimnasio.
exports.obtenerTodos = async (usuario) => {
  let sql = 'SELECT * FROM productos';
  const params = [];

  if (usuario.rol !== 'superadmin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El usuario no tiene un gimnasio asignado');
    }

    sql += ' WHERE id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas;
};

exports.obtenerPorId = async (id, usuario) => {
  let sql = 'SELECT * FROM productos WHERE id_producto = ?';
  const params = [id];

  if (usuario.rol !== 'superadmin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El usuario no tiene un gimnasio asignado');
    }

    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO productos
    (nombre_producto, precio_producto, stock, id_gimnasio)
    VALUES (?, ?, ?, ?)`,
    [d.nombre_producto, d.precio_producto, d.stock, d.id_gimnasio]
  );

  return r.insertId;
};

exports.actualizar = async (id, d, usuario) => {
  let sql = `UPDATE productos
    SET nombre_producto = ?, precio_producto = ?, stock = ?, id_gimnasio = ?
    WHERE id_producto = ?`;

  const params = [
    d.nombre_producto,
    d.precio_producto,
    d.stock,
    d.id_gimnasio,
    id
  ];

  if (usuario.rol !== 'superadmin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El usuario no tiene un gimnasio asignado');
    }

    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};

exports.eliminar = async (id, usuario) => {
  let sql = 'DELETE FROM productos WHERE id_producto = ?';
  const params = [id];

  if (usuario.rol !== 'superadmin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El usuario no tiene un gimnasio asignado');
    }

    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};
