const router = require('express').Router();
const c = require('../controllers/profesores.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.use(verificarToken);

router.get(
  '/',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.listar
);

router.get(
  '/:id',
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.obtener
);

router.post(
  '/',
  permitirRoles('admin', 'superadmin'),
  c.crear
);

router.put(
  '/:id',
  permitirRoles('admin', 'superadmin'),
  c.actualizar
);

router.delete(
  '/:id',
  permitirRoles('admin', 'superadmin'),
  c.eliminar
);

module.exports = router;