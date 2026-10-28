import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'] },
      },
    },
  },
  server: {
    port: 3106,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://localhost:3105', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
