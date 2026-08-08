import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Vitest 4: equivalent dari singleFork (v3).
    // Mencegah worker crash di CI saat better-sqlite3 (native module) di-fork.
    // Tiap test file harus panggil vi.resetModules() agar dapat db instance baru.
    maxWorkers: 1,
    isolate: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
