const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM membresias');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM membresias WHERE id_membresia = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO membresias (tipo_membresia, fecha_inscripcion, precio_membresia, fecha_vencimiento, estado_membresia, id_usuarios) VALUES (?, ?, ?, ?, ?, ?)',
    [d.tipo_membresia, d.fecha_inscripcion, d.precio_membresia, d.fecha_vencimiento, d.estado_membresia, d.id_usuarios]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE membresias SET tipo_membresia = ?, fecha_inscripcion = ?, precio_membresia = ?, fecha_vencimiento = ?, estado_membresia = ?, id_usuarios = ? WHERE id_membresia = ?',
    [d.tipo_membresia, d.fecha_inscripcion, d.precio_membresia, d.fecha_vencimiento, d.estado_membresia, d.id_usuarios, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM membresias WHERE id_membresia = ?', [id]);
  return r.affectedRows;
};
