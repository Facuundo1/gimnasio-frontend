
const db = require('../db');

// Obtener todas las reservas.
// Superadmin: todas.
// Admin: solamente las de su gimnasio.
exports.obtenerTodos = async (usuario) => {
  let sql = `
    SELECT r.*
    FROM reservas r
    INNER JOIN clases c ON r.id_clase = c.id_clase
  `;
  const params = [];

  if (usuario.rol !== 'superadmin') {
    if (!usuario.id_gimnasio) {
      throw new Error('El usuario no tiene un gimnasio asignado');
    }

    sql += ' WHERE c.id_gimnasio = ?';
    params.push(usuario.id_gimnasio);
  }

  const [filas] = await db.query(sql, params);
  return filas;
};

// Obtener una reserva por ID.
exports.obtenerPorId = async (id) => {
  const [filas] = await db.query(
    'SELECT * FROM reservas WHERE id_reserva = ?',
    [id]
  );
  return filas[0];
};

// Obtener reservas de un usuario.
exports.obtenerPorUsuario = async (idUsuario) => {
  const [filas] = await db.query(
    'SELECT * FROM reservas WHERE id_usuarios = ?',
    [idUsuario]
  );
  return filas;
};

// Comprobar si existe una reserva activa.
exports.existeReservaActiva = async (idUsuario, idClase) => {
  const [filas] = await db.query(
    `SELECT id_reserva
     FROM reservas
     WHERE id_usuarios = ?
     AND id_clase = ?
     AND estado_reserva = 'Activa'`,
    [idUsuario, idClase]
  );

  return filas.length > 0;
};

// Comprobar otra reserva activa al actualizar.
exports.existeOtraReservaActiva = async (idUsuario, idClase, idReserva) => {
  const [filas] = await db.query(
    `SELECT id_reserva
     FROM reservas
     WHERE id_usuarios = ?
     AND id_clase = ?
     AND estado_reserva = 'Activa'
     AND id_reserva != ?`,
    [idUsuario, idClase, idReserva]
  );

  return filas.length > 0;
};

// Comprobar disponibilidad de cupos.
exports.tieneCupo = async (idClase) => {
  const [filas] = await db.query(
    `SELECT
       c.capacidad,
       COUNT(r.id_reserva) AS reservas_activas
     FROM clases c
     LEFT JOIN reservas r
       ON c.id_clase = r.id_clase
       AND r.estado_reserva = 'Activa'
     WHERE c.id_clase = ?
     GROUP BY c.id_clase, c.capacidad`,
    [idClase]
  );

  if (filas.length === 0) return null;

  return Number(filas[0].reservas_activas) < Number(filas[0].capacidad);
};

// Crear reserva.
exports.crear = async (d) => {
  const [r] = await db.query(
    `INSERT INTO reservas
     (estado_reserva, id_usuarios, id_clase)
     VALUES (?, ?, ?)`,
    ['Activa', d.id_usuarios, d.id_clase]
  );

  return r.insertId;
};

// Actualizar reserva.
exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    `UPDATE reservas
     SET estado_reserva = ?, id_usuarios = ?, id_clase = ?
     WHERE id_reserva = ?`,
    [d.estado_reserva, d.id_usuarios, d.id_clase, id]
  );

  return r.affectedRows;
};

// Cancelar reserva.
exports.cancelar = async (id) => {
  const [r] = await db.query(
    `UPDATE reservas
     SET estado_reserva = 'Cancelada'
     WHERE id_reserva = ?
     AND estado_reserva = 'Activa'`,
    [id]
  );

  return r.affectedRows;
};

// Eliminar definitivamente.
exports.eliminar = async (id) => {
  const [r] = await db.query(
    'DELETE FROM reservas WHERE id_reserva = ?',
    [id]
  );

  return r.affectedRows;
};
