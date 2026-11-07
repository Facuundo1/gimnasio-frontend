const db = require('./db');

(async () => {
  const ok = await db.probarConexion();
  if (!ok) process.exit(1);

  try {
    const [filas] = await db.query ('SELECT * FROM clases LIMIT 5');
    console.log('Resultado de la consulta:');
    console.table(filas);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.error('❌ La tabla no existe. Revisá el nombre en la consulta.');
    } else {
      console.error('❌ Error en la consulta:', err.message);
    }
  } finally {
    await db.end();
  }
})();