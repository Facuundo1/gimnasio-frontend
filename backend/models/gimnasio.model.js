const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM gimnasio');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM gimnasio WHERE id_gimnasio = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO gimnasio (nombre_gimnasio, direccion_gimnasio, telefono_gimnasio) VALUES (?, ?, ?)',
    [d.nombre_gimnasio, d.direccion_gimnasio, d.telefono_gimnasio]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE gimnasio SET nombre_gimnasio = ?, direccion_gimnasio = ?, telefono_gimnasio = ? WHERE id_gimnasio = ?',
    [d.nombre_gimnasio, d.direccion_gimnasio, d.telefono_gimnasio, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM gimnasio WHERE id_gimnasio = ?', [id]);
  return r.affectedRows;
};
