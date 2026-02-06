import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Enables global test APIs like 'describe', 'it', 'expect'
      globals: true,
      // Essential for React Testing Library
      environment: 'jsdom',
      // The setup file we discussed previously
      setupFiles: ['./src/setupTests.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
);