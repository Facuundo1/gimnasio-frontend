const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM profesores');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM profesores WHERE id_profesor = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO profesores (nombre_profesor, apellido_profesor, especialidad, telefono_profesor, correo_profesor, id_gimnasio) VALUES (?, ?, ?, ?, ?, ?)',
    [d.nombre_profesor, d.apellido_profesor, d.especialidad, d.telefono_profesor, d.correo_profesor, d.id_gimnasio]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE profesores SET nombre_profesor = ?, apellido_profesor = ?, especialidad = ?, telefono_profesor = ?, correo_profesor = ?, id_gimnasio = ? WHERE id_profesor = ?',
    [d.nombre_profesor, d.apellido_profesor, d.especialidad, d.telefono_profesor, d.correo_profesor, d.id_gimnasio, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM profesores WHERE id_profesor = ?', [id]);
  return r.affectedRows;
};
