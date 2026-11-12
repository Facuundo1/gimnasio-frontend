
const Modelo = require('../models/usuarios.model');
const bcrypt = require('bcryptjs');

const OBLIGATORIOS = [
  'contrasenia_usuarios',
  'nombre_usuarios',
  'apellido_usuarios',
  'correo_usuarios'
];

const faltantes = (body) =>
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

exports.listar = async (req, res, next) => {
  try {
    res.json(await Modelo.obtenerTodos(req.usuario));
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    // El usuario normal solamente puede consultar su propio perfil.
    if (
      req.usuario.rol === 'usuario' &&
      Number(req.params.id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({ error: 'No tenés permiso para consultar este usuario' });
    }

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

    const rol = req.usuario.rol === 'admin'
      ? 'usuario'
      : (req.body.rol || 'usuario');

    const id_gimnasio = req.usuario.rol === 'admin'
      ? req.usuario.id_gimnasio
      : (req.body.id_gimnasio || null);

    const hash = await bcrypt.hash(req.body.contrasenia_usuarios, 10);

    const id = await Modelo.crear({
      ...req.body,
      rol,
      id_gimnasio,
      contrasenia_usuarios: hash
    });

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
    const obligatoriosActualizar = [
      'nombre_usuarios',
      'apellido_usuarios',
      'correo_usuarios'
    ];

    const faltantesActualizar = obligatoriosActualizar.filter(
      (c) => req.body[c] === undefined || req.body[c] === ''
    );

    if (faltantesActualizar.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + faltantesActualizar.join(', ')
      });
    }

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

    const datos = {
      ...req.body,
      rol,
      id_gimnasio
    };

    if (req.body.contrasenia_usuarios) {
      datos.contrasenia_usuarios = await bcrypt.hash(
        req.body.contrasenia_usuarios,
        10
      );
    }

    const filas = await Modelo.actualizar(
      req.params.id,
      datos,
      req.usuario
    );

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
