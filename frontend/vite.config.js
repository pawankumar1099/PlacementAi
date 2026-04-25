import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})