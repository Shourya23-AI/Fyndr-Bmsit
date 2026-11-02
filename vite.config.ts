import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps the build portable. The app uses hash URLs (#/jobs), exactly like the old site.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [react()],
    // In dev, /api calls go to your running Fyndr server (node server.js), so sign-in and the dashboard work locally.
    server: { proxy: { '/api': env.VITE_DEV_API || 'http://localhost:3000' } },
    build: { target: 'es2022', sourcemap: true },
  };
});
