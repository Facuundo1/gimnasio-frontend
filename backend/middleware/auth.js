const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
};

exports.permitirRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol))
    return res.status(403).json({ error: 'No tenés permisos' });
  next();
};