
const db = require('../db');

exports.obtenerTodos = async (usuario) => {
  let sql = `
    SELECT id_usuarios, nombre_usuarios, apellido_usuarios,
           correo_usuarios, telefono, rol, id_gimnasio
    FROM usuarios
  `;
  const params = [];

  if (usuario.rol === 'admin') {
    sql += ' WHERE id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas;
};

exports.obtenerPorId = async (id, usuario) => {
  let sql = `
    SELECT id_usuarios, nombre_usuarios, apellido_usuarios,
           correo_usuarios, telefono, rol, id_gimnasio
    FROM usuarios
    WHERE id_usuarios = ?
  `;
  const params = [id];

  if (usuario.rol === 'admin') {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO usuarios
     (contrasenia_usuarios, nombre_usuarios, apellido_usuarios,
      correo_usuarios, telefono, rol, id_gimnasio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      d.contrasenia_usuarios,
      d.nombre_usuarios,
      d.apellido_usuarios,
      d.correo_usuarios,
      d.telefono,
      d.rol,
      d.id_gimnasio
    ]
  );
  return r.insertId;
};

exports.actualizar = async (id, d, usuario) => {
  let sql = `
    UPDATE usuarios
    SET contrasenia_usuarios = ?, nombre_usuarios = ?,
        apellido_usuarios = ?, correo_usuarios = ?,
        telefono = ?, rol = ?, id_gimnasio = ?
    WHERE id_usuarios = ?
  `;
  const params = [
    d.contrasenia_usuarios,
    d.nombre_usuarios,
    d.apellido_usuarios,
    d.correo_usuarios,
    d.telefono,
    d.rol,
    d.id_gimnasio,
    id
  ];

  if (usuario.rol === 'admin') {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};

exports.eliminar = async (id, usuario) => {
  let sql = 'DELETE FROM usuarios WHERE id_usuarios = ?';
  const params = [id];

  if (usuario.rol === 'admin') {
    sql += ' AND id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [r] = await db.query(sql, params);
  return r.affectedRows;
};
