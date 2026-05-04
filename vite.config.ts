import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Default: standard repo-hosted GitHub Pages under "/<repo-name>/".
// Override BASE_PATH=/ for a custom domain, or set another subpath as needed.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH ?? '/ChatOverlay/') : '/',
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: here('./index.html'),
        customise: here('./customise/index.html'),
      },
    },
  }
}));
