const Modelo = require('../models/profesores.model');
const Gimnasio = require('../models/gimnasio.model');

const idValido = (id) =>
  Number.isInteger(Number(id)) && Number(id) > 0;

const OBLIGATORIOS = [
  'nombre_profesor',
  'apellido_profesor'
];

const faltantes = (body) =>
  OBLIGATORIOS.filter(
    (c) => body[c] === undefined || body[c] === ''
  );

const prepararDatos = (req) => {
  const datos = { ...req.body };

  if (req.usuario.rol === 'admin') {
    datos.id_gimnasio = req.usuario.id_gimnasio;
  }

  return datos;
};

exports.listar = async (req, res, next) => {
  try {
    const profesores = await Modelo.obtenerTodos(req.usuario);
    res.json(profesores);
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'Id no válido' });
    }

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
    const datos = prepararDatos(req);
    const f = faltantes(datos);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }

    if (!idValido(datos.id_gimnasio)) {
      return res.status(400).json({
        error: 'Debe indicar un gimnasio válido'
      });
    }

    const gimnasio = await Gimnasio.obtenerPorId(datos.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    const id = await Modelo.crear(datos);

    res.status(201).json({
      id_profesor: id,
      ...datos
    });
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'Id no válido' });
    }

    const datos = prepararDatos(req);
    const f = faltantes(datos);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }

    const existente = await Modelo.obtenerPorId(
      req.params.id,
      req.usuario
    );

    if (!existente) {
      return res.status(404).json({
        error: 'Profesor no encontrado'
      });
    }

    if (!idValido(datos.id_gimnasio)) {
      return res.status(400).json({
        error: 'Debe indicar un gimnasio válido'
      });
    }

    const gimnasio = await Gimnasio.obtenerPorId(datos.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    const filas = await Modelo.actualizar(
      req.params.id,
      datos,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'No se pudo actualizar el profesor'
      });
    }

    res.json({
      mensaje: 'Profesor actualizado correctamente'
    });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ error: 'Id no válido' });
    }

    const filas = await Modelo.eliminar(
      req.params.id,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'Profesor no encontrado'
      });
    }

    res.json({
      mensaje: 'Profesor eliminado correctamente'
    });
  } catch (err) {
    next(err);
  }
};