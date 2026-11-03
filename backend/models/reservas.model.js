const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM reservas');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM reservas WHERE id_reserva = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO reservas (estado_reserva, id_usuarios, id_clase) VALUES (?, ?, ?)',
    [d.estado_reserva, d.id_usuarios, d.id_clase]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE reservas SET estado_reserva = ?, id_usuarios = ?, id_clase = ? WHERE id_reserva = ?',
    [d.estado_reserva, d.id_usuarios, d.id_clase, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM reservas WHERE id_reserva = ?', [id]);
  return r.affectedRows;
};
