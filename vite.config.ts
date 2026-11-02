import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps the build portable (Firebase Hosting, GitHub Pages, or the Node server in /server).
// The app uses hash URLs (#/jobs), exactly like the old site, so old links and saved bookmarks keep working.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: true },
});
