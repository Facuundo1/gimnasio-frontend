const router = require('express').Router();
const c = require('../controllers/usuarios.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

// Todo el ABM de usuarios es solo para admin y superadmin
router.use(verificarToken, permitirRoles('admin', 'superadmin'));

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;