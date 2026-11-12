require('dotenv').config();
const express = require('express');    /// Carga las variables del archivo .env (DB_HOST, JWT_SECRET, PORT...) dentro de process.env.
const cors = require('cors');
const db = require('./db');

const app = express(); //Crea la aplicación Express: es el objeto que representa al servidor.
app.use(cors()); // Middleware: permite llamadas desde otros orígenes (ej. el front en el puerto 5173).
app.use(express.json()); // Middleware: convierte el cuerpo JSON de la petición en un objeto JavaScript (req.body).

// Monta el router principal: todas las rutas de routes/index.js quedan bajo /api.
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', require('./routes'));

// Ruta inexistente
// Un middleware sin ruta se ejecuta para cualquier petición que llegue hasta acá
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Errores no controlados
// Con 4 parámetros, Express lo trata como manejador de errores (recibe lo que llega con next(err)).
app.use((err, req, res, next) => {
  console.error(err);
  switch (err.code) {
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ error: 'Hace referencia a un registro que no existe' });
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({ error: 'No se puede eliminar: tiene registros relacionados' });
    case 'ER_DUP_ENTRY':
      return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
    case 'ER_BAD_NULL_ERROR':
      return res.status(400).json({ error: 'Falta un dato obligatorio' });
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
    case 'ER_WARN_DATA_OUT_OF_RANGE':
      return res.status(400).json({ error: 'Un dato tiene formato o valor inválido' });
    default:
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000; // Devuelve una promesa: true si MySQL respondió. Recién ahí se abre el puerto.
db.probarConexion().then((ok) => {
  if (!ok) process.exit(1);
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});