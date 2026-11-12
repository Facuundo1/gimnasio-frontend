
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth.model');

const COL_ID = 'id_usuarios';
const COL_ROL = 'rol';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rolDe = (u) => u[COL_ROL] || 'usuario';

const firmarToken = (u) =>
  jwt.sign(
    {
      id: u[COL_ID],
      rol: rolDe(u),
      id_gimnasio: u.id_gimnasio ?? null
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

// Nunca se devuelve la contraseña
const publico = (u) => ({
  id: u[COL_ID],
  nombre: u.nombre_usuarios,
  apellido: u.apellido_usuarios,
  correo: u.correo_usuarios,
  rol: rolDe(u),
});

exports.registro = async (req, res, next) => {
  try {
    const { nombre, apellido, correo, password } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !correo?.trim() || !password) {
      return res.status(400).json({ error: 'Completá todos los campos' });
    }

    if (!EMAIL_VALIDO.test(correo)) {
      return res.status(400).json({ error: 'El correo no es válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const existente = await Auth.buscarPorCorreo(correo);

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe una cuenta con ese correo',
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await Auth.crear({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      hash,
      id_gimnasio: 1,
    });

    const usuario = await Auth.buscarPorCorreo(correo.trim().toLowerCase());

    res.status(201).json({
      token: firmarToken(usuario),
      usuario: publico(usuario),
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Ya existe una cuenta con ese correo',
      });
    }

    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo?.trim() || !password) {
      return res.status(400).json({
        error: 'Ingresá correo y contraseña',
      });
    }

    const usuario = await Auth.buscarPorCorreo(correo.trim().toLowerCase());

    const ok =
      usuario &&
      (await bcrypt.compare(password, usuario.contrasenia_usuarios));

    if (!ok) {
      return res.status(401).json({
        error: 'Correo o contraseña incorrectos',
      });
    }

    res.json({
      token: firmarToken(usuario),
      usuario: publico(usuario),
    });
  } catch (err) {
    next(err);
  }
};

exports.perfil = (req, res) => res.json(req.usuario);
