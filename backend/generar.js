require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

const modelo = (t, pk, ed) => `const db = require('../db');

exports.obtenerTodos = async () => {
  const [filas] = await db.query('SELECT * FROM ${t}');
  return filas;
};

exports.obtenerPorId = async (id) => {
  const [filas] = await db.query('SELECT * FROM ${t} WHERE ${pk} = ?', [id]);
  return filas[0];
};

exports.crear = async (d) => {
  const [r] = await db.query(
    'INSERT INTO ${t} (${ed.join(', ')}) VALUES (${ed.map(() => '?').join(', ')})',
    [${ed.map((c) => 'd.' + c).join(', ')}]
  );
  return r.insertId;
};

exports.actualizar = async (id, d) => {
  const [r] = await db.query(
    'UPDATE ${t} SET ${ed.map((c) => c + ' = ?').join(', ')} WHERE ${pk} = ?',
    [${ed.map((c) => 'd.' + c).join(', ')}, id]
  );
  return r.affectedRows;
};

exports.eliminar = async (id) => {
  const [r] = await db.query('DELETE FROM ${t} WHERE ${pk} = ?', [id]);
  return r.affectedRows;
};
`;

const controlador = (t, ob) => `const Modelo = require('../models/${t}.model');

const OBLIGATORIOS = ${JSON.stringify(ob)};
const faltantes = (body) =>
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

exports.listar = async (req, res, next) => {
  try {
    res.json(await Modelo.obtenerTodos());
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    const item = await Modelo.obtenerPorId(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.crear = async (req, res, next) => {
  try {
    const f = faltantes(req.body);
    if (f.length) return res.status(400).json({ error: 'Faltan campos: ' + f.join(', ') });
    const id = await Modelo.crear(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const f = faltantes(req.body);
    if (f.length) return res.status(400).json({ error: 'Faltan campos: ' + f.join(', ') });
    const filas = await Modelo.actualizar(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Actualizado correctamente' });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { next(err); }
};
`;

const rutas = (t) => `const router = require('express').Router();
const c = require('../controllers/${t}.controller');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
`;

async function generar(t) {
  const [cols] = await db.query(
    `SELECT COLUMN_NAME AS nombre, COLUMN_KEY AS clave, EXTRA AS extra,
            IS_NULLABLE AS nulo, COLUMN_DEFAULT AS def
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
    [process.env.DB_NAME, t]
  );
  if (!cols.length) return console.error(`❌ La tabla "${t}" no existe`);

  const pk = (cols.find((c) => c.clave === 'PRI') || cols[0]).nombre;
  const editables = cols
    .filter((c) => !c.extra.includes('auto_increment') && !c.extra.includes('GENERATED'))
    .map((c) => c.nombre);
  const obligatorios = cols
    .filter((c) => editables.includes(c.nombre) && c.nulo === 'NO' && c.def === null)
    .map((c) => c.nombre);

  const escribir = (carpeta, sufijo, texto) => {
    const archivo = path.join(__dirname, carpeta, `${t}.${sufijo}.js`);
    if (fs.existsSync(archivo)) return console.log(`⚠️  ${archivo} ya existe, no se pisa`);
    fs.writeFileSync(archivo, texto);
  };
  escribir('models', 'model', modelo(t, pk, editables));
  escribir('controllers', 'controller', controlador(t, obligatorios));
  escribir('routes', 'routes', rutas(t));

  // Registrar la ruta en routes/index.js
  const idx = path.join(__dirname, 'routes', 'index.js');
  let src = fs.readFileSync(idx, 'utf8');
  const linea = `router.use('/${t}', require('./${t}.routes'));`;
  if (!src.includes(linea)) {
    src = src.replace('module.exports = router;', `${linea}\n\nmodule.exports = router;`);
    fs.writeFileSync(idx, src);
  }
  console.log(`✅ ${t}: PK=${pk}, editables=[${editables.join(', ')}]`);
}

(async () => {
  const tablas = process.argv.slice(2);
  if (!tablas.length) console.log('Uso: node generar.js tabla1 tabla2 ...');
  for (const t of tablas) await generar(t);
  await db.end();
})();