
const router = require('express').Router();
const c = require('../controllers/clases.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.get(
  '/',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.listar
);

router.get(
  '/:id',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.obtener
);

router.post(
  '/',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.crear
);

router.put(
  '/:id',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.actualizar
);

router.delete(
  '/:id',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.eliminar
);

module.exports = router;
