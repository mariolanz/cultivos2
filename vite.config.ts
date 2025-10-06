import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: { clientPort: 443, host: process.env.REPLIT_DEV_DOMAIN || 'localhost' }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true
  },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), '.') }
  }
})
