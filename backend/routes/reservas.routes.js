const router = require('express').Router();
const c = require('../controllers/reservas.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

router.use(verificarToken);
// Consultas: cada usuario ve sus propias reservas
router.get('/', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.listar);

router.get('/:id', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.obtener);

// Crear reservas
router.post('/', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.crear);

// Modificar reservas
router.put('/:id', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.actualizar);

// Cancelar reservas
router.patch('/:id/cancelar', verificarToken, permitirRoles('usuario', 'admin', 'superadmin'), c.cancelar);

// Eliminar: administradores
router.delete('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.eliminar);

module.exports = router;