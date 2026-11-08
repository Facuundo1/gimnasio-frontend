const Modelo = require('../models/usuarios.model');
const bcrypt = require('bcryptjs');

const OBLIGATORIOS = ["contrasenia_usuarios","nombre_usuarios","apellido_usuarios","correo_usuarios"];
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
    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }

    const hash = await bcrypt.hash(req.body.contrasenia_usuarios, 10);

    const id = await Modelo.crear({
      ...req.body,
      contrasenia_usuarios: hash
    });

    const { contrasenia_usuarios, ...usuarioPublico } = req.body;

    res.status(201).json({
      id,
      ...usuarioPublico
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

    const hash = await bcrypt.hash(req.body.contrasenia_usuarios, 10);

    const filas = await Modelo.actualizar(req.params.id, {
      ...req.body,
      contrasenia_usuarios: hash
    });

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
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { next(err); }
};
