import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true' ? {
        host: 'localhost'
      } : false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/api/suggestions': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/api/ai': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/api/data-integration': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/api/ranking': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
  };
});
