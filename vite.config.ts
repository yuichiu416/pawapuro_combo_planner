import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Vite Configuration
 * Includes: React, Tailwind CSS v4, and Path Aliasing.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      /** * Maps the '@' symbol to the 'src' directory for cleaner imports.
       * Requires corresponding 'paths' setup in tsconfig.json.
       */
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Vitest configuration for unit testing logic files
  test: {
    globals: true,
    environment: 'jsdom',
  },
});