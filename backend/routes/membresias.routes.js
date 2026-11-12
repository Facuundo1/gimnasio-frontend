const router = require('express').Router();
const c = require('../controllers/membresias.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.get('/', verificarToken, c.listar);
router.get('/:id', verificarToken, c.obtener);

router.post('/', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.crear);
router.put('/:id', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin'), c.eliminar);

module.exports = router;