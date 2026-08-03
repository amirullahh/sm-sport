/**
 * @file db/seed.ts
 * @description Script untuk inisialisasi database: membuat tabel dari schema.sql
 * dan mengisi data awal (seed) untuk lapangan, admin, dan pelanggan contoh.
 * 
 * Jalankan dengan: npm run db:init
 * atau: npx tsx db/seed.ts
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Path ke database
const DB_PATH = process.env.DATABASE_PATH || './data/sm-sport.db';

// Pastikan direktori data ada
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Hapus database lama jika ada (fresh start)
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  Database lama dihapus');
}

// Buat koneksi baru
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

console.log('📦 Memulai inisialisasi database...\n');

// 1. Jalankan schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);
console.log('✅ Schema berhasil dibuat (4 tabel + 2 index)');

// 2. Seed data lapangan
const insertLapangan = db.prepare(
  `INSERT INTO lapangan (nama, jenis, harga_per_jam) VALUES (?, ?, ?)`
);

const lapanganData = [
  ['Futsal A', 'futsal', 150000],
  ['Futsal B', 'futsal', 150000],
  ['Badminton 1', 'badminton', 80000],
  ['Badminton 2', 'badminton', 80000],
  ['Badminton 3', 'badminton', 80000],
] as const;

for (const [nama, jenis, harga] of lapanganData) {
  insertLapangan.run(nama, jenis, harga);
}
console.log('✅ 5 lapangan berhasil di-seed (2 futsal + 3 badminton)');

// 3. Seed admin (password di-hash, JANGAN plaintext)
const adminHash = bcrypt.hashSync('admin123', 10);
db.prepare(`INSERT INTO admin (username, password_hash) VALUES (?, ?)`)
  .run('admin', adminHash);
console.log('✅ 1 admin berhasil di-seed (admin / admin123)');

// 4. Seed pelanggan contoh
const plgHash = bcrypt.hashSync('pelanggan123', 10);

const insertPelanggan = db.prepare(
  `INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)`
);

const pelangganData = [
  ['Budi Santoso', 'budi@mail.com', '081234567890'],
  ['Siti Aminah', 'siti@mail.com', '081298765432'],
] as const;

for (const [nama, email, no_hp] of pelangganData) {
  insertPelanggan.run(nama, email, no_hp, plgHash);
}
console.log('✅ 2 pelanggan contoh berhasil di-seed');

// 5. Seed beberapa reservasi contoh
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const insertReservasi = db.prepare(`
  INSERT INTO reservasi (lapangan_id, pelanggan_id, tanggal, jam_mulai, jam_selesai, total_harga, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertReservasi.run(1, 1, today, '09:00', '11:00', 300000, 'confirmed');
insertReservasi.run(1, 2, today, '13:00', '14:00', 150000, 'confirmed');
insertReservasi.run(3, 1, today, '10:00', '12:00', 160000, 'pending');
insertReservasi.run(2, 2, tomorrow, '15:00', '17:00', 300000, 'confirmed');
insertReservasi.run(4, 1, tomorrow, '08:00', '10:00', 160000, 'confirmed');
console.log('✅ 5 reservasi contoh berhasil di-seed');

// Tutup koneksi
db.close();

console.log('\n🎉 Database berhasil diinisialisasi!');
console.log(`📍 Lokasi: ${path.resolve(DB_PATH)}`);
console.log('\n📋 Akun yang tersedia:');
console.log('   Admin    → username: admin, password: admin123');
console.log('   Pelanggan → email: budi@mail.com, password: pelanggan123');
console.log('   Pelanggan → email: siti@mail.com, password: pelanggan123');
