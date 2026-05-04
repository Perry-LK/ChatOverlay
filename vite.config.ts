import { defineConfig } from 'vite';

// For GitHub Pages: set base to "/<repo-name>/" via env or override here.
// You can also pass --base=/ChatOverlay/ to vite build.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH ?? '/ChatOverlay/') : '/',
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false
  }
}));
