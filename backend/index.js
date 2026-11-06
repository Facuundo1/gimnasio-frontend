require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', require('./routes'));

// Ruta inexistente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Errores no controlados
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
db.probarConexion().then((ok) => {
  if (!ok) process.exit(1);
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});