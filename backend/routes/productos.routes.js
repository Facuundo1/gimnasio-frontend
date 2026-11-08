const router = require('express').Router();
const c = require('../controllers/productos.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.get('/', verificarToken, c.listar);
router.get('/:id', verificarToken, c.obtener);
router.post('/', verificarToken, permitirRoles('admin'), c.crear);
router.put('/:id', verificarToken, permitirRoles('admin'), c.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin'), c.eliminar);

module.exports = router;