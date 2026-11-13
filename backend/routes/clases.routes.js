const router = require('express').Router();
const c = require('../controllers/clases.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

const soloAdmin = permitirRoles('admin', 'superadmin');

// Consultar: cualquier usuario logueado (el socio necesita ver las clases)
router.get('/', verificarToken, c.listar);
router.get('/:id', verificarToken, c.obtener);

// Alta, modificación y baja: solo admin y superadmin
router.post('/', verificarToken, soloAdmin, c.crear);
router.put('/:id', verificarToken, soloAdmin, c.actualizar);
router.delete('/:id', verificarToken, soloAdmin, c.eliminar);

module.exports = router;