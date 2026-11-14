const db = require('../db');

exports.buscarPorCorreo = async (correo) => {
  const [filas] = await db.query(
    'SELECT * FROM usuarios WHERE correo_usuarios = ?',
    [correo]
  );
  return filas[0];
};

exports.crear = async ({ nombre, apellido, correo, hash, id_gimnasio }) => {
  const [r] = await db.query(
    `INSERT INTO usuarios
      (nombre_usuarios, apellido_usuarios, correo_usuarios,
       contrasenia_usuarios, id_gimnasio)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, apellido, correo, hash, id_gimnasio]
  );
  return r.insertId;
};