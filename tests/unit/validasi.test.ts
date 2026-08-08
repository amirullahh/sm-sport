/**
 * @file tests/unit/validasi.test.ts
 * @description Unit test untuk business logic inti sistem reservasi SM Sport Center.
 *
 * PENTING: Test ini meng-import FUNGSI PRODUKSI dari lib/validasi & lib/db,
 * bukan mendefinisikan ulang logika yang sama. Dengan begitu, bug yang
 * diperbaiki di kode produksi otomatis terverifikasi oleh test ini.
 *
 * Mencakup skenario sesuai PRD:
 * 1. Login benar → berhasil
 * 2. Login salah → gagal
 * 3. Reservasi valid (jam kosong) → tersimpan, harga benar
 * 4. Reservasi bentrok penuh → ditolak
 * 5. Reservasi bentrok sebagian (overlap) → ditolak
 * 6. jam_mulai > jam_selesai → ditolak
 * 7. Registrasi email yang sudah dipakai → ditolak
 * 8. Admin tambah lapangan baru → tersimpan
 * + Validasi tanggal masa lalu & jam operasional (fitur baru).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import type BetterSqlite3 from 'better-sqlite3';

// Path database test — di-resolve absolut supaya tidak bergantung cwd.
const TEST_DB_PATH = path.resolve(process.cwd(), './data/test-sm-sport.db');

// Referensi ke modul produksi (diisi lewat dynamic import di beforeAll,
// SETELAH process.env.DATABASE_PATH di-set — penting agar lib/db.ts
// terhubung ke database test, bukan database produksi).
let db: InstanceType<typeof BetterSqlite3>;
let cekBentrok: typeof import('@/lib/validasi').cekBentrok;
let hitungDurasiJam: typeof import('@/lib/validasi').hitungDurasiJam;
let buatReservasi: typeof import('@/lib/validasi').buatReservasi;
let validasiTanggalMasaLalu: typeof import('@/lib/validasi').validasiTanggalMasaLalu;
let validasiJamOperasional: typeof import('@/lib/validasi').validasiJamOperasional;
let ReservasiSchema: typeof import('@/lib/validasi').ReservasiSchema;

beforeAll(async () => {
  // Hapus database test lama untuk memastikan kondisi bersih.
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(TEST_DB_PATH + suffix)) {
      fs.unlinkSync(TEST_DB_PATH + suffix);
    }
  }

  // Arahkan lib/db ke database test SEBELUM import modul produksi.
  process.env.DATABASE_PATH = TEST_DB_PATH;

  const dbModule = await import('@/lib/db');
  const validasi = await import('@/lib/validasi');
  db = dbModule.default;
  cekBentrok = validasi.cekBentrok;
  hitungDurasiJam = validasi.hitungDurasiJam;
  buatReservasi = validasi.buatReservasi;
  validasiTanggalMasaLalu = validasi.validasiTanggalMasaLalu;
  validasiJamOperasional = validasi.validasiJamOperasional;
  ReservasiSchema = validasi.ReservasiSchema;

  // Setup schema dari file schema.sql produksi.
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf-8');
  db.exec(schema);

  // Seed data dasar.
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
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(TEST_DB_PATH + suffix)) {
      fs.unlinkSync(TEST_DB_PATH + suffix);
    }
  }
});

// ============================================================
// TEST CASES
// ============================================================

describe('Validasi Autentikasi', () => {
  it('Test 1: Login dengan kredensial benar → berhasil', () => {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin') as
      { password_hash: string } | undefined;
    expect(admin).toBeDefined();

    const isValid = bcrypt.compareSync('admin123', admin!.password_hash);
    expect(isValid).toBe(true);
  });

  it('Test 2: Login dengan kredensial salah → gagal', () => {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin') as
      { password_hash: string } | undefined;
    expect(admin).toBeDefined();

    const isValid = bcrypt.compareSync('passwordsalah', admin!.password_hash);
    expect(isValid).toBe(false);
  });
});

describe('Validasi Reservasi (kode produksi)', () => {
  const tanggal = '2026-08-15';

  it('Test 3: Reservasi valid (jam kosong) → tersimpan, harga benar', () => {
    const result = buatReservasi({
      lapangan_id: 1,
      pelanggan_id: 1,
      tanggal,
      jam_mulai: '09:00',
      jam_selesai: '10:00',
    });

    expect(result.durasi).toBe(1);
    expect(result.total_harga).toBe(150000); // 1 jam × Rp150.000
    expect(result.id).toBeGreaterThan(0);
  });

  it('Test 4: Reservasi bentrok penuh (jam sama persis) → ditolak', () => {
    const bentrok = cekBentrok({
      lapangan_id: 1,
      tanggal,
      jam_mulai: '09:00',
      jam_selesai: '10:00',
    });
    expect(bentrok).toBe(true); // bentrok dengan Test 3
  });

  it('Test 5: Reservasi bentrok sebagian (overlap 09:30-10:30 vs 09:00-10:00) → ditolak', () => {
    const bentrok = cekBentrok({
      lapangan_id: 1,
      tanggal,
      jam_mulai: '09:30',
      jam_selesai: '10:30',
    });
    expect(bentrok).toBe(true); // kasus bug overlap dari PRD
  });

  it('buatReservasi menolak jadwal bentrok secara atomik', () => {
    expect(() =>
      buatReservasi({
        lapangan_id: 1,
        pelanggan_id: 1,
        tanggal,
        jam_mulai: '09:30',
        jam_selesai: '10:30',
      })
    ).toThrow('BENTROK_JADWAL');
  });

  it('Test 6: jam_mulai > jam_selesai → ditolak (durasi negatif)', () => {
    expect(() => hitungDurasiJam('14:00', '10:00')).toThrow('DURASI_INVALID');
  });

  it('Tidak bentrok untuk jadwal berurutan (10:00-11:00 setelah 09:00-10:00)', () => {
    expect(cekBentrok({ lapangan_id: 1, tanggal, jam_mulai: '10:00', jam_selesai: '11:00' })).toBe(false);
  });
});

describe('Validasi Tanggal Masa Lalu', () => {
  it('Tanggal kemarin → ditolak', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(validasiTanggalMasaLalu(yesterday, '09:00')).toBe(false);
  });

  it('Tanggal besok → diterima', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    expect(validasiTanggalMasaLalu(tomorrow, '09:00')).toBe(true);
  });

  it('Hari ini dengan jam yang sudah lewat → ditolak', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validasiTanggalMasaLalu(today, '00:00')).toBe(false);
  });

  it('Hari ini dengan jam yang belum lewat → diterima', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validasiTanggalMasaLalu(today, '23:59')).toBe(true);
  });
});

describe('Validasi Jam Operasional', () => {
  it('Jam dalam rentang operasional (08:00-23:00) → diterima', () => {
    expect(validasiJamOperasional('08:00', '22:00')).toBe(true);
    expect(validasiJamOperasional('09:30', '23:00')).toBe(true);
  });

  it('Mulai sebelum 08:00 → ditolak', () => {
    expect(validasiJamOperasional('07:00', '09:00')).toBe(false);
  });

  it('Selesai setelah 23:00 → ditolak', () => {
    expect(validasiJamOperasional('22:00', '23:30')).toBe(false);
    expect(validasiJamOperasional('22:00', '24:00')).toBe(false);
  });
});

describe('Validasi Schema Reservasi', () => {
  it('Menerima data valid dengan catatan', () => {
    const result = ReservasiSchema.safeParse({
      lapangan_id: 1,
      tanggal: '2026-08-15',
      jam_mulai: '09:00',
      jam_selesai: '10:00',
      catatan: 'Bawa sepatu sendiri',
    });
    expect(result.success).toBe(true);
  });

  it('Menolak catatan lebih dari 255 karakter', () => {
    const result = ReservasiSchema.safeParse({
      lapangan_id: 1,
      tanggal: '2026-08-15',
      jam_mulai: '09:00',
      jam_selesai: '10:00',
      catatan: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
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

    const lapangan = db.prepare('SELECT * FROM lapangan WHERE id = ?').get(info.lastInsertRowid) as {
      nama: string; jenis: string; harga_per_jam: number;
    };
    expect(lapangan.nama).toBe('Futsal C');
    expect(lapangan.jenis).toBe('futsal');
    expect(lapangan.harga_per_jam).toBe(175000);
  });
});
