import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: !isSsrBuild ? {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('motion-dom')) {
              return 'vendor-motion';
            }
            if (id.includes('@radix-ui') || id.includes('@floating-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack';
            }
          }
        },
      },
    },
  } : undefined,
  // When building the SSR bundle, do not bundle packages that
  // must run in Node and/or have no browser equivalent.
  ssr: {
    noExternal: [
      // keep these inlined so the SSR bundle is self-contained
      'wouter',
    ],
  },
}));
