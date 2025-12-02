// backend/vitest.config.js
import { defineConfig, configDefaults } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node', // Use 'node' environment for backend tests
    exclude: [...configDefaults.exclude, '**/frontend/**', 'node_modules/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
});
