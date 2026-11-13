const bcrypt = require('bcryptjs');
const Modelo = require('../models/usuarios.model');

const ROLES = ['usuario', 'admin', 'superadmin'];
const PASS_INICIAL = '123456';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const texto = (v) => (v === undefined || v === null ? '' : String(v).trim());
const esSuper = (u) => u.rol === 'superadmin';
const mismoGim = (a, b) => Number(a) === Number(b);

// Acepta los nombres de campo de Members y los de la base
const leer = (b = {}) => ({
  nombre: texto(b.nombre_usuarios ?? b.nombre),
  apellido: texto(b.apellido_usuarios ?? b.apellido),
  correo: texto(b.correo_usuarios ?? b.correo ?? b.email).toLowerCase(),
  telefono: texto(b.telefono ?? b.telefono_usuarios).slice(0, 20),
  pass: String(b.contrasenia_usuarios ?? b.password ?? b.contrasenia ?? ''),
  rol: texto(b.rol),
  gimnasio: b.id_gimnasio,
});

// Rol y gimnasio se leen de la BASE, no del token: nunca quedan desactualizados
const actorActual = (req) => Modelo.buscarPorIdGestion(req.usuario.id);

// Devuelve el actor o responde el error y devuelve null
const validarActor = async (req, res) => {
  const actor = await actorActual(req);
  if (!actor) {
    res.status(401).json({ error: 'Sesión inválida, volvé a iniciar sesión' });
    return null;
  }
  if (actor.rol !== 'admin' && actor.rol !== 'superadmin') {
    res.status(403).json({ error: 'No tenés permisos' });
    return null;
  }
  if (!esSuper(actor) && !actor.id_gimnasio) {
    res.status(400).json({ error: 'Tu usuario no tiene un gimnasio asignado' });
    return null;
  }
  return actor;
};

// 200 = puede; 404 = no existe o es de otro gimnasio; 403 = no es un socio
const acceso = (actor, target) => {
  if (!target) return 404;
  if (esSuper(actor)) return 200;
  if (!mismoGim(target.id_gimnasio, actor.id_gimnasio) || target.rol === 'superadmin') return 404;
  if (target.rol !== 'usuario') return 403;
  return 200;
};

const errorAcceso = (res, codigo) =>
  codigo === 403
    ? res.status(403).json({ error: 'No tenés permisos sobre este usuario' })
    : res.status(404).json({ error: 'Usuario no encontrado' });

exports.listar = async (req, res, next) => {
  try {
    const actor = await validarActor(req, res);
    if (!actor) return;
    res.json(await Modelo.listarGestion(actor));
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const actor = await validarActor(req, res);
    if (!actor) return;
    const target = await Modelo.buscarPorIdGestion(req.params.id);
    const ok = target && (esSuper(actor) ||
      (mismoGim(target.id_gimnasio, actor.id_gimnasio) && target.rol !== 'superadmin'));
    if (!ok) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(target);
  } catch (err) { next(err); }
};

exports.crear = async (req, res, next) => {
  try {
    const actor = await validarActor(req, res);
    if (!actor) return;
    const d = leer(req.body);

    const errores = [];
    if (!d.nombre) errores.push('El nombre es obligatorio');
    if (!d.apellido) errores.push('El apellido es obligatorio');
    if (!d.correo) errores.push('El correo es obligatorio');
    else if (!EMAIL.test(d.correo)) errores.push('El correo no es válido');
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });

    // Admin: siempre socio y de su gimnasio. Superadmin: elige.
    let rol = 'usuario';
    let id_gimnasio = actor.id_gimnasio;
    if (esSuper(actor)) {
      if (ROLES.includes(d.rol)) rol = d.rol;
      if (idValido(d.gimnasio)) id_gimnasio = Number(d.gimnasio);
    }
    if (!id_gimnasio)
      return res.status(400).json({ error: 'Elegí un gimnasio para el usuario' });

    if (await Modelo.correoEnUso(d.correo))
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });

    // Sin contraseña en el formulario: queda la inicial y el socio la cambia
    const hash = await bcrypt.hash(d.pass || PASS_INICIAL, 10);

    const id = await Modelo.crearUsuario({
      nombre_usuarios: d.nombre,
      apellido_usuarios: d.apellido,
      correo_usuarios: d.correo,
      hash,
      telefono: d.telefono || null,
      rol,
      id_gimnasio,
    });
    const usuario = await Modelo.buscarPorIdGestion(id);
    // "id" además de "id_usuarios", por si el formulario usa el id para crear el plan
    res.status(201).json({ id, ...usuario });
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const actor = await validarActor(req, res);
    if (!actor) return;

    const target = await Modelo.buscarPorIdGestion(req.params.id);
    const codigo = acceso(actor, target);
    if (codigo !== 200) return errorAcceso(res, codigo);

    const d = leer(req.body);
    // Lo que no venga en el formulario se conserva
    const nombre = d.nombre || target.nombre_usuarios;
    const apellido = d.apellido || target.apellido_usuarios;
    const correo = d.correo || target.correo_usuarios;
    const telefono = req.body.telefono === undefined && req.body.telefono_usuarios === undefined
      ? target.telefono
      : d.telefono || null;

    if (!EMAIL.test(correo)) return res.status(400).json({ error: 'El correo no es válido' });

    let rol = target.rol;
    let id_gimnasio = target.id_gimnasio;
    if (esSuper(actor)) {
      if (ROLES.includes(d.rol)) rol = d.rol;
      if (idValido(d.gimnasio)) id_gimnasio = Number(d.gimnasio);
    }
    if (Number(target.id_usuarios) === Number(actor.id_usuarios) && rol !== target.rol)
      return res.status(400).json({ error: 'No podés cambiar tu propio rol' });

    if (await Modelo.correoEnUso(correo, target.id_usuarios))
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });

    await Modelo.actualizarUsuario(target.id_usuarios, {
      nombre_usuarios: nombre,
      apellido_usuarios: apellido,
      correo_usuarios: correo,
      telefono,
      rol,
      id_gimnasio,
      hash: d.pass ? await bcrypt.hash(d.pass, 10) : null, // vacía = no se cambia
    });
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const actor = await validarActor(req, res);
    if (!actor) return;
    if (Number(req.params.id) === Number(actor.id_usuarios))
      return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' });

    const target = await Modelo.buscarPorIdGestion(req.params.id);
    const codigo = acceso(actor, target);
    if (codigo !== 200) return errorAcceso(res, codigo);

    await Modelo.eliminarConDependencias(target.id_usuarios);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) { next(err); }
};