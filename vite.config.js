import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy all non-asset paths to the FastAPI backend (port 8000).
// In production set VITE_API_URL to your deployed backend URL and api.js picks it up.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    proxy: {
      '^/(?!src|@|node_modules|favicon|assets|index\.html)': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
