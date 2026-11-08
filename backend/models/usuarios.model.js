const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query(
    `SELECT id_usuarios, nombre_usuarios, apellido_usuarios,
            correo_usuarios, telefono, rol, id_gimnasio
     FROM usuarios`
  );
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query(
    `SELECT id_usuarios, nombre_usuarios, apellido_usuarios,
            correo_usuarios, telefono, rol, id_gimnasio
     FROM usuarios
     WHERE id_usuarios = ?`,
    [id]
  );
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO usuarios (contrasenia_usuarios, nombre_usuarios, apellido_usuarios, correo_usuarios, telefono, rol, id_gimnasio) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [d.contrasenia_usuarios, d.nombre_usuarios, d.apellido_usuarios, d.correo_usuarios, d.telefono, d.rol, d.id_gimnasio]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE usuarios SET contrasenia_usuarios = ?, nombre_usuarios = ?, apellido_usuarios = ?, correo_usuarios = ?, telefono = ?, rol = ?, id_gimnasio = ? WHERE id_usuarios = ?',
    [d.contrasenia_usuarios, d.nombre_usuarios, d.apellido_usuarios, d.correo_usuarios, d.telefono, d.rol, d.id_gimnasio, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM usuarios WHERE id_usuarios = ?', [id]);
  return r.affectedRows;
};
