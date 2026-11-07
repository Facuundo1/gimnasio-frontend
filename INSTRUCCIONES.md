# Cómo integrar el frontend

1. Copiá estos archivos sobre la raíz de tu repo (reemplazan los del template de Vite):
   `index.html`, `package.json`, `vite.config.js`, `.env.example` y la carpeta `src/`.
2. Borrá lo que sobra del template: `src/App.css` y `src/assets/` (si no lo usan).
   Las carpetas vacías con `.gitkeep` (`features/classes`, `pages/...`) pueden quedar o borrarse.
3. En la carpeta del frontend: `npm install` (suma `react-router-dom`).
4. Levantá el backend (`cd backend && npm start`, puerto 3000) y después `npm run dev`.
   El front llama a `/api/...` y Vite lo reenvía a `http://localhost:3000`.

Buscá `TODO(backend)` en el código para ver los puntos que dependen de mejoras del servidor.
