const Modelo = require('../models/productos.model');
const Gimnasio = require('../models/gimnasio.model');

const OBLIGATORIOS = ["nombre_producto", "precio_producto", "stock", "id_gimnasio"];
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

    if (Number(req.body.precio_producto) < 0 ||
        !Number.isFinite(Number(req.body.precio_producto))) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
    }

    if (!Number.isInteger(Number(req.body.stock)) || Number(req.body.stock) < 0) {
      return res.status(400).json({ error: 'El stock debe ser un entero mayor o igual a cero' });
    }

    const gimnasio = await Gimnasio.obtenerPorId(req.body.id_gimnasio);
    if (!gimnasio) {
      return res.status(404).json({ error: 'El gimnasio no existe' });
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

    if (Number(req.body.precio_producto) < 0 ||
        !Number.isFinite(Number(req.body.precio_producto))) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
    }

    if (!Number.isInteger(Number(req.body.stock)) || Number(req.body.stock) < 0) {
      return res.status(400).json({ error: 'El stock debe ser un entero mayor o igual a cero' });
    }

    const gimnasio = await Gimnasio.obtenerPorId(req.body.id_gimnasio);
    if (!gimnasio) {
      return res.status(404).json({ error: 'El gimnasio no existe' });
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
