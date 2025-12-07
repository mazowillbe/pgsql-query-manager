import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default {
  server: {
    allowedHosts: ['pgsql-query-manager.onrender.com'],
    host: true,
    port: 3000
  }
}
