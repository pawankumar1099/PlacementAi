import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'https://placementai-1.onrender.com',
        changeOrigin: true
      }
    }
  }
})