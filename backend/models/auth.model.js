const db = require('../db');

exports.buscarPorCorreo = async (correo) => {
  const [filas] = await db.query(
    'SELECT * FROM usuarios WHERE correo_usuarios = ?',
    [correo]
  );
  return filas[0];
};

exports.crear = async ({ nombre, apellido, correo, hash }) => {
  const [r] = await db.query(
    `INSERT INTO usuarios
      (nombre_usuarios, apellido_usuarios, correo_usuarios, contrasenia_usuarios)
     VALUES (?, ?, ?, ?)`,
    [nombre, apellido, correo, hash]
  );
  return r.insertId;
}