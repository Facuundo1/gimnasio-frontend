const Modelo = require('../models/clases.model');

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
    res.json(await Modelo.obtenerTodos());
  } catch (err) { next(err); }
};

exports.obtener = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const item = await Modelo.obtenerPorId(req.params.id);
    if (!item) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.crear = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });
    const id = await Modelo.crear(req.body);
    res.status(201).json({ id_clase: id, ...req.body });
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });
    const filas = await Modelo.actualizar(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json({ mensaje: 'Clase actualizada correctamente' });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json({ mensaje: 'Clase eliminada correctamente' });
  } catch (err) { next(err); }
};