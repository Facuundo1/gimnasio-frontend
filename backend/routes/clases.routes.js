const router = require('express').Router();
const c = require('../controllers/clases.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth');

// Listar clases
router.get(
  '/',
  verificarToken,
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.listar
);

// Obtener una clase por ID
router.get(
  '/:id',
  verificarToken,
  permitirRoles('usuario', 'admin', 'superadmin'),
  c.obtener
);

// Crear clase
router.post(
  '/',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.crear
);

// Actualizar clase
router.put(
  '/:id',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.actualizar
);

// Eliminar clase
router.delete(
  '/:id',
  verificarToken,
  permitirRoles('admin', 'superadmin'),
  c.eliminar
);

module.exports = router;
//Ahí definimos el CRUD con los métodos HTTP: GET para listar y obtener, POST para crear, PUT para modificar y DELETE para eliminar. En reservas además usamos PATCH para cancelar, porque cancelar no borra: solo cambia el estado.