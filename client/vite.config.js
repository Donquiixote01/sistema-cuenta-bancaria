import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      // En desarrollo, /api se redirige al backend Express
      proxy: {
        '/api': env.VITE_PROXY_TARGET || 'http://localhost:4000',
      },
    },
  };
});
