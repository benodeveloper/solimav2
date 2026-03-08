import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    env: loadEnv(mode, process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
}));
