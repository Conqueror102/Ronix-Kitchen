import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          router: ['react-router-dom'],
          forms: ['react-hook-form'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
