const Modelo = require('../models/membresias.model');
const Usuario = require('../models/usuarios.model');

const OBLIGATORIOS = ["tipo_membresia","id_usuarios"];
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

    const usuario = await Usuario.obtenerPorId(req.body.id_usuarios);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe'
      });
    }

    if (
      req.body.precio_membresia !== undefined &&
      (!Number.isFinite(Number(req.body.precio_membresia)) ||
        Number(req.body.precio_membresia) < 0)
    ) {
      return res.status(400).json({
        error: 'El precio debe ser un número mayor o igual a cero'
      });
    }

    if (
      req.body.fecha_inscripcion &&
      req.body.fecha_vencimiento &&
      new Date(req.body.fecha_vencimiento) < new Date(req.body.fecha_inscripcion)
    ) {
      return res.status(400).json({
        error: 'La fecha de vencimiento no puede ser anterior a la inscripción'
      });
    }

    const id = await Modelo.crear(req.body);

    res.status(201).json({ id, ...req.body });
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

    const usuario = await Usuario.obtenerPorId(req.body.id_usuarios);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe'
      });
    }

    if (
      req.body.precio_membresia !== undefined &&
      (!Number.isFinite(Number(req.body.precio_membresia)) ||
        Number(req.body.precio_membresia) < 0)
    ) {
      return res.status(400).json({
        error: 'El precio debe ser un número mayor o igual a cero'
      });
    }

    if (
      req.body.fecha_inscripcion &&
      req.body.fecha_vencimiento &&
      new Date(req.body.fecha_vencimiento) < new Date(req.body.fecha_inscripcion)
    ) {
      return res.status(400).json({
        error: 'La fecha de vencimiento no puede ser anterior a la inscripción'
      });
    }

    const filas = await Modelo.actualizar(req.params.id, req.body);

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
