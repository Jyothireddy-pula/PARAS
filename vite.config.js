import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['@react-google-maps/api'],
          ui: ['framer-motion', 'react-icons']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-google-maps/api', 'framer-motion']
  }
})
