import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Reuse the favicon package created for Chatterly in both development and builds.
  publicDir: '../favicon (1)',
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/users': 'http://localhost:5000',
      '/posts': 'http://localhost:5000',
      '/comments': 'http://localhost:5000',
      '/upload': 'http://localhost:5000',
      '/notifications': 'http://localhost:5000',
      '/password': 'http://localhost:5000',
      '/images': 'http://localhost:5000',
    },
  },
});
