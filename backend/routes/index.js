const router = require('express').Router(); // Crea un router: una mini-aplicación que solo agrupa rutas
//junta las rutas de cada entidad, por ejemplo /api/clases, /api/productos, /api/reservas, /api/usuarios y /api/auth.
// use(ruta_base, subrouter): delega todas las URLs que empiecen con /clases.
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

// Se exporta para que index.js lo monte en /api.
module.exports = router;