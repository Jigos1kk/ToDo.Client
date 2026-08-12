import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Бэкенды не настраивают CORS, поэтому в dev-режиме запросы
// проксируются через Vite: /api/auth/* -> ToDo.Auth, остальные /api/* -> ToDo.Core.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:5057',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5056',
        changeOrigin: true,
      },
    },
  },
});
