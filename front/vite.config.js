import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api/* é redirecionado para o back-end Spring local
    proxy: {
      '/api': {
        target: 'http://98.92.208.21:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
