const router = require('express').Router();

router.use('/clases', require('./clases.routes'));
// A medida que existan, se agregan:
router.use('/usuarios', require('./usuarios.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/reservas', require('./reservas.routes'));
// router.use('/pedidos', require('./pedidos.routes'));

router.use('/detallepedido', require('./detallepedido.routes'));

router.use('/gimnasio', require('./gimnasio.routes'));

router.use('/membresias', require('./membresias.routes'));

router.use('/pedidocarrito', require('./pedidocarrito.routes'));

router.use('/profesores', require('./profesores.routes'));

router.use('/auth', require('./auth.routes'));

module.exports = router;