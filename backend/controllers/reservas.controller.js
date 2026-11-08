const Modelo = require('../models/reservas.model');
const Usuario = require('../models/usuarios.model');

// Campos obligatorios para crear o actualizar una reserva
const OBLIGATORIOS = ["id_usuarios", "id_clase"];

// Verifica que estén presentes los campos obligatorios
const faltantes = (body) =>
  OBLIGATORIOS.filter(
    (campo) => body[campo] === undefined || body[campo] === ''
  );

// Obtener todas las reservas
exports.listar = async (req, res, next) => {
  try {
    const reservas = await Modelo.obtenerTodos();
    res.json(reservas);
  } catch (err) {
    next(err);
  }
};

// Obtener una reserva por su ID
exports.obtener = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(reserva);
  } catch (err) {
    next(err);
  }
};

// Crear una reserva
exports.crear = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    // 1. Validar campos obligatorios
    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }
    // Verificar si el usuario existe
    const usuario = await Usuario.obtenerPorId(req.body.id_usuarios);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe'
      });
    }

    // 2. Verificar si la clase tiene cupos disponibles
    const tieneCupo = await Modelo.tieneCupo(req.body.id_clase);

    // Verificar si la clase existe
    if (tieneCupo === null) {
      return res.status(404).json({
        error: 'La clase no existe'
      });
    }

    // Verificar si hay cupos disponibles
    if (!tieneCupo) {
      return res.status(409).json({
        error: 'La clase no tiene cupos disponibles'
      });
    }

    // 3. Verificar si el usuario ya tiene una reserva activa
    const existe = await Modelo.existeReservaActiva(
      req.body.id_usuarios,
      req.body.id_clase
    );

    if (existe) {
      return res.status(409).json({
        error: 'El usuario ya tiene una reserva activa para esta clase'
      });
    }

    // 4. Crear la reserva
    const id = await Modelo.crear(req.body);

    res.status(201).json({
      id,
      ...req.body,
      estado_reserva: 'Activa'
    });

  } catch (err) {
    next(err);
  }
};

// Actualizar una reserva
exports.actualizar = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    // 1. Validar campos obligatorios
    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }
    // Verificar si el usuario existe
    const usuario = await Usuario.obtenerPorId(req.body.id_usuarios);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe'
      });
    }
    // 2. Verificar si la reserva existe
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // 3. Verificar si la clase existe y tiene cupos
    const tieneCupo = await Modelo.tieneCupo(req.body.id_clase);

    if (tieneCupo === null) {
      return res.status(404).json({
        error: 'La clase no existe'
      });
    }

    // Si cambia de clase, verificar disponibilidad
    if (
      Number(req.body.id_clase) !== Number(reserva.id_clase) &&
      !tieneCupo
    ) {
      return res.status(409).json({
        error: 'La clase no tiene cupos disponibles'
      });
    }

    // 4. Evitar reservas activas duplicadas
    const existe = await Modelo.existeOtraReservaActiva(
      req.body.id_usuarios,
      req.body.id_clase,
      req.params.id
    );

    if (existe) {
      return res.status(409).json({
        error: 'El usuario ya tiene una reserva activa para esta clase'
      });
    }

    // 5. Actualizar la reserva
    const filas = await Modelo.actualizar(req.params.id, req.body);

    res.json({
      mensaje: 'Reserva actualizada correctamente'
    });

  } catch (err) {
    next(err);
  }
};

// Cancelar una reserva
exports.cancelar = async (req, res, next) => {
  try {
    const filas = await Modelo.cancelar(req.params.id);

    if (!filas) {
      return res.status(404).json({
        error: 'Reserva no encontrada o ya cancelada'
      });
    }

    res.json({ mensaje: 'Reserva cancelada correctamente' });
  } catch (err) {
    next(err);
  }
};

// Eliminar una reserva definitivamente
exports.eliminar = async (req, res, next) => {
  try {
    const filas = await Modelo.eliminar(req.params.id);

    if (!filas) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};