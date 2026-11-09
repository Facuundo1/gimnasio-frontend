
const Modelo = require('../models/productos.model');
const Gimnasio = require('../models/gimnasio.model');

const OBLIGATORIOS = [
  "nombre_producto",
  "precio_producto",
  "stock"
];

const faltantes = (body) =>
  OBLIGATORIOS.filter(
    (c) => body[c] === undefined || body[c] === ''
  );

const validarProducto = (body) => {
  if (!body.nombre_producto || !body.nombre_producto.trim()) {
    return 'El nombre del producto es obligatorio';
  }

  if (
    Number(body.precio_producto) < 0 ||
    !Number.isFinite(Number(body.precio_producto))
  ) {
    return 'El precio debe ser un número mayor o igual a cero';
  }

  if (
    !Number.isInteger(Number(body.stock)) ||
    Number(body.stock) < 0
  ) {
    return 'El stock debe ser un entero mayor o igual a cero';
  }

  return null;
};

const obtenerGimnasio = async (req) => {
  if (req.usuario.rol === 'admin') {
    return req.usuario.id_gimnasio;
  }

  return req.body.id_gimnasio;
};

exports.listar = async (req, res, next) => {
  try {
    const productos = await Modelo.obtenerTodos(req.usuario);
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const item = await Modelo.obtenerPorId(
      req.params.id,
      req.usuario
    );

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

    const error = validarProducto(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const id_gimnasio = await obtenerGimnasio(req);

    if (!id_gimnasio) {
      return res.status(400).json({
        error: 'No hay un gimnasio asignado'
      });
    }

    const gimnasio = await Gimnasio.obtenerPorId(id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    const datos = {
      ...req.body,
      id_gimnasio
    };

    const id = await Modelo.crear(datos);

    res.status(201).json({
      id,
      ...datos
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

    const error = validarProducto(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    // Comprueba que el producto pertenezca al gimnasio del administrador.
    const existente = await Modelo.obtenerPorId(
      req.params.id,
      req.usuario
    );

    if (!existente) {
      return res.status(404).json({
        error: 'No encontrado'
      });
    }

    const id_gimnasio = await obtenerGimnasio(req);

    if (!id_gimnasio) {
      return res.status(400).json({
        error: 'No hay un gimnasio asignado'
      });
    }

    const gimnasio = await Gimnasio.obtenerPorId(id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    const datos = {
      ...req.body,
      id_gimnasio
    };

    const filas = await Modelo.actualizar(
      req.params.id,
      datos,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'No encontrado'
      });
    }

    res.json({
      mensaje: 'Actualizado correctamente'
    });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const filas = await Modelo.eliminar(
      req.params.id,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'No encontrado'
      });
    }

    res.json({
      mensaje: 'Eliminado correctamente'
    });
  } catch (err) {
    next(err);
  }
};
