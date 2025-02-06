import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // Ovo omogućava da koristiš @ kao alias za src direktorijum
    }
  }
})
