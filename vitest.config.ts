import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // better-sqlite3 = native C++ module.
    // pool 'forks' (child_process.fork) CRASH di CI Ubuntu karena
    // native binary tidak bisa di-load di forked process.
    // pool 'threads' (worker_threads) jalankan di SAME PROCESS → aman.
    // singleThread: hanya 1 thread → thread-safety tidak jadi masalah.
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
