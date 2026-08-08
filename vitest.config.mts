import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // better-sqlite3 = native C++ module yang tidak thread-safe.
    // Vitest 4 default pool = 'threads' → crash. Harus pakai 'forks'.
    pool: 'forks',
    // Jalankan file test secara sequential (tanpa spawn worker paralel).
    // Mencegah worker crash di CI (Ubuntu) saat load native module.
    fileParallelism: false,
    // Shared module state antar file → test pakai vi.resetModules() untuk fresh db.
    isolate: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
