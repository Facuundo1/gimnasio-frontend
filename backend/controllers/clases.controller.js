const Modelo = require('../models/clases.model');
const Gimnasio = require('../models/gimnasio.model');
const Profesor = require('../models/profesores.model');

const OBLIGATORIOS = [
  "nombre_clase",
  "capacidad",
  "fecha_clase",
  "hora_clase",
  "id_gimnasio",
  "profesor_id"
];

const faltantes = (body) =>
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

exports.listar = async (req, res, next) => {
  try {
    const { rol, id_gimnasio } = req.usuario;

    if (rol === 'superadmin') {
      return res.json(await Modelo.obtenerTodos());
    }

    if (!id_gimnasio) {
      return res.status(403).json({
        error: 'No tenés un gimnasio asignado'
      });
    }

    res.json(await Modelo.obtenerPorGimnasio(id_gimnasio));
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const { rol, id_gimnasio } = req.usuario;

    const item = rol === 'superadmin'
      ? await Modelo.obtenerPorId(req.params.id)
      : id_gimnasio
        ? await Modelo.obtenerPorIdYGimnasio(
            req.params.id,
            id_gimnasio
          )
        : null;

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

    // Validar capacidad
    if (
      !Number.isInteger(Number(req.body.capacidad)) ||
      Number(req.body.capacidad) <= 0
    ) {
      return res.status(400).json({
        error: 'La capacidad debe ser un número entero mayor que cero'
      });
    }

    // Verificar si el gimnasio existe
    const gimnasio = await Gimnasio.obtenerPorId(req.body.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    // Verificar si el profesor existe
    const profesor = await Profesor.obtenerPorId(req.body.profesor_id);

    if (!profesor) {
      return res.status(404).json({
        error: 'El profesor no existe'
      });
    }

    const id = await Modelo.crear(req.body);

    res.status(201).json({
      id,
      ...req.body
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

    // Validar capacidad
    if (
      !Number.isInteger(Number(req.body.capacidad)) ||
      Number(req.body.capacidad) <= 0
    ) {
      return res.status(400).json({
        error: 'La capacidad debe ser un número entero mayor que cero'
      });
    }

    // Verificar si el gimnasio existe
    const gimnasio = await Gimnasio.obtenerPorId(req.body.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    // Verificar si el profesor existe
    const profesor = await Profesor.obtenerPorId(req.body.profesor_id);

    if (!profesor) {
      return res.status(404).json({
        error: 'El profesor no existe'
      });
    }

    const filas = await Modelo.actualizar(req.params.id, req.body);

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
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { next(err); }
};
