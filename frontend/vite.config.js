import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://127.0.0.1:8000',
      '/ask': 'http://127.0.0.1:8000',
      '/status': 'http://127.0.0.1:8000',
      '/documents': 'http://127.0.0.1:8000',
      '/sync-drive': 'http://127.0.0.1:8000',
      '/recommend-questions': 'http://127.0.0.1:8000',
    }
  }
})
