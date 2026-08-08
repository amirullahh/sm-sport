import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Vitest 4: singleFork diganti maxWorkers.
    // Mencegah worker crash di CI saat better-sqlite3 (native module) di-load.
    maxWorkers: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
