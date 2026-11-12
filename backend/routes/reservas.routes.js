const router = require('express').Router();
const c = require('../controllers/reservas.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.use(verificarToken);

// Consultar reservas
router.get(
  '/',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.listar
);

// Consultar una reserva
router.get(
  '/:id',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.obtener
);

// Crear reserva
router.post(
  '/',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.crear
);

// Actualizar reserva
router.put(
  '/:id',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.actualizar
);

// Cancelar reserva
router.patch(
  '/:id/cancelar',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.cancelar
);

// Eliminar definitivamente
router.delete(
  '/:id',
  permitirRoles('admin', 'superadmin'),
  c.eliminar
);

module.exports = router;