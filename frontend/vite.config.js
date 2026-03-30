import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:9191',
      '/api': 'http://localhost:9191',
      '/user': 'http://localhost:9191',
      '/workflow': 'http://localhost:9191',
    },
  },
})
