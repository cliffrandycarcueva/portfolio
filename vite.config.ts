import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync } from 'node:fs';

export default defineConfig({
  base: '/react/',
  plugins: [
    {
      name: 'portfolio-entry',
      configureServer(server) {
        const publicEntries = new Set(readdirSync(server.config.publicDir));
        server.middlewares.use((req, res, next) => {
          const pathname = req.url?.split('?')[0] ?? '';
          if (pathname === '/') {
            res.writeHead(302, { Location: '/react/' });
            res.end();
            return;
          }
          // Public assets have root URLs in both apps. Let Vite serve them
          // through its base-path middleware during development as well.
          if (publicEntries.has(pathname.split('/')[1])) {
            req.url = `/react${req.url}`;
          }
          next();
        });
      },
    },
    react(),
    tailwindcss(),
  ],
  build: { outDir: 'dist/react', copyPublicDir: false },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/angular': { target: 'http://127.0.0.1:4201', ws: true } },
  },
});
