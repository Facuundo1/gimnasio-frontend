
const Modelo = require('../models/reservas.model');
const Usuario = require('../models/usuarios.model');
const Clases = require('../models/clases.model');

const OBLIGATORIOS = ['id_usuarios', 'id_clase'];

const faltantes = (body) =>
  OBLIGATORIOS.filter((c) => body[c] === undefined || body[c] === '');

const esUsuario = (req) => req.usuario.rol === 'usuario';

const obtenerClaseParaReserva = (idClase, usuario) => {
  // Los usuarios sin gimnasio pueden reservar cualquier clase disponible.
  if (usuario.rol === 'superadmin' ||
      (usuario.rol === 'usuario' && !usuario.id_gimnasio)) {
    return Clases.obtenerPorId(idClase);
  }

  // Los usuarios con gimnasio y administradores
  // solamente pueden acceder a clases de su gimnasio.
  return Clases.obtenerPorIdYGimnasio(
    idClase,
    usuario.id_gimnasio
  );
};
// Obtener reservas
exports.listar = async (req, res, next) => {
  try {
    let reservas;

    if (esUsuario(req)) {
      reservas = await Modelo.obtenerPorUsuario(req.usuario.id);
    } else {
      reservas = await Modelo.obtenerTodos(req.usuario);
    }

    res.json(reservas);
  } catch (err) {
    next(err);
  }
};

// Obtener una reserva
exports.obtener = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    if (
      esUsuario(req) &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para consultar esta reserva'
      });
    }

    if (req.usuario.rol === 'admin') {
      const clase = await Clases.obtenerPorIdYGimnasio(
        reserva.id_clase,
        req.usuario.id_gimnasio
      );

      if (!clase) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
    }

    res.json(reserva);
  } catch (err) {
    next(err);
  }
};

// Crear reserva
exports.crear = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }

    const idUsuario = esUsuario(req)
      ? req.usuario.id
      : req.body.id_usuarios;

    const usuario = await Usuario.obtenerPorId(idUsuario, req.usuario);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe o no pertenece a tu gimnasio'
      });
    }

    const clase = await obtenerClaseParaReserva(
      req.body.id_clase,
      req.usuario
    );

    if (!clase) {
      return res.status(404).json({
        error: 'La clase no existe o no pertenece a tu gimnasio'
      });
    }

    const tieneCupo = await Modelo.tieneCupo(req.body.id_clase);

    if (tieneCupo === null) {
      return res.status(404).json({
        error: 'La clase no existe'
      });
    }

    if (!tieneCupo) {
      return res.status(409).json({
        error: 'La clase no tiene cupos disponibles'
      });
    }

    const existe = await Modelo.existeReservaActiva(
      idUsuario,
      req.body.id_clase
    );

    if (existe) {
      return res.status(409).json({
        error: 'El usuario ya tiene una reserva activa para esta clase'
      });
    }

    const id = await Modelo.crear({
      id_usuarios: idUsuario,
      id_clase: req.body.id_clase
    });

    res.status(201).json({
      id,
      id_usuarios: idUsuario,
      id_clase: req.body.id_clase,
      estado_reserva: 'Activa'
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar reserva
exports.actualizar = async (req, res, next) => {
  try {
    const f = faltantes(req.body);

    if (f.length) {
      return res.status(400).json({
        error: 'Faltan campos: ' + f.join(', ')
      });
    }

    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    if (
      esUsuario(req) &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para modificar esta reserva'
      });
    }

    if (req.usuario.rol === 'admin') {
      const claseActual = await Clases.obtenerPorIdYGimnasio(
        reserva.id_clase,
        req.usuario.id_gimnasio
      );

      if (!claseActual) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
    }

    const idUsuario = esUsuario(req)
      ? req.usuario.id
      : req.body.id_usuarios;

    const usuario = await Usuario.obtenerPorId(idUsuario, req.usuario);

    if (!usuario) {
      return res.status(404).json({
        error: 'El usuario no existe o no pertenece a tu gimnasio'
      });
    }

    const clase = await obtenerClaseParaReserva(
      req.body.id_clase,
      req.usuario
    );

    if (!clase) {
      return res.status(404).json({
        error: 'La clase no existe o no pertenece a tu gimnasio'
      });
    }

    const tieneCupo = await Modelo.tieneCupo(req.body.id_clase);

    if (tieneCupo === null) {
      return res.status(404).json({
        error: 'La clase no existe'
      });
    }

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

    const filas = await Modelo.actualizar(req.params.id, {
      estado_reserva: req.body.estado_reserva || reserva.estado_reserva,
      id_usuarios: idUsuario,
      id_clase: req.body.id_clase
    });

    if (!filas) {
      return res.status(404).json({
        error: 'No se pudo actualizar la reserva'
      });
    }

    res.json({
      mensaje: 'Reserva actualizada correctamente'
    });
  } catch (err) {
    next(err);
  }
};

// Cancelar reserva
exports.cancelar = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    if (
      esUsuario(req) &&
      Number(reserva.id_usuarios) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'No tenés permisos para cancelar esta reserva'
      });
    }

    if (req.usuario.rol === 'admin') {
      const clase = await Clases.obtenerPorIdYGimnasio(
        reserva.id_clase,
        req.usuario.id_gimnasio
      );

      if (!clase) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
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

// Eliminar definitivamente
exports.eliminar = async (req, res, next) => {
  try {
    const reserva = await Modelo.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    if (req.usuario.rol === 'admin') {
      const clase = await Clases.obtenerPorIdYGimnasio(
        reserva.id_clase,
        req.usuario.id_gimnasio
      );

      if (!clase) {
        return res.status(404).json({
          error: 'Reserva no encontrada'
        });
      }
    }

    const filas = await Modelo.eliminar(req.params.id);

    if (!filas) {
      return res.status(404).json({
        error: 'No se pudo eliminar la reserva'
      });
    }

    res.json({
      mensaje: 'Reserva eliminada correctamente'
    });
  } catch (err) {
    next(err);
  }
};
