import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El front llama a /api/... y Vite lo reenvía al backend (evita problemas de CORS en desarrollo).
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})

