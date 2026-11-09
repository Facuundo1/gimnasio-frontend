const router = require('express').Router();
const c = require('../controllers/productos.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

// Todos los roles pueden consultar productos.
router.get('/', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.listar);
router.get('/:id', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.obtener);

// Solo administradores y superadministradores pueden gestionar productos.
router.post('/', verificarToken, permitirRoles('admin', 'superadmin'), c.crear);
router.put('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.eliminar);

module.exports = router;