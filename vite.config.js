import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
}); 