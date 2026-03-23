/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

import { cloudflare } from '@cloudflare/vite-plugin';

/**
 * Vite Configuration
 * Includes: React, Tailwind CSS v4, and Path Aliasing.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
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
    // This should now be recognized
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
