const Modelo = require('../models/reservas.model');
const Usuario = require('../models/usuarios.model');

const OBLIGATORIOS = ["id_usuarios","id_clase"];
const faltantes = (body) =>
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

// Obtener reservas
exports.listar = async (req, res, next) => {
  try {
    let reservas;

    if (req.usuario.rol === 'usuario') {
      reservas = await Modelo.obtenerPorUsuario(req.usuario.id);
    } else {
      reservas = await Modelo.obtenerTodos();
    }

    res.json(reservas);
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // El usuario solo puede consultar su propia reserva
    if (
      req.usuario.rol === 'usuario' &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para consultar esta reserva'
      });
    }

    res.json(reserva);

  } catch (err) {
    next(err);
  }
};

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
     // 409 Conflict: la petición es válida pero choca con el estado actual (clase llena)
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
    res.status(201).json({ id, ...req.body });
  } catch (err) { next(err); }
};

// Actualizar una reserva
exports.actualizar = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    // Validar campos obligatorios
    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }
    // Verificar si el usuario existe
    const idUsuario = req.usuario.rol === 'usuario'
      ? req.usuario.id
      : req.body.id_usuarios;

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe'
      });
    }
    // Verificar si la reserva existe
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // El usuario solo puede modificar su propia reserva
    if (
      req.usuario.rol === 'usuario' &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para modificar esta reserva'
      });
    }

    // Verificar si la clase existe y tiene cupos
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

    const existe = await Modelo.existeOtraReservaActiva(
      idUsuario,
      req.body.id_clase,
      req.params.id
    );

    if (existe) {
      return res.status(409).json({
        error: 'El usuario ya tiene una reserva activa para esta clase'
      });
    }

    // Actualizar la reserva
    const filas = await Modelo.actualizar(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Actualizado correctamente' });
  } catch (err) { next(err); }
};

// Cancelar una reserva
exports.cancelar = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    // El usuario solo puede cancelar su propia reserva
    if (
      req.usuario.rol === 'usuario' &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para cancelar esta reserva'
      });
    }

    const filas = await Modelo.cancelar(req.params.id);

    if (!filas) {
      return res.status(404).json({
        error: 'Reserva no encontrada o ya cancelada'
      });
    }

    res.json({
      mensaje: 'Reserva cancelada correctamente'
    });

  } catch (err) {
    next(err);
  }
};

// Eliminar una reserva definitivamente
exports.eliminar = async (req, res, next) => {
  try {
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Eliminado correctamente' });
  } catch (err) { next(err); }
};
exports.obtenerPorUsuario = async (idUsuario) => {
  const [filas] = await db.query(
    'SELECT * FROM reservas WHERE id_usuarios = ?',
    [idUsuario]
  );
  return filas;
};