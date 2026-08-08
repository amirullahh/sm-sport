/**
 * @file lib/db.ts
 * @description Inisialisasi koneksi database SQLite menggunakan better-sqlite3.
 * Mengatur PRAGMA untuk foreign keys dan WAL journal mode.
 * File database disimpan di path yang ditentukan oleh environment variable DATABASE_PATH.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Path ke file database SQLite.
 * Di-resolve absolut terhadap working directory proyek, sehingga aman
 * tidak peduli dari mana proses dijalankan (dev, start, atau test).
 */
const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/sm-sport.db');

/** Pastikan direktori data ada */
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * Instance database SQLite.
 * Menggunakan better-sqlite3 yang bersifat synchronous,
 * sehingga transaction bisa dijamin atomik (tidak ada request lain yang bisa nyelip).
 */
const db = new Database(DB_PATH);

// Aktifkan foreign keys untuk integritas referensial
db.pragma('foreign_keys = ON');
// Gunakan WAL mode untuk performa baca yang lebih baik
db.pragma('journal_mode = WAL');

export { db };
export default db;
