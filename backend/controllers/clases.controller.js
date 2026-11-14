const Modelo = require('../models/clases.model');
const Gimnasio = require('../models/gimnasio.model');
const Profesor = require('../models/profesores.model');

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const validar = (b = {}) => {
  const errores = [];
  if (!b.nombre_clase?.toString().trim())
    errores.push('El nombre es obligatorio');
  else if (b.nombre_clase.toString().trim().length > 100)
    errores.push('El nombre es demasiado largo');

  if (b.capacidad === undefined || b.capacidad === '' ||
      !Number.isInteger(Number(b.capacidad)) || Number(b.capacidad) < 1)
    errores.push('La capacidad debe ser un número entero mayor a 0');

  if (!idValido(b.profesor_id))
    errores.push('Debe seleccionar un profesor válido');

  if (!FECHA.test(b.fecha_clase || '') || isNaN(Date.parse(b.fecha_clase)))
    errores.push('La fecha debe tener formato AAAA-MM-DD');

  if (!HORA.test(b.hora_clase || ''))
    errores.push('La hora debe tener formato HH:MM');

  if (b.id_gimnasio !== undefined && b.id_gimnasio !== null && b.id_gimnasio !== '' &&
      !idValido(b.id_gimnasio))
    errores.push('El gimnasio no es válido');
  return errores;
};

exports.listar = async (req, res, next) => {
  try {
    const { rol, id_gimnasio } = req.usuario;

    // Superadmin y usuarios sin gimnasio ven todas las clases.
    if (rol === 'superadmin' || (rol === 'usuario' && !id_gimnasio)) {
      return res.json(await Modelo.obtenerTodos());
    }

    // Los usuarios y administradores con gimnasio
    // solamente ven las clases de su gimnasio.
    if (!id_gimnasio) {
      return res.status(403).json({
        error: 'El administrador no tiene un gimnasio asignado'
      });
    }

    res.json(await Modelo.obtenerPorGimnasio(id_gimnasio));
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        error: 'El id no es válido'
      });
    }

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
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    res.json(item);

  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const datos = { ...req.body };

    // El admin siempre utiliza su gimnasio del token.
    if (req.usuario.rol === 'admin') {
      if (!req.usuario.id_gimnasio) {
        return res.status(400).json({
          error: 'El administrador no tiene un gimnasio asignado'
        });
      }

      datos.id_gimnasio = req.usuario.id_gimnasio;
    }

    const errores = validar(datos);

    if (errores.length) {
      return res.status(400).json({
        error: errores.join('. ')
      });
    }

    // Verificar que el gimnasio exista.
    const gimnasio = await Gimnasio.obtenerPorId(datos.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    // Verificar que el profesor pertenezca al gimnasio.
    const profesor = req.usuario.rol === 'superadmin'
      ? await Profesor.obtenerPorId(datos.profesor_id)
      : await Profesor.obtenerPorIdYGimnasio(
          datos.profesor_id,
          datos.id_gimnasio
        );

    if (!profesor) {
      return res.status(404).json({
        error: 'El profesor no existe o no pertenece a tu gimnasio'
      });
    }

    const id = await Modelo.crear(datos);

    res.status(201).json({
      id_clase: id,
      ...datos
    });

  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        error: 'El id no es válido'
      });
    }

    const datos = { ...req.body };

    if (req.usuario.rol === 'admin') {
      if (!req.usuario.id_gimnasio) {
        return res.status(400).json({
          error: 'El administrador no tiene un gimnasio asignado'
        });
      }

      datos.id_gimnasio = req.usuario.id_gimnasio;
    }

    const errores = validar(datos);

    if (errores.length) {
      return res.status(400).json({
        error: errores.join('. ')
      });
    }

    // Comprobar que la clase exista y pertenezca al gimnasio.
    const claseActual = req.usuario.rol === 'superadmin'
      ? await Modelo.obtenerPorId(req.params.id)
      : await Modelo.obtenerPorIdYGimnasio(
          req.params.id,
          req.usuario.id_gimnasio
        );

    if (!claseActual) {
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    // Comprobar que el gimnasio exista.
    const gimnasio = await Gimnasio.obtenerPorId(datos.id_gimnasio);

    if (!gimnasio) {
      return res.status(404).json({
        error: 'El gimnasio no existe'
      });
    }

    // Comprobar que el profesor pertenezca al gimnasio.
    const profesor = req.usuario.rol === 'superadmin'
      ? await Profesor.obtenerPorId(datos.profesor_id)
      : await Profesor.obtenerPorIdYGimnasio(
          datos.profesor_id,
          datos.id_gimnasio
        );

    if (!profesor) {
      return res.status(404).json({
        error: 'El profesor no existe o no pertenece a tu gimnasio'
      });
    }

    const filas = await Modelo.actualizar(
      req.params.id,
      datos,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'No se pudo actualizar la clase'
      });
    }

    res.json({
      mensaje: 'Clase actualizada correctamente'
    });

  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        error: 'El id no es válido'
      });
    }

    const filas = await Modelo.eliminar(
      req.params.id,
      req.usuario
    );

    if (!filas) {
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    res.json({
      mensaje: 'Clase eliminada correctamente'
    });

  } catch (err) {
    next(err);
  }
};