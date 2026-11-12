const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM clases');
  return filas;
};

exports.obtenerPorGimnasio = async (id_gimnasio) => {
  const [filas] = await db.query(
    'SELECT * FROM clases WHERE id_gimnasio = ?',
    [id_gimnasio]
  );
  return filas;
};

exports.obtenerPorIdYGimnasio = async (id, id_gimnasio) => {
  const [filas] = await db.query(
    'SELECT * FROM clases WHERE id_clase = ? AND id_gimnasio = ?',
    [id, id_gimnasio]
  );
  return filas[0];
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM clases WHERE id_clase = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO clases
    (nombre_clase, capacidad, fecha_clase, hora_clase, id_gimnasio, profesor_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      d.nombre_clase,
      d.capacidad,
      d.fecha_clase,
      d.hora_clase,
      d.id_gimnasio,
      d.profesor_id
    ]
  );

  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    `UPDATE clases
    SET nombre_clase = ?, capacidad = ?, fecha_clase = ?,
        hora_clase = ?, id_gimnasio = ?, profesor_id = ?
    WHERE id_clase = ?`,
    [
      d.nombre_clase,
      d.capacidad,
      d.fecha_clase,
      d.hora_clase,
      d.id_gimnasio,
      d.profesor_id,
      id
    ]
  );

  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM clases WHERE id_clase = ?', [id]);
  return r.affectedRows;
};
