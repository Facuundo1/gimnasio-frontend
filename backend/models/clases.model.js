const db = require('../db');

exports.obtenerTodos = async () => { 
    // db.query devuelve [filas, metadatos]. Con [filas] nos quedamos solo con las filas.
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

exports.actualizar = async (id, d, usuario) => {
  let sql = `UPDATE clases
    SET nombre_clase = ?, capacidad = ?, fecha_clase = ?, hora_clase = ?, profesor_id = ?
    WHERE id_clase = ?`;

  const params = [
    d.nombre_clase,
    d.capacidad,
    d.fecha_clase,
    d.hora_clase,
    d.profesor_id,
    id
  ];

  if (usuario.rol === 'superadmin') {
    sql = `UPDATE clases
      SET nombre_clase = ?, capacidad = ?, fecha_clase = ?, hora_clase = ?, profesor_id = ?, id_gimnasio = ?
      WHERE id_clase = ?`;

    params.splice(5, 0, d.id_gimnasio);
  } else {
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
  let sql = 'DELETE FROM clases WHERE id_clase = ?';
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
