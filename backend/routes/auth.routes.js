const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');

// POST: el cliente envía datos en el cuerpo (req.body). Ruta pública
router.post('/registro', c.registro);
router.post('/login', c.login);
// Primero verificarToken (llena req.usuario) y después c.perfil
router.get('/perfil', verificarToken, c.perfil);

module.exports = router;