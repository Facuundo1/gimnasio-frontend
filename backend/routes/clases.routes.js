const router = require('express').Router();
const c = require('../controllers/clases.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');
//Las rutas son la puerta de entrada de la API. Cada una dice: cuando llega este método HTTP a esta URL, ejecutá este controlador. No tienen lógica adentro, solo definen el camino.
router.get('/', c.listar); //En la ruta también aplicamos los middlewares de seguridad. verificarToken comprueba que el usuario esté logueado y lee su identidad del token.
router.get('/:id', c.obtener);
router.post('/', verificarToken, permitirRoles('admin', 'superadmin'), c.crear);
router.put('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin', 'superadmin'), c.eliminar);

module.exports = router;
//Ahí definimos el CRUD con los métodos HTTP: GET para listar y obtener, POST para crear, PUT para modificar y DELETE para eliminar. En reservas además usamos PATCH para cancelar, porque cancelar no borra: solo cambia el estado.