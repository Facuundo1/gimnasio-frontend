
const Modelo = require('../models/usuarios.model');
const bcrypt = require('bcryptjs');

//Lista los campos requeridos para crear o actualizar un usuario. Si alguno falta, se devuelve un error 400.
const OBLIGATORIOS = [
  'contrasenia_usuarios',
  'nombre_usuarios',
  'apellido_usuarios',
  'correo_usuarios'
];

const faltantes = (body) =>   // filter conserva solo los campos que faltan o están vacíos.
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

exports.listar = async (req, res, next) => {
  try {    // El modelo usa req.usuario.rol e id_gimnasio para decidir qué filas devolver
    res.json(await Modelo.obtenerTodos(req.usuario));
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {  // req.params: valores de la URL. Para /usuarios/12, req.params.id === '12' (texto).
    const item = await Modelo.obtenerPorId(req.params.id, req.usuario);

    if (!item) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }
    // Operador ternario: condición ? valorSiVerdadero : valorSiFalso.
    const rol = req.usuario.rol === 'admin'
      ? 'usuario'
      : (req.body.rol || 'usuario');
 // El admin queda forzado a su propio gimnasio: no puede crear usuarios en otro
    const id_gimnasio = req.usuario.rol === 'admin'
      ? req.usuario.id_gimnasio
      : (req.body.id_gimnasio || null);
 // Nunca se guarda la contraseña en texto plano.
    const hash = await bcrypt.hash(req.body.contrasenia_usuarios, 10);

    const id = await Modelo.crear({   // Spread: copia todos los campos del cuerpo y luego sobreescribe rol, id_gimnasio y la contraseña
      ...req.body,
      rol,
      id_gimnasio,
      contrasenia_usuarios: hash
    });
// Rest: separa la contraseña del resto de los campos.
    const { contrasenia_usuarios, ...usuarioPublico } = req.body;

    res.status(201).json({
      id,
      ...usuarioPublico,
      rol,
      id_gimnasio
    });
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }
  // Comprueba que el usuario exista y sea accesible para quien edita.
    const actual = await Modelo.obtenerPorId(req.params.id, req.usuario);

    if (!actual) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    const rol = req.usuario.rol === 'admin'
      ? actual.rol
      : (req.body.rol || actual.rol);

    const id_gimnasio = req.usuario.rol === 'admin'
      ? actual.id_gimnasio
      : (req.body.id_gimnasio ?? actual.id_gimnasio);

    const hash = await bcrypt.hash(req.body.contrasenia_usuarios, 10);

    const filas = await Modelo.actualizar(req.params.id, {
      ...req.body,
      rol,
      id_gimnasio,
      contrasenia_usuarios: hash
    }, req.usuario);
   // filas = filas afectadas. 0 significa que no se modificó/borró nada.
    if (!filas) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    res.json({ mensaje: 'Actualizado correctamente' });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const filas = await Modelo.eliminar(req.params.id, req.usuario);

    if (!filas) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};
