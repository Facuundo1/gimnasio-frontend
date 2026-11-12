const jwt = require('jsonwebtoken');
// req.headers: encabezados HTTP. Aquí esperamos  Authorization: Bearer <token>.
exports.verificarToken = (req, res, next) => {
   // Toma el texto después del espacio: 'Bearer abc123'.split(' ')[1] === 'abc123'
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try { // Si la firma es válida, el payload del token ({id, rol, id_gimnasio}) queda en req.usuario
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next(); // Continúa con el siguiente middleware o con el controlador
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
};
// Función que devuelve otra función: así cada ruta puede indicar sus propios roles permitidos
exports.permitirRoles = (...roles) => (req, res, next) => {
   // 403 = autenticado pero sin permiso para este recurso.
  if (!roles.includes(req.usuario.rol))
    return res.status(403).json({ error: 'No tenés permisos' });
  next();
};