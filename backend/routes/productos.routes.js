const router = require('express').Router();
const c = require('../controllers/productos.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.get('/', verificarToken, c.listar);
router.get('/:id', verificarToken, c.obtener);
router.post('/', verificarToken, permitirRoles('admin', 'superadmin'), c.crear);
router.put('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.eliminar);
router.patch('/:id/stock', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.descontarStock);

module.exports = router;