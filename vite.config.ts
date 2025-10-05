// vite.config.js
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    server: {
      port: 5000,
      host: '0.0.0.0',
      strictPort: true,
      // HMR solo afecta "vite dev", no preview
      hmr: { clientPort: 443, host: process.env.REPLIT_DEV_DOMAIN || 'localhost' }
    },
    preview: {
      port: 5000,
      host: '0.0.0.0',
      strictPort: true,
      // 🔑 Desactiva el bloqueo de host en preview
      allowedHosts: true
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: { '@': path.resolve(process.cwd(), '.') }
    }
  }
})
