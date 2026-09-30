import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import app from './server.ts';

export default defineConfig(({ mode }) => {
  // Load all environment variables from environment & .env files
  const env = loadEnv(mode, process.cwd(), '');
  const clerkKey = (
    env.CLERK_PUBLISHABLE_KEY ||
    env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    ''
  ).trim();

  return {
    // Crucial for Cloudflare Pages: Expose CLERK_ and VITE_ env prefixes to browser bundle
    envPrefix: ['VITE_', 'CLERK_'],
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
    define: {
      __CLERK_KEY__: JSON.stringify(clerkKey),
      'import.meta.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
      'process.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkKey),
    },
  };
});
