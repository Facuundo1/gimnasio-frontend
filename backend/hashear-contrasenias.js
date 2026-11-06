const bcrypt = require('bcryptjs');
const db = require('./db');

(async () => {
  const [usuarios] = await db.query('SELECT * FROM usuarios');
  for (const u of usuarios) {
    if (u.contrasenia_usuarios.startsWith('$2')) continue; // ya es hash
    const hash = await bcrypt.hash(u.contrasenia_usuarios, 10);
    await db.query(
      'UPDATE usuarios SET contrasenia_usuarios = ? WHERE correo_usuarios = ?',
      [hash, u.correo_usuarios]
    );
    console.log('Hasheada:', u.correo_usuarios);
  }
  await db.end();
})();