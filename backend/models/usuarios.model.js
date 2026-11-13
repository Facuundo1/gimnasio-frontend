
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
// ===== ABM de usuarios (Admin / Superadmin). No borres lo anterior. =====
const COLS_PUBLICAS =
  'id_usuarios, nombre_usuarios, apellido_usuarios, correo_usuarios, telefono, rol, id_gimnasio';

// Superadmin: todos. Admin: los de su gimnasio, sin superadmins.
exports.listarGestion = async (actor) => {
  let sql = `SELECT ${COLS_PUBLICAS} FROM usuarios`;
  const params = [];
  if (actor.rol !== 'superadmin') {
    sql += " WHERE id_gimnasio = ? AND rol <> 'superadmin'";
    params.push(actor.id_gimnasio);
  }
  sql += ' ORDER BY apellido_usuarios, nombre_usuarios';
  const [filas] = await db.query(sql, params);
  return filas;
};

exports.buscarPorIdGestion = async (id) => {
  const [filas] = await db.query(
    `SELECT ${COLS_PUBLICAS} FROM usuarios WHERE id_usuarios = ?`, [id]);
  return filas[0];
};

exports.correoEnUso = async (correo, excluirId = 0) => {
  const [filas] = await db.query(
    'SELECT id_usuarios FROM usuarios WHERE correo_usuarios = ? AND id_usuarios <> ?',
    [correo, excluirId]);
  return filas.length > 0;
};

exports.crearUsuario = async (d) => {
  const [r] = await db.query(
    `INSERT INTO usuarios
       (nombre_usuarios, apellido_usuarios, correo_usuarios, contrasenia_usuarios,
        telefono, rol, id_gimnasio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [d.nombre_usuarios, d.apellido_usuarios, d.correo_usuarios, d.hash,
     d.telefono ?? null, d.rol, d.id_gimnasio]
  );
  return r.insertId;
};

// La contraseña solo se cambia si viene d.hash
exports.actualizarUsuario = async (id, d) => {
  const sets = ['nombre_usuarios = ?', 'apellido_usuarios = ?', 'correo_usuarios = ?',
                'telefono = ?', 'rol = ?', 'id_gimnasio = ?'];
  const params = [d.nombre_usuarios, d.apellido_usuarios, d.correo_usuarios,
                  d.telefono ?? null, d.rol, d.id_gimnasio];
  if (d.hash) {
    sets.push('contrasenia_usuarios = ?');
    params.push(d.hash);
  }
  params.push(id);
  const [r] = await db.query(
    `UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuarios = ?`, params);
  return r.affectedRows;
};

// Baja: borra lo que depende del usuario, todo o nada
exports.eliminarConDependencias = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `DELETE FROM detallepedido WHERE id_pedido IN
         (SELECT id_pedido FROM pedidocarrito WHERE id_usuarios = ?)`, [id]);
    await conn.query('DELETE FROM pedidocarrito WHERE id_usuarios = ?', [id]);
    await conn.query('DELETE FROM reservas WHERE id_usuarios = ?', [id]);
    await conn.query('DELETE FROM membresias WHERE id_usuarios = ?', [id]);
    const [r] = await conn.query('DELETE FROM usuarios WHERE id_usuarios = ?', [id]);
    await conn.commit();
    return r.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
