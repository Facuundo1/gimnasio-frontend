const Modelo = require('../models/clases.model');

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const MSG_GIM = 'Tu usuario no tiene un gimnasio asignado';
const sinGimnasio = (u) => u.rol !== 'superadmin' && !u.id_gimnasio;

const validar = (b = {}) => {
  const errores = [];
  const nombre = b.nombre_clase?.toString().trim();

   if (!nombre) errores.push('El nombre es obligatorio');
  else if (nombre.length > 50) errores.push('El nombre no puede superar los 50 caracteres');
  
  if (!Number.isInteger(Number(b.capacidad)) || Number(b.capacidad) < 1 || Number(b.capacidad) > 500)
    errores.push('La capacidad debe ser un entero entre 1 y 500');

  if (!FECHA.test(b.fecha_clase || '') || isNaN(Date.parse(b.fecha_clase)))
    errores.push('La fecha debe tener formato AAAA-MM-DD');

  if (!HORA.test(b.hora_clase || ''))
    errores.push('La hora debe tener formato HH:MM');

  const p = b.profesor_id;
  if (p !== undefined && p !== null && p !== '' && !idValido(p))
    errores.push('El profesor no es válido');

  return errores;
};

// Si viene profesor, tiene que existir y ser del mismo gimnasio
const profesorOk = async (profesorId, idGimnasio) => {
  if (profesorId === undefined || profesorId === null || profesorId === '') return true;
  return Modelo.profesorDelGimnasio(profesorId, idGimnasio);
};

exports.listar = async (req, res, next) => {
  try {
    if (sinGimnasio(req.usuario)) return res.status(400).json({ error: MSG_GIM });
    res.json(await Modelo.obtenerTodos(req.usuario));
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    if (sinGimnasio(req.usuario)) return res.status(400).json({ error: MSG_GIM });
    const item = await Modelo.obtenerPorId(req.params.id, req.usuario);
    if (!item) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.crear = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });

    // El gimnasio sale del token. Solo el superadmin puede elegir otro.
    let id_gimnasio = req.usuario.id_gimnasio;
    if (req.usuario.rol === 'superadmin' && idValido(req.body.id_gimnasio))
      id_gimnasio = Number(req.body.id_gimnasio);
    if (!id_gimnasio) return res.status(400).json({ error: MSG_GIM });

    if (!(await profesorOk(req.body.profesor_id, id_gimnasio)))
      return res.status(400).json({ error: 'El profesor no existe en este gimnasio' });

    const datos = { ...req.body, nombre_clase: req.body.nombre_clase.trim(), id_gimnasio };
    const id = await Modelo.crear(datos);
    res.status(201).json({ id_clase: id, ...datos });
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    if (sinGimnasio(req.usuario)) return res.status(400).json({ error: MSG_GIM });
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });

    // Para admin se valida contra su gimnasio; el superadmin queda libre
    if (req.usuario.rol !== 'superadmin' &&
        !(await profesorOk(req.body.profesor_id, req.usuario.id_gimnasio)))
      return res.status(400).json({ error: 'El profesor no existe en este gimnasio' });

    const datos = { ...req.body, nombre_clase: req.body.nombre_clase.trim() };
    const filas = await Modelo.actualizar(req.params.id, datos, req.usuario);
    if (!filas) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json({ mensaje: 'Clase actualizada correctamente' });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    if (sinGimnasio(req.usuario)) return res.status(400).json({ error: MSG_GIM });
    const filas = await Modelo.eliminar(req.params.id, req.usuario);
    if (!filas) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json({ mensaje: 'Clase eliminada correctamente' });
  } catch (err) { next(err); }
};