
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth.model');

// Nombres de columna centralizados: si cambian en la base, se corrigen solo acá.
const COL_ID = 'id_usuarios';
const COL_ROL = 'rol';
// Regex: algo@algo.algo, sin espacios. ^ inicio, $ fin, [^\s@]+ = uno o más caracteres que no sean espacio ni @.
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Si la columna rol viene vacía, se asume 'usuario' (el rol con menos permisos).
const rolDe = (u) => u[COL_ROL] || 'usuario';

const firmarToken = (u) =>
   // Firma el token con el secreto del servidor: nadie puede falsificarlo sin conocer JWT_SECRET
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
// Se elige explícitamente qué campos salen: la contraseña nunca viaja al cliente.
const publico = (u) => ({
  id: u[COL_ID],
  nombre: u.nombre_usuarios,
  apellido: u.apellido_usuarios,
  correo: u.correo_usuarios,
  rol: rolDe(u),
});

exports.registro = async (req, res, next) => {
  try {     // Desestructuración: saca cuatro propiedades del cuerpo de la petición.
    const { nombre, apellido, correo, password } = req.body;
// ?. evita error si el campo no vino; trim() quita espacios. Un texto de solo espacios cuenta como vacío.
    if (!nombre?.trim() || !apellido?.trim() || !correo?.trim() || !password) {
      return res.status(400).json({ error: 'Completá todos los campos' });
    }
   // RegExp.test devuelve true si el texto cumple el patrón
    if (!EMAIL_VALIDO.test(correo)) {
      return res.status(400).json({ error: 'El correo no es válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }
  // Busca si ya hay una cuenta con ese correo.
    const existente = await Auth.buscarPorCorreo(correo);

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe una cuenta con ese correo',
      });
    }
  // Hash irreversible. 10 = costo del algoritmo (a mayor número, más lento y más seguro)
    const hash = await bcrypt.hash(password, 10);

    await Auth.crear({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      hash,
      id_gimnasio: 1,
    });

    const usuario = await Auth.buscarPorCorreo(correo.trim().toLowerCase());
  // 201 Created: se creó un recurso nuevo.
    res.status(201).json({
      token: firmarToken(usuario),
      usuario: publico(usuario),
    });
  } catch (err) {
     // Código de error de MySQL para una clave única duplicada
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Ya existe una cuenta con ese correo',
      });
    }

    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {  // Mismo patrón: se leen las credenciales del cuerpo de la petición.
    const { correo, password } = req.body;

    if (!correo?.trim() || !password) {
      return res.status(400).json({
        error: 'Ingresá correo y contraseña',
      });
    }

    const usuario = await Auth.buscarPorCorreo(correo.trim().toLowerCase());

    const ok =
      usuario &&  // Compara la contraseña en texto plano con el hash guardado; devuelve true/false.
      (await bcrypt.compare(password, usuario.contrasenia_usuarios));

    if (!ok) {   // 401 = credenciales inválidas. Mensaje genérico a propósito
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
// req.usuario lo completó verificarToken al validar el JWT.
exports.perfil = (req, res) => res.json(req.usuario);
