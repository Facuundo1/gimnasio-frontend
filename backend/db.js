require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({ // Crea el pool. Cada db.query(...) toma una conexión libre, ejecuta la consulta y la devuelve.
  host: process.env.DB_HOST,  // process.env lee las variables del .env: así las credenciales no quedan en el código.
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

function explicarError(err) {
  switch (err.code) {
    case 'ECONNREFUSED':
      return 'No se pudo conectar: MySQL no está corriendo o el host/puerto son incorrectos.';
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Usuario o contraseña incorrectos (revisá DB_USER y DB_PASSWORD en el .env).';
    case 'ER_BAD_DB_ERROR':
      return 'La base de datos no existe (revisá DB_NAME en el .env).';
    case 'ENOTFOUND':
      return 'No se encontró el host (revisá DB_HOST en el .env).';
    default:
      return `Error de conexión: ${err.message}`;
  }
}

async function probarConexion() {
  try {    // ping verifica que MySQL conteste. await pausa la función hasta tener la respuesta
    const conn = await pool.getConnection();
    await conn.ping(); // Devuelve la conexión al pool (no la cierra), para que otra consulta la use
    conn.release();
    console.log('✅ Conectado a MySQL');
    return true;
  } catch (err) {
    console.error('❌', explicarError(err));
    return false;
  }
}

module.exports = pool;
module.exports.probarConexion = probarConexion;