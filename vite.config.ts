import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import app from './server.ts';

process.env.VITE_DEV = 'true';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/uploads'))) {
            app(req as any, res as any, next);
          } else {
            next();
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
