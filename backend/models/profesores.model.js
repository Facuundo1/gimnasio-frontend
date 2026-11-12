const db = require('../db');

exports.obtenerTodos = async (usuario) => {
  let sql = 'SELECT * FROM profesores';
  const params = [];

  // Los administradores ven solamente los profesores
  // de su gimnasio.
  if (usuario.rol === 'admin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El administrador no tiene un gimnasio asignado');
    }

    sql += ' WHERE id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  // Los usuarios con gimnasio ven los profesores de su gimnasio.
  if (usuario.rol === 'usuario' && usuario.id_gimnasio) {
    sql += ' WHERE id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  // Los usuarios sin gimnasio y los superadministradores
  // pueden ver todos los profesores.

  const [filas] = await db.query(sql, params);
  return filas;
};

exports.obtenerPorId = async (id, usuario) => {
  let sql = 'SELECT * FROM profesores WHERE id_profesor = ?';
  const params = [id];

  if (usuario.rol !== 'superadmin') {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas[0];
};

exports.obtenerPorIdYGimnasio = async (id, id_gimnasio) => {
  const [filas] = await db.query(
    `SELECT * FROM profesores
     WHERE id_profesor = ? AND id_gimnasio = ?`,
    [id, id_gimnasio]
  );

  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO profesores
    (nombre_profesor, apellido_profesor, especialidad,
     telefono_profesor, correo_profesor, id_gimnasio)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      d.nombre_profesor,
      d.apellido_profesor,
      d.especialidad,
      d.telefono_profesor,
      d.correo_profesor,
      d.id_gimnasio
    ]
  );

  return r.insertId;
};

exports.actualizar = async (id, d, usuario) => {
  let sql = `UPDATE profesores
    SET nombre_profesor = ?, apellido_profesor = ?,
        especialidad = ?, telefono_profesor = ?,
        correo_profesor = ?
    WHERE id_profesor = ?`;

  const params = [
    d.nombre_profesor,
    d.apellido_profesor,
    d.especialidad,
    d.telefono_profesor,
    d.correo_profesor,
    id
  ];

  if (usuario.rol === 'superadmin') {
    sql = `UPDATE profesores
      SET nombre_profesor = ?, apellido_profesor = ?,
          especialidad = ?, telefono_profesor = ?,
          correo_profesor = ?, id_gimnasio = ?
      WHERE id_profesor = ?`;

    params.splice(5, 0, d.id_gimnasio);
  } else {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};

exports.eliminar = async (id, usuario) => {
  let sql = 'DELETE FROM profesores WHERE id_profesor = ?';
  const params = [id];

  if (usuario.rol !== 'superadmin') {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};