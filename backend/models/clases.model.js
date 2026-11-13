const db = require('../db');

const esSuper = (u) => u.rol === 'superadmin';

exports.obtenerTodos = async (usuario) => {
  let sql = 'SELECT * FROM clases';
  const params = [];
  if (!esSuper(usuario)) {
    sql += ' WHERE id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }
  const [filas] = await db.query(sql, params);
  return filas;
};

exports.obtenerPorId = async (id, usuario) => {
  let sql = 'SELECT * FROM clases WHERE id_clase = ?';
  const params = [id];
  if (!esSuper(usuario)) {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }
  const [filas] = await db.query(sql, params);
  return filas[0];
};

// ¿El profesor existe y es de ese gimnasio?
exports.profesorDelGimnasio = async (idProfesor, idGimnasio) => {
  const [filas] = await db.query(
    'SELECT id_profesor FROM profesores WHERE id_profesor = ? AND id_gimnasio = ?',
    [idProfesor, idGimnasio]
  );
  return filas.length > 0;
};

exports.obtenerPorIdYGimnasio = async (id, idGimnasio) => {
  const [filas] = await db.query(
    'SELECT * FROM clases WHERE id_clase = ? AND id_gimnasio = ?',
    [id, idGimnasio]
  );
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO clases
       (nombre_clase, capacidad, fecha_clase, hora_clase, id_gimnasio, profesor_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.nombre_clase, d.capacidad, d.fecha_clase, d.hora_clase,
     d.id_gimnasio, d.profesor_id ?? null]
  );
  return r.insertId;
};

exports.actualizar = async (id, d, usuario) => {
  let sql = `UPDATE clases
             SET nombre_clase = ?, capacidad = ?, fecha_clase = ?, hora_clase = ?,
                 profesor_id = ?
             WHERE id_clase = ?`;
  const params = [d.nombre_clase, d.capacidad, d.fecha_clase, d.hora_clase,
                  d.profesor_id ?? null, id];
  if (!esSuper(usuario)) {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }
  const [r] = await db.query(sql, params);
  return r.affectedRows;
};

exports.eliminar = async (id, usuario) => {
  let sql = 'DELETE FROM clases WHERE id_clase = ?';
  const params = [id];
  if (!esSuper(usuario)) {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }
  const [r] = await db.query(sql, params);
  return r.affectedRows;
};