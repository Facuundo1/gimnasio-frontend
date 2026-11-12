
const router = require('express').Router();
const c = require('../controllers/usuarios.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.get(
  '/',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.listar
);

router.get(
   // req.params.id: el id del usuario que viene en la URL
  '/:id',
  verificarToken,
   // Solo estos dos roles llegan al controlador; el rol 'usuario' recibe 403.
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
