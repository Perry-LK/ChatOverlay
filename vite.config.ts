import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ command, mode }) => {
  const environment = mode === 'published' ? 'published' : 'local';
  const environmentConfig = here(`./src/environments/${environment}/config.json`);

  return {
    root: here('./src'),
    publicDir: here('./src/public'),
    base: command === 'build' && environment === 'published'
      ? (process.env.BASE_PATH ?? '/ChatOverlay/')
      : '/',
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
    plugins: [{
      name: 'environment-config',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
          if (pathname !== '/config.environment.json' || !existsSync(environmentConfig)) {
            next();
            return;
          }
          response.setHeader('content-type', 'application/json; charset=utf-8');
          response.setHeader('cache-control', 'no-store');
          response.end(readFileSync(environmentConfig));
        });
      },
      buildStart() {
        if (!existsSync(environmentConfig)) return;
        const source = readFileSync(environmentConfig, 'utf8');
        JSON.parse(source);
        this.emitFile({ type: 'asset', fileName: 'config.environment.json', source });
      },
    }],
    build: {
      target: 'es2020',
      outDir: here(`./${environment}`),
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        input: {
          main: here('./src/index.html'),
          chat: here('./src/chat/index.html'),
          customise: here('./src/customise/index.html'),
          alerts: here('./src/alerts/index.html'),
        },
      },
    },
  };
});
