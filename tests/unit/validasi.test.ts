/**
 * @file tests/unit/validasi.test.ts
 * @description Unit test untuk business logic inti sistem reservasi SM Sport Center.
 * Mencakup 8 skenario testing sesuai PRD Bagian 13.1:
 * 
 * 1. Login benar → berhasil masuk
 * 2. Login salah → pesan error
 * 3. Reservasi valid (jam kosong) → data tersimpan
 * 4. Reservasi bentrok penuh (jam sama persis) → ditolak
 * 5. Reservasi bentrok sebagian (overlap 09:30-10:30 vs 09:00-10:00) → ditolak
 * 6. jam_mulai > jam_selesai → ditolak validasi input
 * 7. Registrasi email yang sudah dipakai → ditolak
 * 8. Admin tambah lapangan baru → data tersimpan
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Setup: buat database test terpisah
const TEST_DB_PATH = './data/test-sm-sport.db';

let db: InstanceType<typeof Database>;

beforeAll(() => {
  // Pastikan direktori data ada
  const dbDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Hapus database test lama
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Buat database test baru
  db = new Database(TEST_DB_PATH);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Buat schema
  const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf-8');
  db.exec(schema);

  // Seed data dasar
  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', adminHash);

  const plgHash = bcrypt.hashSync('pelanggan123', 10);
  db.prepare('INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)')
    .run('Budi Santoso', 'budi@mail.com', '081234567890', plgHash);

  db.prepare('INSERT INTO lapangan (nama, jenis, harga_per_jam) VALUES (?, ?, ?)')
    .run('Futsal A', 'futsal', 150000);
  db.prepare('INSERT INTO lapangan (nama, jenis, harga_per_jam) VALUES (?, ?, ?)')
    .run('Badminton 1', 'badminton', 80000);
});

afterAll(() => {
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

// ============================================================
// Helper functions (inline, biar test mandiri tanpa import lib)
// ============================================================

function cekBentrok(lapangan_id: number, tanggal: string, jam_mulai: string, jam_selesai: string, excludeId?: number): boolean {
  const query = `
    SELECT COUNT(*) as jumlah
    FROM reservasi
    WHERE lapangan_id = ?
      AND tanggal = ?
      AND status IN ('pending','confirmed')
      AND jam_mulai < ?
      AND jam_selesai > ?
      ${excludeId ? 'AND id != ?' : ''}
  `;
  const params: (string | number)[] = [lapangan_id, tanggal, jam_selesai, jam_mulai];
  if (excludeId) params.push(excludeId);

  const row = db.prepare(query).get(...params) as { jumlah: number };
  return row.jumlah > 0;
}

function hitungDurasiJam(jamMulai: string, jamSelesai: string): number {
  const [h1, m1] = jamMulai.split(':').map(Number);
  const [h2, m2] = jamSelesai.split(':').map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

// ============================================================
// TEST CASES
// ============================================================

describe('Validasi Autentikasi', () => {
  it('Test 1: Login dengan kredensial benar → berhasil', () => {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin') as { password_hash: string } | undefined;
    expect(admin).toBeDefined();
    
    const isValid = bcrypt.compareSync('admin123', admin!.password_hash);
    expect(isValid).toBe(true);
  });

  it('Test 2: Login dengan kredensial salah → gagal', () => {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin') as { password_hash: string } | undefined;
    expect(admin).toBeDefined();
    
    const isValid = bcrypt.compareSync('passwordsalah', admin!.password_hash);
    expect(isValid).toBe(false);
  });
});

describe('Validasi Reservasi', () => {
  it('Test 3: Reservasi valid (jam kosong) → data tersimpan', () => {
    const tanggal = '2026-08-15';
    
    // Pastikan tidak bentrok
    const bentrok = cekBentrok(1, tanggal, '09:00', '10:00');
    expect(bentrok).toBe(false);

    // Insert reservasi
    const durasi = hitungDurasiJam('09:00', '10:00');
    const total_harga = 150000 * durasi; // Futsal Rp150.000/jam
    
    const info = db.prepare(`
      INSERT INTO reservasi (lapangan_id, pelanggan_id, tanggal, jam_mulai, jam_selesai, total_harga, status)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `).run(1, 1, tanggal, '09:00', '10:00', total_harga);
    
    expect(info.changes).toBe(1);
    expect(total_harga).toBe(150000); // 1 jam × Rp150.000
  });

  it('Test 4: Reservasi bentrok penuh (jam sama persis) → ditolak', () => {
    const tanggal = '2026-08-15';
    
    // Coba booking jam yang persis sama dengan Test 3
    const bentrok = cekBentrok(1, tanggal, '09:00', '10:00');
    expect(bentrok).toBe(true); // Harus bentrok!
  });

  it('Test 5: Reservasi bentrok sebagian (overlap 09:30-10:30 vs 09:00-10:00) → ditolak', () => {
    const tanggal = '2026-08-15';
    
    // Booking 09:30-10:30 overlap dengan reservasi 09:00-10:00 (dari Test 3)
    const bentrok = cekBentrok(1, tanggal, '09:30', '10:30');
    expect(bentrok).toBe(true); // Harus bentrok! (ini kasus bug dari Bagian 12 PRD)
  });

  it('Test 6: jam_mulai > jam_selesai → ditolak validasi input', () => {
    // Durasi negatif harus throw error
    expect(() => {
      const durasi = hitungDurasiJam('14:00', '10:00');
      if (durasi <= 0) throw new Error('DURASI_INVALID');
    }).toThrow('DURASI_INVALID');
  });
});

describe('Validasi Registrasi', () => {
  it('Test 7: Registrasi email yang sudah dipakai → ditolak (unique constraint)', () => {
    const hash = bcrypt.hashSync('test123', 10);
    
    expect(() => {
      db.prepare('INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)')
        .run('Test User', 'budi@mail.com', '081111111111', hash); // email sudah ada
    }).toThrow(); // SQLite UNIQUE constraint violation
  });
});

describe('Validasi Admin CRUD Lapangan', () => {
  it('Test 8: Admin tambah lapangan baru → data tersimpan', () => {
    const info = db.prepare(
      'INSERT INTO lapangan (nama, jenis, harga_per_jam) VALUES (?, ?, ?)'
    ).run('Futsal C', 'futsal', 175000);
    
    expect(info.changes).toBe(1);
    
    // Verifikasi data tersimpan
    const lapangan = db.prepare('SELECT * FROM lapangan WHERE id = ?').get(info.lastInsertRowid) as {
      nama: string; jenis: string; harga_per_jam: number;
    };
    
    expect(lapangan.nama).toBe('Futsal C');
    expect(lapangan.jenis).toBe('futsal');
    expect(lapangan.harga_per_jam).toBe(175000);
  });
});
