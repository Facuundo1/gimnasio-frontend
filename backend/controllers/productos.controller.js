const Modelo = require('../models/productos.model');

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

const validar = (b = {}) => {
  const errores = [];
  if (!b.nombre_producto?.toString().trim())
    errores.push('El nombre es obligatorio');
  else if (b.nombre_producto.toString().trim().length > 100)
    errores.push('El nombre es demasiado largo');

  if (b.precio_producto === undefined || b.precio_producto === '' ||
      isNaN(Number(b.precio_producto)) || Number(b.precio_producto) < 0)
    errores.push('El precio debe ser un número mayor o igual a 0');

  if (b.stock === undefined || b.stock === '' ||
      !Number.isInteger(Number(b.stock)) || Number(b.stock) < 0)
    errores.push('El stock debe ser un número entero mayor o igual a 0');

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
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.crear = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });
    const id = await Modelo.crear(req.body);
    res.status(201).json({ id_producto: id, ...req.body });
  } catch (err) { next(err); }
};

exports.actualizar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ error: errores.join('. ') });
    const filas = await Modelo.actualizar(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (err) { next(err); }
};

exports.eliminar = async (req, res, next) => {
  try {
    if (!idValido(req.params.id))
      return res.status(400).json({ error: 'El id no es válido' });
    const filas = await Modelo.eliminar(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) { next(err); }
};