import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // This redirects any frontend call to /api to your Node.js server
      '/api': {
        target: 'https://digital-task-completion-analytics.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
