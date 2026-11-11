const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM reservas');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM reservas WHERE id_reserva = ?', [id]);
  return filas[0];
};

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

  // Si la clase no existe, devuelve null
  if (filas.length === 0) {
    return null;
  }

  // Si existe, comprueba si quedan lugares
  return filas[0].reservas_activas < filas[0].capacidad;
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO reservas (estado_reserva, id_usuarios, id_clase) VALUES (?, ?, ?)',
    [d.estado_reserva, d.id_usuarios, d.id_clase]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE reservas SET estado_reserva = ?, id_usuarios = ?, id_clase = ? WHERE id_reserva = ?',
    [d.estado_reserva, d.id_usuarios, d.id_clase, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM reservas WHERE id_reserva = ?', [id]);
  return r.affectedRows;
};
