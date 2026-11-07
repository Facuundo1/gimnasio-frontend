const router = require('express').Router();
const c = require('../controllers/reservas.controller');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.patch('/:id/cancelar', c.cancelar);
router.delete('/:id', c.eliminar);

module.exports = router;
