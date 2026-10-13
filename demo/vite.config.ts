import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@data': path.resolve(__dirname, '../src/data'),
      '@bd': path.resolve(__dirname, '../src'),
    },
  },
  assetsInclude: ['**/*.md'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        landing: path.resolve(__dirname, 'index.html'),
        demo: path.resolve(__dirname, 'demo/index.html'),
        docs: path.resolve(__dirname, 'docs/index.html'),
      },
    },
  },
});
